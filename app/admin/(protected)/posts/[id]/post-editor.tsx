"use client";

// Post editor — locale tabs (de/es/en, each publishes independently), shared
// post settings (category, cover), markdown textarea with a debounced live
// preview rendered through the SAME pipeline as the public article page.
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
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
  status: "missing",
};

const inputClass =
  "w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold-500 focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-text-tertiary";

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
    <div className="flex flex-col gap-10">
      {/* ── Shared post settings ─────────────────────────────────────── */}
      <section className="border-border bg-surface-alt grid gap-6 rounded-xl border p-6 sm:grid-cols-2">
        <form action={setCategory} className="flex items-end gap-3">
          <input type="hidden" name="postId" value={postId} />
          <div className="grow">
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
          <PendingButton className="border-border text-text-secondary hover:text-text-primary rounded-lg border px-3 py-2 text-sm">
            Save
          </PendingButton>
        </form>

        <form action={setAuthor} className="flex items-end gap-3">
          <input type="hidden" name="postId" value={postId} />
          <div className="grow">
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
          <PendingButton className="border-border text-text-secondary hover:text-text-primary rounded-lg border px-3 py-2 text-sm">
            Save
          </PendingButton>
        </form>

        <form action={uploadCover} className="flex items-end gap-3">
          <input type="hidden" name="postId" value={postId} />
          <div className="grow">
            <label className={labelClass} htmlFor="cover">
              Cover image {coverUrl ? "(set)" : "(none)"}
            </label>
            <input
              id="cover"
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="text-text-secondary file:bg-surface-hover file:text-text-primary block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-2 file:text-sm"
            />
          </div>
          <PendingButton className="border-border text-text-secondary hover:text-text-primary rounded-lg border px-3 py-2 text-sm">
            Upload
          </PendingButton>
        </form>

        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- admin-only preview, no optimization needed
          <img
            src={coverUrl}
            alt="Current cover"
            className="border-border max-h-40 rounded-lg border object-cover sm:col-span-2"
          />
        )}
      </section>

      {/* ── Locale tabs ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="border-border bg-surface-alt flex gap-1 rounded-lg border p-1">
          {routing.locales.map((locale) => {
            const status = translations[locale]?.status ?? "missing";
            return (
              <button
                key={locale}
                type="button"
                onClick={() => setActiveLocale(locale)}
                className={`rounded-md px-4 py-1.5 text-sm uppercase transition-colors ${
                  locale === activeLocale
                    ? "bg-surface-hover text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {locale}
                <span
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
        {statusBadge}
      </div>

      {/* ── Per-locale translation form ──────────────────────────────── */}
      <form key={activeLocale} action={saveTranslation} className="flex flex-col gap-6">
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

        {/* Markdown + live preview */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
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
          <div>
            <span className={labelClass}>Preview</span>
            <div className="border-border bg-surface-base h-full max-h-[600px] overflow-y-auto rounded-lg border p-6">
              <div className="prose-blog" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>

        <div className="border-border flex items-center gap-3 border-t pt-6">
          <PendingButton className="border-border text-text-primary hover:bg-surface-hover rounded-lg border px-4 py-2 text-sm font-semibold">
            Save draft
          </PendingButton>
          <button
            type="submit"
            formAction={publishTranslation}
            className="bg-gold-500 text-on-gold rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Save & publish
          </button>
          {translations[activeLocale]?.status === "published" && (
            <button
              type="submit"
              formAction={unpublishTranslation}
              className="border-label-red/40 text-label-red hover:bg-label-red/10 rounded-lg border px-4 py-2 text-sm"
            >
              Unpublish
            </button>
          )}
        </div>
      </form>

      {/* ── Danger zone ──────────────────────────────────────────────── */}
      <form
        action={deletePost}
        onSubmit={(e) => {
          if (!window.confirm("Delete this post in ALL locales? This cannot be undone.")) {
            e.preventDefault();
          }
        }}
        className="border-border border-t pt-6"
      >
        <input type="hidden" name="postId" value={postId} />
        <button
          type="submit"
          className="text-label-red text-sm transition-opacity hover:opacity-80"
        >
          Delete post (all locales)
        </button>
      </form>
    </div>
  );
}
