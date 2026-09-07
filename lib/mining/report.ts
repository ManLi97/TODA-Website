// Community-Pulse weekly report → one standalone HTML file (team mail attachment).
// Pure renderer over the stored digest (pulse_digests.digest) + a few key figures;
// deterministic, no JS, inline CSS in the site look (tokens from globals.css @theme),
// fonts from Google with a system fallback. Nothing here reaches the LLM — every
// sentence is the digest's own text. Escape everything (digest text is LLM output
// over scraped community text).
//
// How to verify: `pnpm pulse:report --week 2026-W36` → open the file, or the
// headless-Chrome screenshot in the skill/plan protocol.
import type { Digest } from "./digest";

export type ReportMeta = {
  generated_at: string; // pulse_digests.generated_at
  model: string;
  prompt_version: string;
  input_signal_count: number;
  totals: Record<string, number | boolean>; // pulse_quality_report totals
  cost: { deepapi_estimate_usd: number; anthropic_usd: number };
  logo_data_uri: string | null;
};

const esc = (s: unknown): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const href = (url: string): string => {
  const safe = /^https?:\/\//i.test(url) ? url : "#";
  return esc(safe);
};

const num = (n: number | boolean | undefined, digits = 0): string =>
  typeof n === "number" ? n.toLocaleString("de-DE", { maximumFractionDigits: digits }) : "–";

const AUDIENCE: Record<string, string> = {
  artist: "Artists",
  endkunde: "Endkund:innen",
  mixed: "gemischt",
};
const SENTIMENT: Record<string, string> = {
  negative: "negativ",
  mixed: "gemischt",
  positive: "positiv",
};
const FORMAT: Record<string, string> = {
  blog: "Blog",
  reel: "Reel",
  carousel: "Carousel",
  faq: "FAQ",
  clip: "Clip",
};

function weekLabel(week: string): string {
  const m = /^(\d{4})-W(\d{2})$/.exec(week);
  return m ? `KW ${Number(m[2])} · ${m[1]}` : week;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Berlin",
      }) + " Uhr";
}

const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg: #000; --alt: #1e1e1e; --raised: #292929; --border: #383838;
  --txt: #fff; --txt2: #a3a3a3; --txt3: #6b6b6b;
  --gold-200: #fce49b; --gold-400: #e8b73d; --gold-500: #c8941a; --on-gold: #2b1e08;
  --purple-400: #cbb5ef; --green: #5fb082; --red: #b85450; --blue: #6b8cbe; --terra: #b57236;
  --radius: 18px;
}
html { color-scheme: dark; }
body {
  background: var(--bg); color: var(--txt2);
  font-family: "Inter", "SF Pro Display", -apple-system, system-ui, sans-serif;
  font-feature-settings: "cv11", "ss03"; -webkit-font-smoothing: antialiased;
  font-size: 16px; line-height: 1.55;
}
a { color: var(--gold-400); text-decoration: none; }
a:hover { text-decoration: underline; }
.wrap { max-width: 960px; margin: 0 auto; padding: 56px 28px 80px; }
header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 40px; }
header img { height: 36px; opacity: .92; }
.eyebrow { font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--gold-400); font-weight: 400; }
h1 { font-size: clamp(1.6rem, 3.4vw, 2.4rem); font-weight: 600; line-height: 1.1; letter-spacing: -.03em; color: var(--txt); margin: 10px 0 18px; }
.lede { font-size: 1.125rem; line-height: 1.5; color: var(--txt2); max-width: 760px; }
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 36px 0 8px; }
.kpi { background: var(--alt); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 18px 14px; }
.kpi b { display: block; font-size: 1.75rem; font-weight: 600; color: var(--txt); letter-spacing: -.02em; line-height: 1; }
.kpi small { display: block; margin-top: 8px; font-size: 12px; color: var(--txt3); letter-spacing: .04em; text-transform: uppercase; }
.kpi.gold b { color: var(--gold-400); }
section { margin-top: 52px; }
h2 { font-size: 1.5rem; font-weight: 600; color: var(--txt); letter-spacing: -.02em; line-height: 1.15; margin-bottom: 6px; }
.sub { font-size: 14px; color: var(--txt3); margin-bottom: 18px; }
.card { background: var(--alt); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 22px; }
.card + .card { margin-top: 12px; }
.topic { display: grid; grid-template-columns: 1fr auto; gap: 8px 18px; align-items: start; }
.topic .name { font-weight: 600; color: var(--txt); font-size: 1.05rem; }
.topic .name span { color: var(--txt3); font-weight: 400; font-size: .9rem; margin-left: 8px; }
.topic .delta { font-size: 12px; color: var(--gold-200); max-width: 300px; text-align: right; padding: 3px 10px; border: 1px solid var(--gold-500); border-radius: 999px; }
.topic p { grid-column: 1 / -1; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
.grid3 .card { margin: 0; }
.grid3 h3 { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 12px; }
.grid3 .complaints h3 { color: var(--red); } .grid3 .wishes h3 { color: var(--blue); } .grid3 .praise h3 { color: var(--green); }
ul { list-style: none; }
li { padding: 8px 0; border-top: 1px solid var(--border); }
li:first-child { border-top: 0; padding-top: 0; }
li b { color: var(--txt); font-weight: 600; }
.meta { font-size: 13px; color: var(--txt3); }
.tag { display: inline-block; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--border); color: var(--txt2); margin-right: 6px; vertical-align: middle; }
.tag.gold { border-color: var(--gold-500); color: var(--gold-200); }
.tag.neg { border-color: var(--red); color: #e39a97; } .tag.pos { border-color: var(--green); color: #9bd6b3; } .tag.mix { border-color: var(--terra); color: #e0a878; }
blockquote { border-left: 3px solid var(--gold-500); padding: 6px 0 6px 16px; margin: 10px 0; color: var(--txt); font-size: 1.02rem; line-height: 1.45; }
blockquote footer { font-size: 12px; color: var(--txt3); margin-top: 6px; font-style: normal; }
.cand { border-color: var(--gold-500); background: linear-gradient(180deg, #1e1e1e, #171410); }
.cand .name { color: var(--txt); font-weight: 600; font-size: 1.05rem; margin: 2px 0 6px; }
.gaps li { color: var(--txt2); }
.x { font-variant-numeric: tabular-nums; color: var(--gold-400); font-weight: 600; }
footer.end { margin-top: 64px; padding-top: 20px; border-top: 1px solid var(--border); font-size: 12px; color: var(--txt3); line-height: 1.6; }
@media print { body { background: #fff; color: #333; } .card, .kpi { background: #fff; border-color: #ddd; } h1, h2, li b, .kpi b, .topic .name, blockquote { color: #111; } }
`;

export function renderDigestHtml(d: Digest, meta: ReportMeta): string {
  const t = meta.totals;
  const themed = (
    cls: string,
    title: string,
    items: { theme: string; summary: string; n: number }[]
  ) =>
    `<div class="card ${cls}"><h3>${esc(title)}</h3>${
      items.length === 0
        ? `<p class="meta">Diese Woche nichts Belastbares.</p>`
        : `<ul>${items.map((i) => `<li><b>${esc(i.theme)}</b> <span class="meta">(${num(i.n)})</span><br>${esc(i.summary)}</li>`).join("")}</ul>`
    }</div>`;

  const parts: string[] = [];
  parts.push(`<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Community-Puls ${esc(weekLabel(d.week))} · TODA</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body><div class="wrap">
<header>
  <div>
    <div class="eyebrow">Community-Puls · ${esc(weekLabel(d.week))}</div>
    <h1>${esc(d.headline)}</h1>
    <p class="lede">${esc(d.summary)}</p>
  </div>
  ${meta.logo_data_uri ? `<img src="${esc(meta.logo_data_uri)}" alt="TODA">` : ""}
</header>
<div class="kpis">
  <div class="kpi"><b>${num(t.signals)}</b><small>Signale erhoben</small></div>
  <div class="kpi"><b>${num(t.classified)}</b><small>klassifiziert</small></div>
  <div class="kpi gold"><b>${num(t.useful_de)}</b><small>nützlich · Deutsch</small></div>
  <div class="kpi"><b>${num(t.questions_de)}</b><small>Fragen · Deutsch</small></div>
  <div class="kpi"><b>${num(t.clusters_trend_gate)}</b><small>Cluster über Trend-Gate</small></div>
  <div class="kpi"><b>${num(meta.cost.anthropic_usd + meta.cost.deepapi_estimate_usd, 2)} $</b><small>Kosten der Woche</small></div>
</div>`);

  if (d.top_topics.length > 0) {
    parts.push(
      `<section><h2>Themen der Woche</h2><p class="sub">Cluster nach Outlier-Score; n = Signale, Quellen = Peer-Gruppen, Δ gegen den 4-Wochen-Schnitt.</p>`
    );
    for (const x of d.top_topics)
      parts.push(`<div class="card topic">
  <div class="name">${esc(x.cluster)}<span>n ${num(x.n)} · ${num(x.sources)} Quellen · Score ${num(x.score, 1)}</span></div>
  <div class="delta">${esc(x.delta_vs_4w)}</div>
  <p>${esc(x.summary)}</p>
</div>`);
    parts.push(`</section>`);
  }

  if (d.questions.length > 0) {
    parts.push(
      `<section><h2>Was die Szene fragt</h2><p class="sub">Fragen inkl. Varianten, mit Zielgruppe und Quellen.</p><div class="card"><ul>`
    );
    for (const q of d.questions)
      parts.push(
        `<li><b>${esc(q.question)}</b><br><span class="meta">${esc(AUDIENCE[q.audience] ?? q.audience)} · ${num(q.n)}× · ${esc(q.sources.join(", "))}</span></li>`
      );
    parts.push(`</ul></div></section>`);
  }

  parts.push(
    `<section><h2>Beschwerden, Wünsche, Lob</h2><p class="sub">Verdichtete Themen je Signaltyp.</p><div class="grid3">${themed("complaints", "Beschwerden", d.complaints)}${themed("wishes", "Wünsche", d.wishes)}${themed("praise", "Lob", d.praise)}</div></section>`
  );

  if (d.videos.length > 0) {
    parts.push(
      `<section><h2>Videos mit Ausreißer-Ratio</h2><p class="sub">Engagement relativ zum Median der eigenen Suche bzw. des Kanals.</p><div class="card"><ul>`
    );
    for (const v of d.videos)
      parts.push(
        `<li><span class="x">×${num(v.x_ratio, 1)}</span> <a href="${href(v.url)}" target="_blank" rel="noopener">${esc(v.title)}</a><br><span class="meta">${esc(v.source)} · ${esc(v.why)}</span></li>`
      );
    parts.push(`</ul></div></section>`);
  }

  if (d.competitor_feedback.length > 0) {
    parts.push(
      `<section><h2>Review-Feedback je Feature</h2><p class="sub">App-Store-, Play- und Trustpilot-Reviews der Kategorie, bewusst ohne App- oder Firmennamen.</p><div class="card"><ul>`
    );
    for (const c of d.competitor_feedback) {
      const cls = c.sentiment === "negative" ? "neg" : c.sentiment === "positive" ? "pos" : "mix";
      parts.push(
        `<li><span class="tag ${cls}">${esc(SENTIMENT[c.sentiment] ?? c.sentiment)}</span><b>${esc(c.feature)}</b> <span class="meta">(${num(c.n)})</span><br>${esc(c.summary)}</li>`
      );
    }
    parts.push(`</ul></div></section>`);
  }

  const fp = d.first_party;
  if (
    fp.top_posts.length > 0 ||
    fp.ig_comment_themes.length > 0 ||
    fp.gsc_rising_queries.length > 0
  ) {
    parts.push(
      `<section><h2>Unsere eigenen Kanäle</h2><p class="sub">Instagram-Insights und Search Console derselben Woche.</p><div class="card"><ul>`
    );
    if (fp.ig_comment_themes.length > 0)
      parts.push(`<li><b>IG-Kommentar-Themen:</b> ${esc(fp.ig_comment_themes.join("; "))}</li>`);
    for (const p of fp.top_posts)
      parts.push(
        `<li><a href="${href(p.permalink)}" target="_blank" rel="noopener">Top-Post</a> <span class="meta">Reach ${num(p.reach)}</span><br>${esc(p.why)}</li>`
      );
    for (const g of fp.gsc_rising_queries)
      parts.push(
        `<li><b>„${esc(g.query)}“</b> <span class="meta">${num(g.impressions)} Impressions · Δ ${num(g.delta)}</span></li>`
      );
    parts.push(`</ul></div></section>`);
  }

  if (d.candidates.length > 0) {
    parts.push(
      `<section><h2>Content-Kandidaten</h2><p class="sub">Aus den Daten abgeleitete Formate mit Begründung. Reihenfolge = Priorität.</p>`
    );
    for (const c of d.candidates)
      parts.push(
        `<div class="card cand"><span class="tag gold">${esc(FORMAT[c.format] ?? c.format)}</span><div class="name">${esc(c.topic)}</div><p>${esc(c.why)}</p></div>`
      );
    parts.push(`</section>`);
  }

  if (d.quotes.length > 0) {
    parts.push(
      `<section><h2>O-Töne</h2><p class="sub">Anonymisierte Paraphrasen aus der Community, keine Namen, keine Links.</p><div class="card">`
    );
    for (const q of d.quotes)
      parts.push(
        `<blockquote>${esc(q.quote)}<footer>${esc(q.platform)} · ${esc(q.signal_type)}${q.cluster ? ` · ${esc(q.cluster)}` : ""}</footer></blockquote>`
      );
    parts.push(`</div></section>`);
  }

  if (d.gaps.length > 0) {
    parts.push(
      `<section><h2>Was die Daten diese Woche nicht hergeben</h2><div class="card gaps"><ul>`
    );
    for (const g of d.gaps) parts.push(`<li>${esc(g)}</li>`);
    parts.push(`</ul></div></section>`);
  }

  parts.push(`<footer class="end">
Erzeugt ${esc(fmtDate(meta.generated_at))} aus ${num(meta.input_signal_count)} Signalen der Woche · Modell ${esc(meta.model)} · Prompt ${esc(meta.prompt_version)} ·
Kosten: DeepAPI ≈ ${num(meta.cost.deepapi_estimate_usd, 2)} $ (Listenpreis-Schätzung), Anthropic ${num(meta.cost.anthropic_usd, 2)} $ ·
Runs ${num(t.runs)}${typeof t.runs_failed === "number" && t.runs_failed > 0 ? ` (${num(t.runs_failed)} fehlgeschlagen)` : ""} · Identitätsfelder ${num(t.identity_fields)}<br>
Methode: Community-Puls v3 (Wochen-Delta → LLM-Verdichtung → Digest), <code>docs/blog/topic-radar.md</code>. Community-Material belegt Stimmung, keine Fakten.
</footer>
</div></body></html>`);
  return parts.join("\n");
}
