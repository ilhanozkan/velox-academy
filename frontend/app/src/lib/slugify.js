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
