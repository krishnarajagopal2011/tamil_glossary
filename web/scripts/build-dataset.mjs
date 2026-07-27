#!/usr/bin/env node
/**
 * Build the offline dataset that the packaged Android app reads.
 *
 *   node scripts/build-dataset.mjs [--out public/dataset]
 *
 * Postgres is the source of truth. This writes a versioned, sharded copy of it:
 *
 *   manifest.json   version, counts, per-shard hashes
 *   index.json      every headword, compact — powers the letter grid, the
 *                   A–Z index and the whole of search
 *   terms/A.json    full explanations, one shard per initial, fetched on demand
 *
 * Every shard carries its own hash, so a future admin build can ask the server
 * for the manifest, compare hashes, and download only the shards that changed
 * instead of shipping a new APK. Nothing here is app-specific — the same files
 * are served over HTTP by the website and read from disk inside the app.
 */
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";

const argv = process.argv.slice(2);
const outArg = argv.indexOf("--out");
const OUT = path.resolve(
  process.cwd(),
  outArg >= 0 ? argv[outArg + 1] : "public/dataset",
);

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Run this from web/ with .env.local loaded:\n" +
      "  node --env-file=.env.local scripts/build-dataset.mjs",
  );
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1, prepare: false });

/** Stable content hash: the same rows always produce the same version. */
function hash(value) {
  return createHash("sha256")
    .update(typeof value === "string" ? value : JSON.stringify(value))
    .digest("hex")
    .slice(0, 16);
}

async function writeJson(relative, value) {
  const file = path.join(OUT, relative);
  await mkdir(path.dirname(file), { recursive: true });
  const body = JSON.stringify(value);
  await writeFile(file, body, "utf8");
  return { bytes: Buffer.byteLength(body), hash: hash(body) };
}

async function main() {
  const [terms, categories, links, figures] = await Promise.all([
    sql`
      SELECT id, slug, en_word, ta_word, en_exp, ta_exp, initial
      FROM terms WHERE is_active ORDER BY lower(en_word), id
    `,
    sql`
      SELECT c.id, c.slug, c.name, c.name_ta, c.description, c.sort_order,
             (SELECT count(*)::int FROM term_categories tc
              JOIN terms t ON t.id = tc.term_id
              WHERE tc.category_id = c.id AND t.is_active) AS term_count
      FROM categories c WHERE c.is_active ORDER BY c.sort_order
    `,
    sql`
      SELECT tc.term_id, c.slug
      FROM term_categories tc
      JOIN categories c ON c.id = tc.category_id
      WHERE c.is_active ORDER BY c.sort_order
    `,
    sql`
      SELECT term_id, count(*)::int AS n
      FROM images WHERE is_active AND file_path IS NULL
      GROUP BY term_id
    `,
  ]);

  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  const catsByTerm = new Map();
  for (const { term_id, slug } of links) {
    if (!catsByTerm.has(term_id)) catsByTerm.set(term_id, []);
    catsByTerm.get(term_id).push(slug);
  }
  const figuresByTerm = new Map(figures.map((f) => [f.term_id, f.n]));

  await rm(OUT, { recursive: true, force: true });

  // ------------------------------------------------------------------ index
  // Tuples, not objects: the key names would otherwise repeat 5,062 times and
  // triple the file. Order is [id, slug, en_word, ta_word, initial].
  const index = terms.map((t) => [
    t.id,
    t.slug,
    t.en_word,
    t.ta_word ?? "",
    t.initial,
  ]);
  const indexInfo = await writeJson("index.json", index);

  // ----------------------------------------------------------------- shards
  // One shard per initial. It matches how the index screen is read, so opening
  // an entry usually needs the shard that was already fetched for its letter.
  const byLetter = new Map();
  for (const t of terms) {
    if (!byLetter.has(t.initial)) byLetter.set(t.initial, []);
    byLetter.get(t.initial).push({
      id: t.id,
      slug: t.slug,
      en_word: t.en_word,
      ta_word: t.ta_word,
      en_exp: t.en_exp,
      ta_exp: t.ta_exp,
      initial: t.initial,
      categories: catsByTerm.get(t.id) ?? [],
      missing_figures: figuresByTerm.get(t.id) ?? 0,
    });
  }

  const shards = {};
  const letters = [];
  for (const [initial, rows] of [...byLetter].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const name = initial === "#" ? "hash" : initial;
    const info = await writeJson(`terms/${name}.json`, rows);
    shards[initial] = { file: `terms/${name}.json`, ...info };
    letters.push({ initial, count: rows.length });
  }

  // --------------------------------------------------------------- manifest
  const manifest = {
    // Bumped by hand when the *shape* of these files changes; the app refuses
    // a dataset it does not know how to read.
    schema: 1,
    version: hash([indexInfo.hash, ...Object.values(shards).map((s) => s.hash)]),
    generatedAt: new Date().toISOString(),
    stats: {
      terms: terms.length,
      categories: categories.length,
      figures: [...figuresByTerm.values()].reduce((a, b) => a + b, 0),
    },
    letters,
    categories: categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      name_ta: c.name_ta,
      description: c.description,
      term_count: c.term_count,
    })),
    index: { file: "index.json", ...indexInfo },
    shards,
  };
  await writeJson("manifest.json", manifest);

  const total =
    indexInfo.bytes +
    Object.values(shards).reduce((a, s) => a + s.bytes, 0);
  console.log(
    `dataset ${manifest.version} → ${path.relative(process.cwd(), OUT)}\n` +
      `  ${terms.length.toLocaleString()} terms, ` +
      `${Object.keys(shards).length} shards, ` +
      `${(total / 1024 / 1024).toFixed(1)} MB\n` +
      `  index ${(indexInfo.bytes / 1024).toFixed(0)} KB · ` +
      `largest shard ${(
        Math.max(...Object.values(shards).map((s) => s.bytes)) / 1024
      ).toFixed(0)} KB`,
  );

  // Keep the category list honest: a slug used by a term but missing from the
  // category table would silently render as a blank chip in the app.
  const unknown = [...new Set(links.map((l) => l.slug))].filter(
    (s) => !categoryBySlug.has(s),
  );
  if (unknown.length) {
    console.warn(`  warning: unknown category slugs ${unknown.join(", ")}`);
  }
}

try {
  await main();
} finally {
  await sql.end();
}
