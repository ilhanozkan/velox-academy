"use client";

import { createTheme } from "@mantine/core";

// Brand indigo, lightest to darkest; shade 6 is used for buttons and links.
// Every shade used to be the same navy, so hover states, "light" variants and
// focus rings had nothing to work with.
const primary = [
  "#eef0fb",
  "#dde1f5",
  "#bac2ea",
  "#95a1de",
  "#6c7bcf",
  "#4656b5",
  "#1f2766",
  "#192057",
  "#131944",
  "#0d1230",
];

// Dark surfaces of the training workspace (header, panels, editor, terminal).
const navy = [
  "#e6e8f4",
  "#bfc3df",
  "#8f95bb",
  "#646b98",
  "#444b7d",
  "#2e3563",
  "#222852",
  "#191e45",
  "#121738",
  "#0d1230",
];

export const theme = createTheme({
  primaryColor: "primary",
  colors: { primary, navy },
  defaultRadius: "md",
  cursorType: "pointer",
  headings: { fontWeight: "700" },
  components: {
    Progress: { defaultProps: { radius: "xl" } },
    Tooltip: { defaultProps: { withArrow: true, openDelay: 200 } },
  },
});

// Mantine's default shades for these colors are too light for white text
// (filled) or colored text on a tinted background (light, outline): teal.6
// with white text is 2.6:1, gray.6 3.3:1. Use darker values that meet the
// WCAG AA ratio of 4.5:1.
const ACCESSIBLE_COLORS = {
  teal: { filled: "#087f5b", hover: "#066b4c", text: "#066b4c" },
  green: { filled: "#237032", hover: "#1f6b2e", text: "#237032" },
  red: { filled: "#c92a2a", hover: "#b02525", text: "#b02525" },
  gray: { filled: "#495057", hover: "#343a40", text: "#495057" },
  yellow: { text: "#7a5000" },
  orange: { text: "#b03a0a" },
  blue: { text: "#1864ab" },
  cyan: { text: "#0b7285" },
};

const accessibleColorVariables = Object.fromEntries(
  Object.entries(ACCESSIBLE_COLORS).flatMap(([color, { filled, hover, text }]) => [
    ...(filled ? [[`--mantine-color-${color}-filled`, filled]] : []),
    ...(hover ? [[`--mantine-color-${color}-filled-hover`, hover]] : []),
    [`--mantine-color-${color}-light-color`, text],
    [`--mantine-color-${color}-outline`, text],
  ])
);

export const cssVariablesResolver = () => ({
  variables: {},
  light: {
    // `dimmed` text (gray.6) is also below 4.5:1 on white.
    "--mantine-color-dimmed": "#5c636e",
    ...accessibleColorVariables,
  },
  dark: {},
});
