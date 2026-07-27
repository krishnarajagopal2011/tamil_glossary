import type { Category, LetterCount, Stats } from "../types";

/** The shape written by `scripts/build-dataset.mjs`. */
export type ShardInfo = { file: string; bytes: number; hash: string };

export type DatasetManifest = {
  schema: number;
  version: string;
  generatedAt: string;
  stats: Stats;
  letters: LetterCount[];
  categories: Category[];
  index: ShardInfo;
  shards: Record<string, ShardInfo>;
};

/** Bumped in the generator whenever the file layout changes. */
export const SUPPORTED_SCHEMA = 1;

/** Compact index row: [id, slug, en_word, ta_word, initial]. */
export type IndexRow = [number, string, string, string, string];
