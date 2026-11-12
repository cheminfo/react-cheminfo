/**
 * The Kratos factors for Al Kα: the instrument every viewer starts with.
 *
 * The Al Kα rows of the CasaXPS element library (`casaXPS.lib`) the Kratos
 * spectra of the examples were quantified with — their fitted C 1s and O 1s
 * carry its 0.278 and 0.78 — normalised to F 1s = 1. Every level is the whole
 * doublet (`2p`, `3d`, `4f`): the library gives the second component a factor
 * of zero, folded into the first, and those rows are left out here, as are the
 * Auger lines, placed in kinetic energy. So is californium, the one element
 * the reference table publishes no level of.
 *
 * The factors are the machine's own, so a survey measured on a Kratos
 * instrument is read with these; Scofield's cross-sections, which know nothing
 * of the analyser, are what is left for a spectrum from anywhere else.
 */

import { expandFactorTable } from './factorTable.ts';
import type { XpsInstrument } from './xpsInstrument.ts';

const LINES: Readonly<Record<string, string>> = {
  Li: '1s 0.025',
  Be: '1s 0.074',
  B: '1s 0.159',
  C: '1s 0.278',
  N: '1s 0.477',
  O: '1s 0.78 2s 0.033',
  F: '1s 1 2s 0.1',
  Ne: '1s 1.34 2s 0.089',
  Na: '1s 1.69 2s 0.167 2p 0.113',
  Mg: '1s 2.62 2s 0.252 2p 0.168',
  Al: '2s 0.426 2p 0.193',
  Si: '2s 0.324 2p 0.328',
  P: '2s 0.344 2p 0.486',
  S: '2s 0.391 2p 0.668',
  Cl: '2s 0.493 2p 0.891',
  Ar: '2s 0.45 2p 1.16',
  K: '2s 0.422 2p 1.47 3s 0.087 3p 0.235',
  Ca: '2s 1.02 2p 1.83 3s 1.4 3p 0.235',
  Sc: '2s 0.511 2p 1.88 3s 1.4 3p 0.226',
  Ti: '2s 0.393 2p 2 3s 1.4 3p 0.333',
  V: '2s 0.637 2p 2.12 3s 0.131 3p 0.274',
  Cr: '2s 0.635 2p 2.43 3s 0.142 3p 0.281',
  Mn: '2s 0.614 2p 2.66 3s 0.165 3p 0.28',
  Fe: '2s 0.603 2p 2.96 3s 0.222 3p 0.37',
  Co: '2s 0.632 2p 3.59 3s 0.196 3p 0.447',
  Ni: '2s 0.603 2p 4.04 3s 0.22 3p 0.598',
  Cu: '2s 0.618 2p 5.32 3s 0.286 3p 1.01',
  Zn: '2s 0.436 2p 5.59 3s 0.312 3p 0.939',
  Ga: '2p 5.58 3s 0.322 3p 0.851 3d 0.439',
  Ge: '3s 0.333 3p 1.12 3d 0.536',
  As: '3s 0.356 3p 1.07 3d 0.677',
  Se: '3s 0.325 3p 1.27 3d 0.853',
  Br: '3s 0.36 3p 1.28 3d 1.06',
  Kr: '3s 0.368 3p 1.46 3d 1.29',
  Rb: '3s 0.387 3p 1.52 3d 1.54',
  Sr: '3s 0.392 3p 1.59 3d 1.84 4s 1.41 4p 0.142',
  Y: '3s 0.29 3p 1.74 3d 2.18 4s 0.098 4p 0.141',
  Zr: '3s 0.696 3p 2.61 3d 2.58 4s 0.063 4p 0.282',
  Nb: '3s 0.393 3p 2.63 3d 2.92 4s 0.126 4p 0.381',
  Mo: '3s 0.396 3p 1.9 3d 3.32 4s 1.4 4p 0.394',
  Tc: '3s 0.409 3p 1.95 3d 3.78 4s 1.39 4p 0.422',
  Ru: '3s 0.419 3p 2.04 3d 4.27 4s 1.39 4p 0.464',
  Rh: '3s 0.428 3p 2.12 3d 4.82 4s 1.39 4p 0.505',
  Pd: '3s 0.436 3p 3.01 3d 5.36 4s 0.129 4p 0.548',
  Ag: '3s 0.393 3p 2.77 3d 5.99 4s 0.118 4p 0.797',
  Cd: '3s 0.409 3p 2.28 3d 6.62 4s 0.126 4p 0.78',
  In: '3s 0.396 3p 2.31 3d 7.27 4s 0.164 4p 0.721 4d 0.284',
  Sn: '3s 0.379 3p 2.25 3d 7.88 4s 0.198 4p 0.69 4d 0.99',
  Sb: '3s 0.358 3p 2.33 3d 8.63 4s 0.175 4p 0.825 4d 1.2',
  Te: '3s 0.33 3p 2.39 3d 9.51 4s 0.174 4p 0.89 4d 1.39',
  I: '3s 0.293 3p 2.33 3d 10.3 4s 0.173 4p 0.953 4d 1.82',
  Xe: '3s 0.238 3p 2.23 3d 11.1 4s 0.171 4p 1.01 4d 2.16',
  Cs: '3s 0.149 3p 2.09 3d 11.7 4s 0.169 4p 1.07 4d 2.5',
  Ba: '3p 1.9 3d 12.4 4s 0.18 4p 1.07 4d 2.93',
  La: '3p 1.65 3d 9.12 4s 0.192 4p 1.07 4d 2.48',
  Ce: '3d 8.81 4s 0.19 4p 1.07 4d 2.46',
  Pr: '3d 7.63 4s 0.189 4p 1.06 4d 2.46',
  Nd: '3d 5.67 4s 0.2 4p 1.06 4d 2.46',
  Pm: '3d 4.6 4s 0.199 4p 1.05 4d 2.45',
  Sm: '3d 6.02 4s 0.21 4p 1.05 4d 2.45',
  Eu: '3d 2.47 4s 0.208 4p 1.04 4d 2.49',
  Gd: '3d 1.87 4s 0.219 4p 1.04 4d 2.48',
  Tb: '4s 0.228 4p 1.03 4d 2.48',
  Dy: '4s 0.238 4p 1.03 4d 2.47',
  Ho: '4s 0.235 4p 1.02 4d 2.47',
  Er: '4s 0.245 4p 1.01 4d 2.46',
  Tm: '4s 0.242 4p 1 4d 2.45',
  Yb: '4s 0.252 4p 1 4d 2.45',
  Lu: '4s 0.249 4p 0.993 4d 2.44',
  Hf: '4s 0.255 4p 0.982 4d 3.94 4f 2.64',
  Ta: '4s 0.244 4p 3.26 4d 5.16 4f 3.08',
  W: '4s 0.261 4p 2.29 4d 4.42 4f 3.52',
  Re: '4s 0.293 4p 1.17 4d 4.24 4f 3.96',
  Os: '4s 0.338 4p 1.16 4d 4.47 4f 4.46',
  Ir: '4s 0.359 4p 1.14 4d 4.55 4f 5.02',
  Pt: '4s 0.378 4p 1.12 4d 4.64 4f 5.58',
  Au: '4s 0.409 4p 3.17 4d 4.84 4f 6.25',
  Hg: '4s 0.406 4p 3.26 4d 3.96 4f 6.92',
  Tl: '4s 0.413 4p 3.7 4d 4.09 4f 8.39',
  Pb: '4s 0.407 4p 3.9 4d 5.6 4f 8.33',
  Bi: '4s 0.414 4p 4.02 4d 4.41 4f 9.14',
  Po: '4s 0.407 4p 4.18 4d 4.57 4f 11',
  At: '4s 0.404 4p 4.3 4d 4.71 4f 12.1',
  Rn: '4s 0.375 4p 4.66 4d 4.85 4f 13.1',
  Fr: '4s 0.317 4p 4.92 4d 4.96 4f 14.1',
  Ra: '4s 0.226 4p 4.97 4d 5.1 4f 15',
  Ac: '4p 5.32 4d 5.19 4f 16',
  Th: '4p 5.14 4d 5.28 4f 12.7',
};

/** The built-in instrument the viewer starts with: Kratos at Al Kα. */
export const KRATOS_AL_KA: XpsInstrument = {
  id: 'kratos-al-ka',
  name: 'Kratos, Al Kα',
  description:
    'Factors relative to F 1s, from the Al Kα part of the CasaXPS element library used with Kratos instruments.',
  factors: expandFactorTable(LINES),
};
