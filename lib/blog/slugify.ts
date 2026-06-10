// URL slug from a title. German umlauts transliterate (ä→ae) before the
// generic diacritic strip so "Tätowierer" becomes "taetowierer", not "tatowierer".
const GERMAN_MAP: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  ß: "ss",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äöüß]/g, (char) => GERMAN_MAP[char])
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
