// Dashboard — every post with its per-locale status matrix (draft /
// published / missing per de·es·en). Service-role client: drafts visible.
import Link from "next/link";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import { routing } from "@/i18n/routing";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPost } from "./actions";

interface PostRow {
  id: string;
  updated_at: string;
  blog_categories: { name: Record<string, string> } | null;
  blog_post_translations: { locale: string; title: string; status: string }[];
}

interface PostView {
  id: string;
  title: string;
  category: string;
  updated: string;
  statuses: Map<string, string>;
}

const STATUS_BADGE: Record<string, string> = {
  published: "bg-label-green/15 text-label-green",
  draft: "bg-gold-500/15 text-gold-200",
  missing: "bg-surface-hover text-text-tertiary",
};

function StatusBadge({ locale, status }: { locale: string; status: string }) {
  return (
    <span
      className={`flex w-full min-w-0 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-xs ${STATUS_BADGE[status]}`}
    >
      <span className="text-[0.625rem] tracking-wide uppercase opacity-75">{locale}</span>
      <span>{status}</span>
    </span>
  );
}

export default async function AdminPostsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, updated_at, blog_categories(name), blog_post_translations(locale, title, status)")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Failed to load posts: ${error.message}`);
  const posts = (data ?? []) as unknown as PostRow[];
  const postViews: PostView[] = posts.map((post) => {
    const statuses = new Map(
      post.blog_post_translations.map((translation) => [translation.locale, translation.status])
    );
    const titleByLocale = new Map(
      post.blog_post_translations.map((translation) => [translation.locale, translation.title])
    );

    return {
      id: post.id,
      title: titleByLocale.get("de") ?? post.blog_post_translations[0]?.title ?? "Untitled",
      category: post.blog_categories?.name?.de ?? "—",
      updated: new Date(post.updated_at).toLocaleDateString("en-GB"),
      statuses,
    };
  });

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <form action={createPost}>
          <button type="submit" className={adminPrimaryButtonClass}>
            New post
          </button>
        </form>
      </div>

      {postViews.length === 0 ? (
        <p className="text-text-secondary">No posts yet. Create the first one.</p>
      ) : (
        <>
          <ul data-admin-post-cards className="flex flex-col gap-3 md:hidden">
            {postViews.map((post) => (
              <li
                key={post.id}
                className="border-border bg-surface-alt min-w-0 rounded-xl border p-4"
              >
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="text-text-primary hover:text-gold-200 focus-visible:ring-gold-500/40 flex min-h-11 min-w-0 items-center rounded-md font-medium break-words focus-visible:ring-2 focus-visible:outline-none"
                >
                  {post.title}
                </Link>
                <dl className="border-border/60 text-text-tertiary mt-3 grid grid-cols-2 gap-3 border-t pt-3 text-xs">
                  <div className="min-w-0">
                    <dt className="sr-only">Category</dt>
                    <dd className="text-text-secondary truncate">{post.category}</dd>
                  </div>
                  <div className="text-right">
                    <dt className="sr-only">Updated</dt>
                    <dd>{post.updated}</dd>
                  </div>
                </dl>
                <div
                  role="group"
                  aria-label="Translation statuses"
                  className="mt-3 grid grid-cols-3 gap-2"
                >
                  {routing.locales.map((locale) => (
                    <StatusBadge
                      key={locale}
                      locale={locale}
                      status={post.statuses.get(locale) ?? "missing"}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <div data-admin-post-table className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-border text-text-tertiary border-b text-left">
                  <th className="py-3 pr-4 font-normal">Title</th>
                  <th className="py-3 pr-4 font-normal">Category</th>
                  {routing.locales.map((locale) => (
                    <th key={locale} className="py-3 pr-4 font-normal uppercase">
                      {locale}
                    </th>
                  ))}
                  <th className="py-3 font-normal">Updated</th>
                </tr>
              </thead>
              <tbody>
                {postViews.map((post) => (
                  <tr key={post.id} className="border-border/50 border-b">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="text-text-primary hover:text-gold-200 font-medium"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="text-text-secondary py-3 pr-4">{post.category}</td>
                    {routing.locales.map((locale) => {
                      const status = post.statuses.get(locale) ?? "missing";
                      return (
                        <td key={locale} className="py-3 pr-4 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs ${STATUS_BADGE[status]}`}
                          >
                            {status}
                          </span>
                        </td>
                      );
                    })}
                    <td className="text-text-tertiary py-3 whitespace-nowrap">{post.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
