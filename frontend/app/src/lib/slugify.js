const TURKISH = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u" };

/** "Veri Bilimi 101" → "veri-bilimi-101" (matches the API's id pattern). */
export const slugify = (value) =>
  String(value || "")
    .replace(/[çğıİöşü]/gi, (char) => TURKISH[char] || TURKISH[char.toLowerCase()] || char)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Chapter and instruction ids: the API allows `^[a-z0-9]+(-[a-z0-9]+)*$`, at
// most 128 characters.
const MAX_CONTENT_ID_LENGTH = 128;

/**
 * Id for a new chapter or instruction: parent id, name and a random suffix
 * (so two items with the same name do not clash), e.g.
 * "sql-101-giris-k3f9a2". Names without latin letters fall back to `fallback`.
 */
export const contentId = (parentId, name, fallback) => {
  const suffix = Math.random().toString(36).slice(2, 8) || "x";
  const nameSlug = slugify(name).slice(0, 40).replace(/-+$/, "") || fallback;
  const base = `${parentId}-${nameSlug}`.slice(0, MAX_CONTENT_ID_LENGTH - suffix.length - 1).replace(/-+$/, "");
  return `${base}-${suffix}`;
};
