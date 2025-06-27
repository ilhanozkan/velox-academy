"use client";

import { createTheme } from "@mantine/core";

const soft = [
  "#EDF2F5",
  "#d5dadd",
  "#bec2c4",
  "#a6a9ac",
  "#8e9193",
  "#77797b",
  "#5f6162",
  "#474949",
  "#2f3031",
  "#181818",
];

const primary = [
  "#0D1230",
  "#0D1230",
  "#0D1230",
  "#0D1230",
  "#0D1230",
  "#0D1230",
  "#0D1230",
  "#0D1230",
  "#0D1230",
  "#0D1230",
];

const secondary = [
  "#12183F",
  "#12183F",
  "#12183F",
  "#12183F",
  "#12183F",
  "#12183F",
  "#12183F",
  "#12183F",
  "#12183F",
  "#12183F",
];

const brand = [
  "#282D51",
  "#282D51",
  "#222544",
  "#222544",
  "#222544",
  "#222544",
  "#222544",
  "#222544",
  "#262A49",
  "#222544",
];

const brandDark = [
  "#575756",
  "#575756",
  "#575756",
  "#575756",
  "#575756",
  "#575756",
  "#575756",
  "#575756",
  "#575756",
  "#575756",
];

const red = [
  "#ffe8ea",
  "#ffd0d2",
  "#fc9ea4",
  "#fa6971",
  "#f83e47",
  "#f7232c",
  "#f8141e",
  "#dd0613",
  "#c5000e",
  "#ad0009",
];
export const theme = createTheme({
  primaryColor: "primary",
  colors: {
    soft,
    primary,
    secondary,
    brand,
    brandDark,
    red,
  },
});
