// Dashboard — every post with its per-locale status matrix (draft /
// published / missing per de·es·en). Service-role client: drafts visible.
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { routing } from "@/i18n/routing";
import { createPost } from "./actions";

interface PostRow {
  id: string;
  updated_at: string;
  blog_categories: { name: Record<string, string> } | null;
  blog_post_translations: { locale: string; title: string; status: string }[];
}

const STATUS_BADGE: Record<string, string> = {
  published: "bg-label-green/15 text-label-green",
  draft: "bg-gold-500/15 text-gold-200",
  missing: "bg-surface-hover text-text-tertiary",
};

export default async function AdminPostsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, updated_at, blog_categories(name), blog_post_translations(locale, title, status)")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Failed to load posts: ${error.message}`);
  const posts = (data ?? []) as unknown as PostRow[];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <form action={createPost}>
          <button
            type="submit"
            className="bg-gold-500 text-on-gold rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            New post
          </button>
        </form>
      </div>

      {posts.length === 0 ? (
        <p className="text-text-secondary">No posts yet. Create the first one.</p>
      ) : (
        <div className="overflow-x-auto">
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
              {posts.map((post) => {
                const byLocale = new Map(post.blog_post_translations.map((t) => [t.locale, t]));
                const title =
                  byLocale.get("de")?.title ?? post.blog_post_translations[0]?.title ?? "Untitled";
                return (
                  <tr key={post.id} className="border-border/50 border-b">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="text-text-primary hover:text-gold-200 font-medium"
                      >
                        {title}
                      </Link>
                    </td>
                    <td className="text-text-secondary py-3 pr-4">
                      {post.blog_categories?.name?.de ?? "—"}
                    </td>
                    {routing.locales.map((locale) => {
                      const status = byLocale.get(locale)?.status ?? "missing";
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
                    <td className="text-text-tertiary py-3 whitespace-nowrap">
                      {new Date(post.updated_at).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
