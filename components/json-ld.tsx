import { serializeJsonLd, type JsonLdDocument } from "@/lib/seo/structured-data";

export function JsonLd({ document }: { document: JsonLdDocument }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(document) }}
    />
  );
}
