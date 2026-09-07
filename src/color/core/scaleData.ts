/*
 * The colours of the maps the family reads a quantity with, each sampled at
 * nine evenly spaced stops.
 *
 * They are values rather than code: viridis, magma, inferno, plasma and
 * cividis come from matplotlib (CC0), turbo from Google (Apache-2.0) and the
 * diverging pair from ColorBrewer (Apache-2.0), all sampled through
 * `d3-scale-chromatic`. Nine stops interpolated in sRGB reproduce each map
 * closely enough that no eye separates the two, and keeps a scale a plain list
 * a legend and a CSS gradient can both be written from.
 */

/** Viridis: the default, monotone in lightness and safe under colour deficiency. */
export const VIRIDIS_COLORS: readonly string[] = [
  '#440154',
  '#472d7b',
  '#3b528b',
  '#2c728e',
  '#21918c',
  '#28ae80',
  '#5ec962',
  '#addc30',
  '#fde725',
];

/** Plasma: purple to yellow, brighter than viridis at the bottom. */
export const PLASMA_COLORS: readonly string[] = [
  '#0d0887',
  '#4c02a1',
  '#7e03a8',
  '#aa2395',
  '#cc4778',
  '#e66c5c',
  '#f89540',
  '#fdc527',
  '#f0f921',
];

/** Magma: black to cream through violet and orange. */
export const MAGMA_COLORS: readonly string[] = [
  '#000004',
  '#1d1147',
  '#51127c',
  '#832681',
  '#b73779',
  '#e75263',
  '#fc8961',
  '#fec488',
  '#fcfdbf',
];

/** Inferno: black to pale yellow through red, the warmest of the five. */
export const INFERNO_COLORS: readonly string[] = [
  '#000004',
  '#210c4a',
  '#57106e',
  '#8a226a',
  '#bc3754',
  '#e45a31',
  '#f98e09',
  '#f9cb35',
  '#fcffa4',
];

/** Cividis: blue to yellow, built to read the same to a deuteranope. */
export const CIVIDIS_COLORS: readonly string[] = [
  '#002051',
  '#11366c',
  '#3c4d6e',
  '#62646f',
  '#7f7c75',
  '#9a9478',
  '#bbaf71',
  '#e2cb5c',
  '#fdea45',
];

/** Turbo: the colours of a rainbow, ordered so the lightness still climbs. */
export const TURBO_COLORS: readonly string[] = [
  '#23171b',
  '#4569ee',
  '#26bce1',
  '#3ff393',
  '#95fb51',
  '#ecd12e',
  '#ff821d',
  '#cb2f0d',
  '#900c00',
];

/** Greys: light to black, for a figure that will be printed or photocopied. */
export const GREYS_COLORS: readonly string[] = [
  '#ebebeb',
  '#d7d7d7',
  '#bebebe',
  '#a0a0a0',
  '#818181',
  '#646464',
  '#444444',
  '#202020',
  '#000000',
];

/** Cool to warm: blue through pale yellow to red, for a quantity with a middle. */
export const COOL_WARM_COLORS: readonly string[] = [
  '#313695',
  '#5382bb',
  '#90c2dd',
  '#d1ebef',
  '#faf8c1',
  '#fed284',
  '#f88d52',
  '#dd4030',
  '#a50026',
];

/** Blue to red through white, the diverging map with the palest middle. */
export const BLUE_RED_COLORS: readonly string[] = [
  '#053061',
  '#2a71ae',
  '#6bacd0',
  '#bfdceb',
  '#f2efee',
  '#faccb4',
  '#e48268',
  '#b82d35',
  '#67001f',
];
