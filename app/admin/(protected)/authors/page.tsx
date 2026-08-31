// Author manager — create/edit the people who sign articles. Assigned to a post
// via the dropdown in the post editor; the public signature footer picks up
// edits via revalidation.
import { createAdminClient } from "@/lib/supabase/admin";
import { authorAvatarUrl } from "@/lib/blog/queries";
import type { SocialLink, SocialPlatform } from "@/lib/blog/types";
import { AuthorForm } from "./author-form";

interface AuthorRow {
  id: string;
  slug: string;
  name: string;
  slogan: { de?: string; en?: string; es?: string } | null;
  avatar_path: string | null;
  socials: SocialLink[] | null;
}

/** jsonb socials array → {platform: url} for prefilling the form inputs. */
function socialsToMap(socials: SocialLink[] | null): Partial<Record<SocialPlatform, string>> {
  const map: Partial<Record<SocialPlatform, string>> = {};
  for (const { platform, url } of socials ?? []) map[platform] = url;
  return map;
}

export default async function AdminAuthorsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_authors")
    .select("id, slug, name, slogan, avatar_path, socials")
    .order("name", { ascending: true });
  if (error) throw new Error(`Failed to load authors: ${error.message}`);
  const authors = (data ?? []) as AuthorRow[];

  return (
    <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Authors</h1>
        <p className="text-text-tertiary mt-1 text-sm">
          Each author signs the bottom of their articles — name, slogan and social links. Assign one
          to a post in the post editor.
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        {authors.map((author) => (
          <AuthorForm
            key={author.id}
            values={{
              id: author.id,
              name: author.name,
              slug: author.slug,
              sloganDe: author.slogan?.de,
              sloganEn: author.slogan?.en,
              sloganEs: author.slogan?.es,
              socials: socialsToMap(author.socials),
              avatarUrl: authorAvatarUrl(author.avatar_path),
            }}
          />
        ))}
      </div>

      <div className="border-border border-t pt-6">
        <h2 className="text-text-tertiary mb-4 text-sm font-semibold tracking-wide uppercase">
          New author
        </h2>
        <AuthorForm values={{}} />
      </div>
    </div>
  );
}
