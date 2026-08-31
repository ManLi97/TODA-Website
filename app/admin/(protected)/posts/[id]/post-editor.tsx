"use client";

// Post editor — locale tabs (de/es/en, each publishes independently), shared
// post settings (category, cover), markdown textarea with a debounced live
// preview rendered through the SAME pipeline as the public article page.
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  adminControlClass,
  adminDangerButtonClass,
  adminFileInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { renderMarkdown } from "@/lib/blog/markdown";
import { slugify } from "@/lib/blog/slugify";
import { routing } from "@/i18n/routing";
import {
  deletePost,
  publishTranslation,
  saveTranslation,
  setAuthor,
  setCategory,
  unpublishTranslation,
  uploadCover,
} from "../actions";

export interface EditorTranslation {
  slug: string;
  title: string;
  excerpt: string;
  contentMd: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  youtubeId: string;
  videoStartSeconds: string;
  videoPublishedAt: string;
  status: string;
}

interface PostEditorProps {
  postId: string;
  categoryId: string | null;
  authorId: string | null;
  coverUrl: string | null;
  categories: { id: string; label: string }[];
  authors: { id: string; label: string }[];
  translations: Record<string, EditorTranslation>;
}

const EMPTY: EditorTranslation = {
  slug: "",
  title: "",
  excerpt: "",
  contentMd: "",
  tags: "",
  seoTitle: "",
  seoDescription: "",
  youtubeId: "",
  videoStartSeconds: "",
  videoPublishedAt: "",
  status: "missing",
};

const inputClass = adminControlClass;
const labelClass = adminLabelClass;

function PendingButton({ children, className }: { children: React.ReactNode; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-50`}>
      {pending ? "Working…" : children}
    </button>
  );
}

export function PostEditor({
  postId,
  categoryId,
  authorId,
  coverUrl,
  categories,
  authors,
  translations,
}: PostEditorProps) {
  const [activeLocale, setActiveLocale] = useState<string>(routing.locales[0]);
  const [drafts, setDrafts] = useState<Record<string, EditorTranslation>>(() => {
    const initial: Record<string, EditorTranslation> = {};
    for (const locale of routing.locales) {
      initial[locale] = translations[locale] ?? { ...EMPTY };
    }
    return initial;
  });
  // Tracks whether the slug was hand-edited per locale — auto-slug stops then.
  const slugTouched = useRef<Record<string, boolean>>({});
  const [previewHtml, setPreviewHtml] = useState("");
  const [mobilePane, setMobilePane] = useState<"write" | "preview">("write");

  const draft = drafts[activeLocale];

  const update = (patch: Partial<EditorTranslation>) => {
    setDrafts((prev) => ({
      ...prev,
      [activeLocale]: { ...prev[activeLocale], ...patch },
    }));
  };

  const onTitleChange = (title: string) => {
    const patch: Partial<EditorTranslation> = { title };
    if (!slugTouched.current[activeLocale] || !draft.slug) {
      patch.slug = slugify(title);
    }
    update(patch);
  };

  // Debounced live preview through the real markdown pipeline.
  const contentMd = draft.contentMd;
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      renderMarkdown(contentMd).then((html) => {
        if (!cancelled) setPreviewHtml(html);
      });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [contentMd]);

  const statusBadge = useMemo(() => {
    const status = translations[activeLocale]?.status ?? "missing";
    const tone =
      status === "published"
        ? "bg-label-green/15 text-label-green"
        : status === "draft"
          ? "bg-gold-500/15 text-gold-200"
          : "bg-surface-hover text-text-tertiary";
    return <span className={`rounded-full px-2.5 py-1 text-xs ${tone}`}>{status}</span>;
  }, [translations, activeLocale]);

  return (
    <div className="flex min-w-0 flex-col gap-8 sm:gap-10">
      {/* ── Shared post settings ─────────────────────────────────────── */}
      <section className="border-border bg-surface-alt grid min-w-0 gap-5 rounded-xl border p-4 sm:grid-cols-2 sm:gap-6 sm:p-6">
        <form action={setCategory} className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="postId" value={postId} />
          <div className="min-w-0 grow">
            <label className={labelClass} htmlFor="categoryId">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={categoryId ?? ""}
              className={inputClass}
            >
              <option value="">— none —</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <PendingButton className={`${adminSecondaryButtonClass} w-full sm:w-auto`}>
            Save
          </PendingButton>
        </form>

        <form action={setAuthor} className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="postId" value={postId} />
          <div className="min-w-0 grow">
            <label className={labelClass} htmlFor="authorId">
              Author
            </label>
            <select
              id="authorId"
              name="authorId"
              defaultValue={authorId ?? ""}
              className={inputClass}
            >
              <option value="">— none —</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.label}
                </option>
              ))}
            </select>
          </div>
          <PendingButton className={`${adminSecondaryButtonClass} w-full sm:w-auto`}>
            Save
          </PendingButton>
        </form>

        <form
          action={uploadCover}
          className="flex min-w-0 flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-end"
        >
          <input type="hidden" name="postId" value={postId} />
          <div className="min-w-0 grow">
            <label className={labelClass} htmlFor="cover">
              Cover image {coverUrl ? "(set)" : "(none)"}
            </label>
            <input
              id="cover"
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className={adminFileInputClass}
            />
          </div>
          <PendingButton className={`${adminSecondaryButtonClass} w-full sm:w-auto`}>
            Upload
          </PendingButton>
        </form>

        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- admin-only preview, no optimization needed
          <img
            src={coverUrl}
            alt="Current cover"
            className="border-border max-h-40 w-full rounded-lg border object-cover sm:col-span-2"
          />
        )}
      </section>

      {/* ── Locale tabs ──────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Translation locale"
          className="border-border bg-surface-alt grid w-full grid-cols-3 gap-1 rounded-lg border p-1 sm:w-auto"
        >
          {routing.locales.map((locale) => {
            const status = translations[locale]?.status ?? "missing";
            return (
              <button
                key={locale}
                type="button"
                aria-pressed={locale === activeLocale}
                onClick={() => setActiveLocale(locale)}
                className={`focus-visible:ring-gold-500/40 inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  locale === activeLocale
                    ? "bg-surface-hover text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {locale}
                <span
                  aria-hidden="true"
                  className={`ml-2 inline-block h-1.5 w-1.5 rounded-full ${
                    status === "published"
                      ? "bg-label-green"
                      : status === "draft"
                        ? "bg-gold-400"
                        : "bg-border"
                  }`}
                />
              </button>
            );
          })}
        </div>
        <div className="self-start sm:self-auto">{statusBadge}</div>
      </div>

      {/* ── Per-locale translation form ──────────────────────────────── */}
      <form key={activeLocale} action={saveTranslation} className="flex min-w-0 flex-col gap-6">
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="locale" value={activeLocale} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              value={draft.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="slug">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              value={draft.slug}
              onChange={(e) => {
                slugTouched.current[activeLocale] = true;
                update({ slug: e.target.value });
              }}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="excerpt">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={2}
            value={draft.excerpt}
            onChange={(e) => update({ excerpt: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="tags">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            name="tags"
            value={draft.tags}
            onChange={(e) => update({ tags: e.target.value })}
            placeholder="aftercare, pricing"
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="seoTitle">
              SEO title (optional)
            </label>
            <input
              id="seoTitle"
              name="seoTitle"
              value={draft.seoTitle}
              onChange={(e) => update({ seoTitle: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="seoDescription">
              SEO description (optional)
            </label>
            <input
              id="seoDescription"
              name="seoDescription"
              value={draft.seoDescription}
              onChange={(e) => update({ seoDescription: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        {/* Podcast embed (optional) — source episode for /podcast-article output */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="youtubeId">
              YouTube URL or video ID (optional)
            </label>
            <input
              id="youtubeId"
              name="youtubeId"
              value={draft.youtubeId}
              onChange={(e) => update({ youtubeId: e.target.value })}
              placeholder="https://youtu.be/… or 11-char ID"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="videoStartSeconds">
              Start at (seconds, optional)
            </label>
            <input
              id="videoStartSeconds"
              name="videoStartSeconds"
              type="number"
              min={0}
              value={draft.videoStartSeconds}
              onChange={(e) => update({ videoStartSeconds: e.target.value })}
              placeholder="e.g. 90"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="videoPublishedAt">
              Episode publish date (optional)
            </label>
            <input
              id="videoPublishedAt"
              name="videoPublishedAt"
              type="date"
              value={draft.videoPublishedAt}
              onChange={(e) => update({ videoPublishedAt: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        {/* Markdown + live preview */}
        <div className="min-w-0">
          <div
            role="group"
            aria-label="Content view"
            className="border-border bg-surface-alt mb-4 grid grid-cols-2 gap-1 rounded-lg border p-1 lg:hidden"
          >
            <button
              type="button"
              aria-pressed={mobilePane === "write"}
              aria-controls="admin-markdown-pane"
              onClick={() => setMobilePane("write")}
              className={`focus-visible:ring-gold-500/40 min-h-11 rounded-md px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                mobilePane === "write" ? "bg-surface-hover text-text-primary" : "text-text-tertiary"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              aria-pressed={mobilePane === "preview"}
              aria-controls="admin-preview-pane"
              onClick={() => setMobilePane("preview")}
              className={`focus-visible:ring-gold-500/40 min-h-11 rounded-md px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                mobilePane === "preview"
                  ? "bg-surface-hover text-text-primary"
                  : "text-text-tertiary"
              }`}
            >
              Preview
            </button>
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <div
              id="admin-markdown-pane"
              className={`min-w-0 ${mobilePane === "write" ? "block" : "hidden lg:block"}`}
            >
              <label className={labelClass} htmlFor="contentMd">
                Content (Markdown)
              </label>
              <textarea
                id="contentMd"
                name="contentMd"
                rows={24}
                value={draft.contentMd}
                onChange={(e) => update({ contentMd: e.target.value })}
                className={`${inputClass} font-mono leading-relaxed`}
              />
            </div>
            <div
              id="admin-preview-pane"
              className={`min-w-0 ${mobilePane === "preview" ? "block" : "hidden lg:block"}`}
            >
              <span className={labelClass}>Preview</span>
              <div className="border-border bg-surface-base max-h-[70svh] min-h-[50svh] overflow-x-auto overflow-y-auto rounded-lg border p-4 sm:p-6 lg:h-full lg:max-h-[600px] lg:min-h-0">
                <div className="prose-blog" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
          </div>
        </div>

        <div className="border-border flex flex-col gap-3 border-t pt-6 sm:flex-row sm:flex-wrap sm:items-center">
          <PendingButton className={`${adminSecondaryButtonClass} w-full sm:w-auto`}>
            Save draft
          </PendingButton>
          <button
            type="submit"
            formAction={publishTranslation}
            className={`${adminPrimaryButtonClass} w-full sm:w-auto`}
          >
            Save & publish
          </button>
          {translations[activeLocale]?.status === "published" && (
            <button
              type="submit"
              formAction={unpublishTranslation}
              className={`${adminDangerButtonClass} w-full sm:w-auto`}
            >
              Unpublish
            </button>
          )}
        </div>
      </form>

      {/* ── Danger zone ──────────────────────────────────────────────── */}
      <form
        action={deletePost}
        onSubmit={(event) => {
          if (!window.confirm("Delete this post in ALL locales? This cannot be undone.")) {
            event.preventDefault();
          }
        }}
        className="border-border border-t pt-6"
      >
        <input type="hidden" name="postId" value={postId} />
        <button type="submit" className={`${adminDangerButtonClass} w-full sm:w-auto`}>
          Delete post (all locales)
        </button>
      </form>
    </div>
  );
}
