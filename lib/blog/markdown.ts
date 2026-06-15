// Markdown → sanitized HTML. Isomorphic: the public article page renders it
// server-side (RSC), the admin editor reuses it client-side for live preview.
// rehype-slug runs BEFORE sanitize, so the schema must explicitly keep heading
// ids (sanitize strips them otherwise); clobberPrefix "" keeps the ids clean.
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

const schema = {
  ...defaultSchema,
  clobberPrefix: "",
  attributes: {
    ...defaultSchema.attributes,
    h2: [...(defaultSchema.attributes?.h2 ?? []), "id"],
    h3: [...(defaultSchema.attributes?.h3 ?? []), "id"],
    h4: [...(defaultSchema.attributes?.h4 ?? []), "id"],
  },
};

// Trusted post-sanitize transform: external (http/https) links open in a new
// tab with a safe rel; internal/relative links stay same-tab. The values are
// constant (no user input), so running AFTER rehype-sanitize is safe and keeps
// the sanitize schema — and our "no raw HTML in content_md" rule — untouched.
type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function rehypeExternalNewTab() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === "element" && node.tagName === "a") {
        const props = node.properties;
        const href = props?.href;
        if (props && typeof href === "string" && /^https?:\/\//i.test(href)) {
          props.target = "_blank";
          props.rel = "noopener noreferrer";
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeSanitize, schema)
  .use(rehypeExternalNewTab)
  .use(rehypeStringify);

export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}
