// Author signature — closes every article that has an author assigned. Server
// component: avatar (or initials monogram), name, the slogan in the reader's
// locale, and brand-icon social links. Visual language matches the article
// header (760px measure, 18px radius, gold-bordered elevated card).
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { authorAvatarUrl } from "@/lib/blog/queries";
import type { Author, BlogLocale } from "@/lib/blog/types";
import { SOCIAL_LABELS, SocialIcon } from "./social-icon";

/** Up to two initials for the avatar fallback. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** mailto links stay same-tab; everything else opens in a new tab. */
function socialHref(platform: string, url: string): string {
  if (platform === "email") return url.startsWith("mailto:") ? url : `mailto:${url}`;
  return url;
}

export async function AuthorSignatureFooter({
  author,
  locale,
}: {
  author: Author;
  locale: BlogLocale;
}) {
  const t = await getTranslations({ locale, namespace: "blog" });
  const avatar = authorAvatarUrl(author.avatarPath);
  const slogan =
    author.slogan[locale] ?? author.slogan.de ?? Object.values(author.slogan)[0] ?? "";

  return (
    <aside
      className="mt-block elevated bg-surface-alt mx-auto flex max-w-[760px] flex-col gap-5 rounded-[18px] p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8"
      style={{ border: "var(--glass-border-gold)" }}
    >
      {avatar ? (
        <Image
          src={avatar}
          alt={author.name}
          width={72}
          height={72}
          className="h-[72px] w-[72px] shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="bg-gold-500/15 text-gold-200 flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full text-2xl font-semibold">
          {initials(author.name)}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="type-caption text-text-tertiary uppercase">{t("authorFooter.writtenBy")}</span>
        <p className="text-text-primary text-lg font-semibold">{author.name}</p>
        {slogan && <p className="type-caption text-text-secondary">{slogan}</p>}

        {author.socials.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {author.socials.map((social) => (
              <a
                key={social.platform}
                href={socialHref(social.platform, social.url)}
                {...(social.platform !== "email" && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
                aria-label={SOCIAL_LABELS[social.platform]}
                className="text-text-tertiary hover:text-gold-400 transition-colors duration-200"
              >
                <SocialIcon platform={social.platform} />
              </a>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
