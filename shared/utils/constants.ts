/**
 * Colorblind-safe categorical palette (Okabe–Ito).
 *
 * Ordered so that any prefix stays maximally distinguishable: if you need
 * N colors, take the first N (see `getColorblindSafeColors`). The first two
 * (blue/orange) are the most robust pair across all common types of color
 * vision deficiency; later entries add hue/lightness variety.
 *
 * Notes:
 * - `yellow` has low contrast on light backgrounds and `black` disappears on
 *   dark ones, which is why they come last.
 * - Pair color with a secondary cue (labels, patterns, markers) where possible.
 *
 * Reference: https://jfly.uni-koeln.de/color/
 */
export const COLORBLIND_SAFE_COLORS = [
  { name: "blue", hex: "#0072B2" },
  { name: "orange", hex: "#E69F00" },
  { name: "bluishGreen", hex: "#009E73" },
  { name: "reddishPurple", hex: "#CC79A7" },
  { name: "skyBlue", hex: "#56B4E9" },
  { name: "vermillion", hex: "#D55E00" },
  { name: "yellow", hex: "#F0E442" },
  { name: "black", hex: "#000000" },
] as const;

export type ColorblindSafeColor = (typeof COLORBLIND_SAFE_COLORS)[number];

/**
 * Returns the first `count` hex colors from the palette. If `count` exceeds
 * the palette size, colors repeat (pair them with another visual cue).
 */
export const getColorblindSafeColors = (count: number): string[] =>
  Array.from({ length: Math.max(0, count) }, (_, i) =>
    getColorblindSafeColor(i),
  );

/** Returns the hex color for a given index, wrapping around the palette. */
export const getColorblindSafeColor = (index: number): string => {
  const len = COLORBLIND_SAFE_COLORS.length;

  return COLORBLIND_SAFE_COLORS[((index % len) + len) % len]!.hex;
};
