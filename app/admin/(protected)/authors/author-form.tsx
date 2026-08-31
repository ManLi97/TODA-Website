"use client";

// One author card — edits an existing author (id set) or creates a new one
// (no id). Client component for the delete confirm; the three forms (details,
// avatar upload, delete) post straight to server actions. Avatar upload only
// appears once the author exists (needs its id, like post cover uploads).
import { useFormStatus } from "react-dom";
import { SOCIAL_LABELS } from "@/components/blog/social-icon";
import {
  adminControlClass,
  adminDangerButtonClass,
  adminFileInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/blog/types";
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
      className={`${primary ? adminPrimaryButtonClass : adminSecondaryButtonClass} w-full sm:w-auto`}
    >
      {pending ? "Working…" : children}
    </button>
  );
}

export function AuthorForm({ values }: { values: AuthorFormValues }) {
  const isNew = !values.id;
  const fieldId = values.id ?? "new";

  return (
    <div
      data-admin-author-card
      className="border-border bg-surface-alt flex min-w-0 flex-col gap-5 rounded-xl border p-4 sm:p-5"
    >
      <form action={saveAuthor} className="flex min-w-0 flex-col gap-4">
        {values.id && <input type="hidden" name="id" value={values.id} />}

        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <label className={adminLabelClass} htmlFor={`name-${fieldId}`}>
              Name *
            </label>
            <input
              id={`name-${fieldId}`}
              name="name"
              defaultValue={values.name}
              placeholder="Tomek Schubert"
              required
              className={adminControlClass}
            />
          </div>
          <div className="min-w-0">
            <label className={adminLabelClass} htmlFor={`slug-${fieldId}`}>
              Slug (auto)
            </label>
            <input
              id={`slug-${fieldId}`}
              name="slug"
              defaultValue={values.slug}
              placeholder="tomek-schubert"
              className={adminControlClass}
            />
          </div>
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-3">
          <div className="min-w-0">
            <label className={adminLabelClass} htmlFor={`slogan-de-${fieldId}`}>
              Slogan (de)
            </label>
            <input
              id={`slogan-de-${fieldId}`}
              name="sloganDe"
              defaultValue={values.sloganDe}
              className={adminControlClass}
            />
          </div>
          <div className="min-w-0">
            <label className={adminLabelClass} htmlFor={`slogan-en-${fieldId}`}>
              Slogan (en)
            </label>
            <input
              id={`slogan-en-${fieldId}`}
              name="sloganEn"
              defaultValue={values.sloganEn}
              className={adminControlClass}
            />
          </div>
          <div className="min-w-0">
            <label className={adminLabelClass} htmlFor={`slogan-es-${fieldId}`}>
              Slogan (es)
            </label>
            <input
              id={`slogan-es-${fieldId}`}
              name="sloganEs"
              defaultValue={values.sloganEs}
              className={adminControlClass}
            />
          </div>
        </div>

        <fieldset className="min-w-0">
          <legend className={adminLabelClass}>Social links (leave blank to hide)</legend>
          <div className="grid min-w-0 gap-3 lg:grid-cols-2">
            {SOCIAL_PLATFORMS.map((platform) => {
              const inputId = `social-${platform}-${fieldId}`;
              return (
                <div
                  key={platform}
                  className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3"
                >
                  <label
                    htmlFor={inputId}
                    className="text-text-tertiary text-xs font-medium sm:w-20 sm:shrink-0"
                  >
                    {SOCIAL_LABELS[platform]}
                  </label>
                  <input
                    id={inputId}
                    name={`social_${platform}`}
                    defaultValue={values.socials?.[platform]}
                    placeholder={socialPlaceholder(platform)}
                    className={adminControlClass}
                  />
                </div>
              );
            })}
          </div>
        </fieldset>

        <div>
          <SubmitButton primary={isNew}>{isNew ? "Add author" : "Save changes"}</SubmitButton>
        </div>
      </form>

      {values.id && (
        <div className="border-border grid min-w-0 gap-4 border-t pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <form
            action={uploadAuthorAvatar}
            className="grid min-w-0 gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-end"
          >
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
            <div className="min-w-0">
              <label className={adminLabelClass} htmlFor={`avatar-${fieldId}`}>
                Avatar {values.avatarUrl ? "(set)" : "(none)"}
              </label>
              <input
                id={`avatar-${fieldId}`}
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className={adminFileInputClass}
              />
            </div>
            <SubmitButton>Upload</SubmitButton>
          </form>

          <form
            action={deleteAuthor}
            onSubmit={(event) => {
              if (
                !window.confirm("Delete this author? Posts keep existing but lose the signature.")
              ) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={values.id} />
            <button type="submit" className={`${adminDangerButtonClass} w-full sm:w-auto`}>
              Delete author
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
