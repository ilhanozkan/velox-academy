/**
 * Case- and accent-insensitive form of a string for searching Turkish and
 * English text: "Eğitim", "EGITIM" and "egitim" all become "egitim", and the
 * dotless ı that Turkish lowercasing gives "SCIENCE" matches a typed "i".
 */
export const normalizeSearch = (value) =>
  String(value ?? "")
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

/** True when every word of `query` occurs in one of `fields`. */
export const matchesSearch = (query, fields) => {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = fields.map(normalizeSearch).join(" ");
  return words.every((word) => haystack.includes(word));
};
