/**
 * The packaged app's data source: the same questions `lib/queries.ts` answers
 * against Postgres, answered instead from the bundled dataset.
 *
 * Nothing here touches the network unless an update store is attached, so the
 * app works with the radio off. Files are read through `resolve()`, which gives
 * a downloaded copy priority over the bundled one — that is the seam a future
 * admin build uses to push corrected entries without shipping a new APK.
 */
import {
  type Category,
  type LetterCount,
  type Stats,
  type Term,
  type TermRef,
  type TermWithCategories,
} from "../types";
import {
  type DatasetManifest,
  type IndexRow,
  SUPPORTED_SCHEMA,
} from "./manifest";

type ShardTerm = Term & { categories: string[]; missing_figures: number };

/**
 * Where an updated copy of a dataset file is kept once downloaded.
 * The website has no implementation (it always reads the bundle); the app
 * backs this with the device filesystem.
 */
export interface UpdateStore {
  read(file: string): Promise<string | null>;
  write(file: string, body: string): Promise<void>;
  clear(): Promise<void>;
}

export type SyncResult = {
  status: "current" | "updated" | "unavailable";
  from?: string;
  to?: string;
  files?: string[];
};

export class Glossary {
  readonly baseUrl: string;
  private readonly store?: UpdateStore;

  private manifest: DatasetManifest | null = null;
  private index: IndexRow[] = [];
  /** Lower-cased headwords, positionally matched to `index`, for search. */
  private enLower: string[] = [];
  private taLower: string[] = [];
  private bySlug = new Map<string, number>();
  private shards = new Map<string, Map<string, ShardTerm>>();
  private loading: Promise<void> | null = null;

  constructor({
    baseUrl = "/dataset",
    store,
  }: { baseUrl?: string; store?: UpdateStore } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.store = store;
  }

  // ------------------------------------------------------------------ files

  /** A downloaded file wins over the bundled one; either may be absent. */
  private async resolve(file: string): Promise<string> {
    const updated = await this.store?.read(file).catch(() => null);
    if (updated) return updated;

    const res = await fetch(`${this.baseUrl}/${file}`);
    if (!res.ok) {
      throw new Error(`dataset: cannot read ${file} (${res.status})`);
    }
    return res.text();
  }

  private async readJson<T>(file: string): Promise<T> {
    return JSON.parse(await this.resolve(file)) as T;
  }

  // ----------------------------------------------------------------- loading

  /** Idempotent: concurrent callers share one load. */
  load(): Promise<void> {
    this.loading ??= this.doLoad().catch((error) => {
      this.loading = null; // a failed load must not poison later attempts
      throw error;
    });
    return this.loading;
  }

  private async doLoad(): Promise<void> {
    const manifest = await this.readJson<DatasetManifest>("manifest.json");
    if (manifest.schema !== SUPPORTED_SCHEMA) {
      throw new Error(
        `dataset: schema ${manifest.schema} is not readable by this build ` +
          `(expected ${SUPPORTED_SCHEMA})`,
      );
    }

    const index = await this.readJson<IndexRow[]>(manifest.index.file);

    this.manifest = manifest;
    this.index = index;
    this.enLower = index.map(([, , en]) => en.toLowerCase());
    this.taLower = index.map(([, , , ta]) => ta.toLowerCase());
    this.bySlug = new Map(index.map((row, i) => [row[1], i]));
  }

  get ready(): boolean {
    return this.manifest !== null;
  }

  private require(): DatasetManifest {
    if (!this.manifest) throw new Error("dataset: call load() first");
    return this.manifest;
  }

  // ------------------------------------------------------------------ reads

  stats(): Stats {
    return this.require().stats;
  }

  version(): string {
    return this.require().version;
  }

  letterCounts(): LetterCount[] {
    return this.require().letters;
  }

  categories(): Category[] {
    return this.require().categories;
  }

  /** Every headword under one initial, alphabetical — the index screen. */
  listByLetter(initial: string): TermRef[] {
    return this.index
      .filter((row) => row[4] === initial)
      .map(toRef);
  }

  count(): number {
    return this.index.length;
  }

  async getTerm(slug: string): Promise<TermWithCategories | null> {
    const position = this.bySlug.get(slug);
    if (position === undefined) return null;

    const shard = await this.shard(this.index[position][4]);
    const row = shard.get(slug);
    if (!row) return null;

    const names = new Map(this.categories().map((c) => [c.slug, c]));
    return {
      ...row,
      categories: row.categories
        .map((s) => names.get(s))
        .filter((c) => c !== undefined)
        .map(({ slug, name, name_ta }) => ({ slug, name, name_ta })),
    };
  }

  /**
   * Where an entry falls within its letter, 1-based — the number the index
   * shows beside it and the entry screen repeats.
   */
  positionInLetter(slug: string): number {
    const at = this.bySlug.get(slug);
    if (at === undefined) return 1;

    const initial = this.index[at][4];
    let position = 1;
    for (let i = 0; i < at; i++) {
      if (this.index[i][4] === initial) position++;
    }
    return position;
  }

  /** Alphabetical neighbours, for the previous / next controls on an entry. */
  neighbours(slug: string): { prev: TermRef | null; next: TermRef | null } {
    const at = this.bySlug.get(slug);
    if (at === undefined) return { prev: null, next: null };
    return {
      prev: at > 0 ? toRef(this.index[at - 1]) : null,
      next: at < this.index.length - 1 ? toRef(this.index[at + 1]) : null,
    };
  }

  private async shard(initial: string): Promise<Map<string, ShardTerm>> {
    const cached = this.shards.get(initial);
    if (cached) return cached;

    const info = this.require().shards[initial];
    if (!info) return new Map();

    const rows = await this.readJson<ShardTerm[]>(info.file);
    const map = new Map(rows.map((r) => [r.slug, r]));
    this.shards.set(initial, map);
    return map;
  }

  // ----------------------------------------------------------------- search

  /**
   * Headword search, ranked the way the Postgres version ranks: exact match,
   * then prefix, then a Tamil hit, then anything else containing the query.
   * Runs over the in-memory index, so it is instant and works offline.
   */
  search(query: string, limit = 50): TermRef[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const hits: { at: number; rank: number }[] = [];
    for (let i = 0; i < this.index.length; i++) {
      const en = this.enLower[i];
      const inTamil = this.taLower[i].includes(q);
      const inEnglish = en.includes(q);
      if (!inTamil && !inEnglish) continue;

      hits.push({
        at: i,
        rank: en === q ? 0 : en.startsWith(q) ? 1 : inTamil ? 2 : 3,
      });
    }

    return hits
      .sort(
        (a, b) =>
          a.rank - b.rank ||
          this.enLower[a.at].localeCompare(this.enLower[b.at]),
      )
      .slice(0, limit)
      .map((h) => toRef(this.index[h.at]));
  }

  /**
   * Search the explanations too. Needs every shard, so it is a deliberate
   * second step behind the instant headword search rather than the default.
   */
  async searchDeep(query: string, limit = 50): Promise<TermRef[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const seen = new Set<string>();
    const found: TermRef[] = [];
    for (const ref of this.search(q, limit)) {
      seen.add(ref.slug);
      found.push(ref);
    }

    for (const initial of Object.keys(this.require().shards)) {
      if (found.length >= limit) break;
      for (const row of (await this.shard(initial)).values()) {
        if (found.length >= limit) break;
        if (seen.has(row.slug)) continue;
        const body = `${row.en_exp ?? ""} ${row.ta_exp ?? ""}`.toLowerCase();
        if (!body.includes(q)) continue;
        seen.add(row.slug);
        found.push({
          id: row.id,
          slug: row.slug,
          en_word: row.en_word,
          ta_word: row.ta_word,
          initial: row.initial,
        });
      }
    }
    return found;
  }

  // ----------------------------------------------------------------- updates

  /**
   * Pull newer content from a server into the update store.
   *
   * Only the files whose hash changed are downloaded, so a typo fix in one
   * entry costs one shard, not the whole 11 MB. Without an update store this
   * is a no-op — the shipped app is offline until an admin build attaches one.
   */
  async sync(remoteBaseUrl: string): Promise<SyncResult> {
    if (!this.store) return { status: "unavailable" };

    const local = this.require();
    let remote: DatasetManifest;
    try {
      const res = await fetch(`${remoteBaseUrl.replace(/\/$/, "")}/manifest.json`, {
        cache: "no-store",
      });
      if (!res.ok) return { status: "unavailable" };
      remote = (await res.json()) as DatasetManifest;
    } catch {
      return { status: "unavailable" };
    }

    if (remote.schema !== SUPPORTED_SCHEMA) return { status: "unavailable" };
    if (remote.version === local.version) return { status: "current" };

    const wanted = [
      remote.index.hash === local.index.hash ? null : remote.index,
      ...Object.entries(remote.shards)
        .filter(([initial, info]) => local.shards[initial]?.hash !== info.hash)
        .map(([, info]) => info),
    ].filter((info) => info !== null);

    const base = remoteBaseUrl.replace(/\/$/, "");
    for (const info of wanted) {
      const res = await fetch(`${base}/${info.file}`, { cache: "no-store" });
      if (!res.ok) return { status: "unavailable" };
      await this.store.write(info.file, await res.text());
    }
    await this.store.write("manifest.json", JSON.stringify(remote));

    // Re-read through the store so the new content is live without a restart.
    this.shards.clear();
    this.loading = null;
    await this.load();

    return {
      status: "updated",
      from: local.version,
      to: remote.version,
      files: wanted.map((i) => i.file),
    };
  }

  /** Drop every downloaded file and fall back to what shipped in the app. */
  async resetToBundled(): Promise<void> {
    await this.store?.clear();
    this.shards.clear();
    this.loading = null;
    await this.load();
  }
}

function toRef(row: IndexRow): TermRef {
  return {
    id: row[0],
    slug: row[1],
    en_word: row[2],
    ta_word: row[3] || null,
    initial: row[4],
  };
}
