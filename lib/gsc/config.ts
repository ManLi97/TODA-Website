// The (search type × dimension-set) matrix pulled on every sync.
//
// Each dimension-set starts with "date" so rows are day-scoped. A set of just
// ["date"] yields true daily TOTALS (stored as dimension='total'); adding a
// second dimension yields per-(date, value) rows for that grouping.
//
// Surface constraints (why the sets differ):
//   • web / image / video accept query, page, country, device.
//   • discover / googleNews have no query concept and reduced dimensions — asking
//     for query/device would 400, so they get a reduced set.
//   • news is treated conservatively (page/country only) for the same reason.
// Per-entry failures are isolated in the sync engine, so an over-broad set for an
// exotic surface degrades to a logged error rather than aborting the run.
import type { GscDimension, SearchType } from "./types";

export type MatrixEntry = { type: SearchType; dimensions: GscDimension[] };

const FULL: GscDimension[][] = [
  ["date"],
  ["date", "query"],
  ["date", "page"],
  ["date", "country"],
  ["date", "device"],
];

const REDUCED: GscDimension[][] = [["date"], ["date", "page"], ["date", "country"]];

const build = (type: SearchType, sets: GscDimension[][]): MatrixEntry[] =>
  sets.map((dimensions) => ({ type, dimensions }));

export const SEARCH_MATRIX: MatrixEntry[] = [
  ...build("web", FULL),
  ...build("image", FULL),
  ...build("video", FULL),
  ...build("news", REDUCED),
  ...build("discover", REDUCED),
  ...build("googleNews", REDUCED),
];

// API hard max is 25,000 rows/page; paginate with startRow beyond that.
export const ROW_LIMIT = 25000;
// Safety cap: 20 pages × 25k = 500k rows per (type, dimensions, window). No real
// property approaches this; the cap just bounds a runaway pagination loop.
export const MAX_PAGES = 20;
