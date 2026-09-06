// Types for the Google Search Console "Search Analytics: query" API and for the
// rows we snapshot into public.gsc_performance_daily.
// API reference: https://developers.google.com/webmaster-tools/v1/searchanalytics/query

// Search result type (the API's `type` field). `web` is the default surface;
// discover/googleNews are separate surfaces with reduced dimension support.
export type SearchType = "web" | "image" | "video" | "news" | "discover" | "googleNews";

// Dimensions we group by. `date` is always first so every row is day-scoped.
export type GscDimension = "date" | "query" | "page" | "country" | "device" | "searchAppearance";

// `all` includes fresh (restatable) data; `final` only finalized data.
export type DataState = "all" | "final";

export type SearchAnalyticsRow = {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchAnalyticsResponse = {
  rows?: SearchAnalyticsRow[];
  responseAggregationType?: string;
};

export type QueryRequest = {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dimensions?: GscDimension[];
  type?: SearchType;
  dataState?: DataState;
  rowLimit?: number;
  startRow?: number;
};

// One row destined for public.gsc_performance_daily. The stored `dimension` is
// 'total' for day-only rows (true daily totals) or the grouping dimension name.
export type GscPerfRow = {
  site_property: string;
  date: string;
  search_type: SearchType;
  dimension: string;
  dimension_value: string;
  clicks: number;
  impressions: number;
  ctr: number | null;
  position: number | null;
  data_state: DataState;
};

// ── URL Inspection API (urlInspection/index:inspect) — only the fields we read.
// API reference: https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect
export type UrlInspectionResult = {
  inspectionResultLink?: string;
  indexStatusResult?: {
    verdict?: string; // PASS | PARTIAL | FAIL | NEUTRAL | VERDICT_UNSPECIFIED
    coverageState?: string; // human-readable, e.g. "Submitted and indexed"
    indexingState?: string;
    lastCrawlTime?: string;
    googleCanonical?: string;
    userCanonical?: string;
    referringUrls?: string[];
    sitemap?: string[];
  };
  richResultsResult?: {
    verdict?: string;
    detectedItems?: { richResultType?: string }[];
  };
};

export type UrlInspectionResponse = {
  inspectionResult?: UrlInspectionResult;
};

// ── Sitemaps: list — submitted sitemaps and their processing status.
// API reference: https://developers.google.com/webmaster-tools/v1/sitemaps/list
export type SitemapResource = {
  path: string;
  lastSubmitted?: string;
  lastDownloaded?: string;
  isPending?: boolean;
  errors?: number;
  warnings?: number;
  contents?: { type: string; submitted: number; indexed?: number }[];
};

export type SitemapsListResponse = {
  sitemap?: SitemapResource[];
};
