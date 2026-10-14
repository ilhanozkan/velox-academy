const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });
const dateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const relativeFormatter = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });

export const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : "—");

export const formatDateTime = (value) => (value ? dateTimeFormatter.format(new Date(value)) : "—");

/** "3 dakika önce", "dün", ... */
export const timeAgo = (value) => {
  if (!value) return "—";

  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const units = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeFormatter.format(Math.round(seconds / size), unit);
  }
  return "az önce";
};

export const formatMinutes = (minutes) => {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} dk`;
  return rest ? `${hours} sa ${rest} dk` : `${hours} sa`;
};

export const LEVEL_LABELS = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
};
