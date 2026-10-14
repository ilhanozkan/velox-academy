import {
  IconBrandJavascript,
  IconBrandPython,
  IconChartBar,
  IconCode,
  IconDatabase,
  IconFilter,
  IconLink,
  IconNetwork,
  IconShieldLock,
  IconTrophy,
} from "@tabler/icons-react";

// Achievement.icon values (seeds/data/catalog.js) → Tabler icons.
const ICONS = {
  code: IconCode,
  "brand-javascript": IconBrandJavascript,
  "brand-python": IconBrandPython,
  "chart-bar": IconChartBar,
  database: IconDatabase,
  filter: IconFilter,
  link: IconLink,
  network: IconNetwork,
  "shield-lock": IconShieldLock,
};

export const achievementIcon = (name) => ICONS[name] || IconTrophy;

/** Icon names offered in the admin editor. */
export const ACHIEVEMENT_ICON_NAMES = ["trophy", ...Object.keys(ICONS)];
