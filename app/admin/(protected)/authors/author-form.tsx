"use client";

// One author card — edits an existing author (id set) or creates a new one
// (no id). Client component for the delete confirm; the three forms (details,
// avatar upload, delete) post straight to server actions. Avatar upload only
// appears once the author exists (needs its id, like post cover uploads).
import { useFormStatus } from "react-dom";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/blog/types";
import { SOCIAL_LABELS } from "@/components/blog/social-icon";
import { deleteAuthor, saveAuthor, uploadAuthorAvatar } from "./actions";

export interface AuthorFormValues {
  id?: string;
  name?: string;
  slug?: string;
  sloganDe?: string;
  sloganEn?: string;
  sloganEs?: string;
  socials?: Partial<Record<SocialPlatform, string>>;
  avatarUrl?: string | null;
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold-500 focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-text-tertiary";

function socialPlaceholder(platform: SocialPlatform): string {
  if (platform === "email") return "you@studio.com";
  if (platform === "website") return "https://your-site.com";
  return `https://…/${platform === "x" ? "handle" : "profile"}`;
}

function SubmitButton({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
        primary
          ? "bg-gold-500 text-on-gold hover:opacity-90"
          : "border-border text-text-secondary hover:text-text-primary border"
      }`}
    >
      {pending ? "Working…" : children}
    </button>
  );
}

export function AuthorForm({ values }: { values: AuthorFormValues }) {
  const isNew = !values.id;

  return (
    <div className="border-border bg-surface-alt flex flex-col gap-5 rounded-xl border p-5">
      <form action={saveAuthor} className="flex flex-col gap-4">
        {values.id && <input type="hidden" name="id" value={values.id} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor={`name-${values.id ?? "new"}`}>
              Name *
            </label>
            <input
              id={`name-${values.id ?? "new"}`}
              name="name"
              defaultValue={values.name}
              placeholder="Tomek Schubert"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`slug-${values.id ?? "new"}`}>
              Slug (auto)
            </label>
            <input
              id={`slug-${values.id ?? "new"}`}
              name="slug"
              defaultValue={values.slug}
              placeholder="tomek-schubert"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Slogan (de)</label>
            <input name="sloganDe" defaultValue={values.sloganDe} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Slogan (en)</label>
            <input name="sloganEn" defaultValue={values.sloganEn} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Slogan (es)</label>
            <input name="sloganEs" defaultValue={values.sloganEs} className={inputClass} />
          </div>
        </div>

        <fieldset>
          <legend className={labelClass}>Social links (leave blank to hide)</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {SOCIAL_PLATFORMS.map((platform) => (
              <div key={platform} className="flex items-center gap-2">
                <span className="text-text-tertiary w-20 shrink-0 text-xs">
                  {SOCIAL_LABELS[platform]}
                </span>
                <input
                  name={`social_${platform}`}
                  defaultValue={values.socials?.[platform]}
                  placeholder={socialPlaceholder(platform)}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <div>
          <SubmitButton primary={isNew}>{isNew ? "Add author" : "Save"}</SubmitButton>
        </div>
      </form>

      {values.id && (
        <div className="border-border flex flex-wrap items-end justify-between gap-4 border-t pt-5">
          <form action={uploadAuthorAvatar} className="flex items-end gap-3">
            <input type="hidden" name="authorId" value={values.id} />
            {values.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin-only preview
              <img
                src={values.avatarUrl}
                alt={values.name ?? "Avatar"}
                className="border-border h-12 w-12 rounded-full border object-cover"
              />
            ) : (
              <div className="border-border text-text-tertiary flex h-12 w-12 items-center justify-center rounded-full border text-xs">
                —
              </div>
            )}
            <div>
              <label className={labelClass}>Avatar {values.avatarUrl ? "(set)" : "(none)"}</label>
              <input
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="text-text-secondary file:bg-surface-hover file:text-text-primary block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-2 file:text-sm"
              />
            </div>
            <SubmitButton>Upload</SubmitButton>
          </form>

          <form
            action={deleteAuthor}
            onSubmit={(e) => {
              if (!window.confirm("Delete this author? Posts keep existing but lose the signature.")) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={values.id} />
            <button
              type="submit"
              className="border-label-red/40 text-label-red hover:bg-label-red/10 rounded-lg border px-3 py-2 text-sm"
            >
              Delete
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
