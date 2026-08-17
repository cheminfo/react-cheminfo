/**
 * The real spherical harmonics, ℓ = 0 to 3, written as cartesian ratios.
 *
 * These are the angular halves of the orbitals a chemist draws: the real
 * combinations `p_x, p_y, p_z` rather than the complex `m = −1, 0, +1`, because
 * only the real ones have the lobes along axes that a bond can point at.
 *
 * Each is normalised so that `∫|Y|² dΩ = 1` over the unit sphere, and each is
 * given `(x, y, z)` in ångström together with their length, so sampling a grid
 * never calls `acos` or `atan2`. The number of angular nodes is exactly ℓ, and
 * this file is where that fact becomes visible: `s` has none, every `p` has one
 * plane, every `d` two surfaces, every `f` three.
 *
 * `key` is ascii and appears in a URL — `#/elements/Fe/3dx2-y2`; `label` is the
 * typeset subscript a student reads.
 */

/** Subshell letter for an angular momentum, `s p d f`. */
export const SUBSHELL_LETTERS = ['s', 'p', 'd', 'f'] as const;

/** One real spherical harmonic. */
export interface RealHarmonic {
  /** Angular momentum quantum number, also the count of angular nodes. */
  l: number;
  /** Ascii subscript, url-safe: `x`, `z2`, `x2-y2`, `y_3x2-y2`. */
  key: string;
  /** Typeset subscript, e.g. `x²−y²`. Empty for `s`. */
  label: string;
  /**
   * Value of the harmonic at a point.
   * @param x - Offset from the nucleus along x, ångström.
   * @param y - Offset from the nucleus along y, ångström.
   * @param z - Offset from the nucleus along z, ångström.
   * @param radius - Length of `(x, y, z)`, passed in because the caller has
   * already computed it for the radial part.
   * @returns The dimensionless amplitude; 0 at the nucleus for ℓ > 0.
   */
  evaluate: (x: number, y: number, z: number, radius: number) => number;
}

const FOUR_PI = 4 * Math.PI;

const S = Math.sqrt(1 / FOUR_PI);
const P = Math.sqrt(3 / FOUR_PI);
const D_Z2 = Math.sqrt(5 / (16 * Math.PI));
const D_PLANAR = Math.sqrt(15 / FOUR_PI);
const D_X2Y2 = Math.sqrt(15 / (16 * Math.PI));
const F_Z3 = Math.sqrt(7 / (16 * Math.PI));
const F_XZ2 = Math.sqrt(21 / (32 * Math.PI));
const F_ZX2Y2 = Math.sqrt(105 / (16 * Math.PI));
const F_XYZ = Math.sqrt(105 / FOUR_PI);
const F_CUBIC = Math.sqrt(35 / (32 * Math.PI));

/**
 * The harmonics of one shell, indexed by ℓ: `REAL_HARMONICS[2]` is the five d
 * functions. The order inside a shell is the one the orbital list shows.
 */
export const REAL_HARMONICS: RealHarmonic[][] = [
  [{ l: 0, key: '', label: '', evaluate: () => S }],
  [
    { l: 1, key: 'x', label: 'x', evaluate: (x, y, z, r) => (P * x) / r },
    { l: 1, key: 'y', label: 'y', evaluate: (x, y, z, r) => (P * y) / r },
    { l: 1, key: 'z', label: 'z', evaluate: (x, y, z, r) => (P * z) / r },
  ],
  [
    {
      l: 2,
      key: 'z2',
      label: 'z²',
      evaluate: (x, y, z, r) => (D_Z2 * (3 * z * z - r * r)) / (r * r),
    },
    {
      l: 2,
      key: 'xz',
      label: 'xz',
      evaluate: (x, y, z, r) => (D_PLANAR * x * z) / (r * r),
    },
    {
      l: 2,
      key: 'yz',
      label: 'yz',
      evaluate: (x, y, z, r) => (D_PLANAR * y * z) / (r * r),
    },
    {
      l: 2,
      key: 'xy',
      label: 'xy',
      evaluate: (x, y, z, r) => (D_PLANAR * x * y) / (r * r),
    },
    {
      l: 2,
      key: 'x2-y2',
      label: 'x²−y²',
      evaluate: (x, y, z, r) => (D_X2Y2 * (x * x - y * y)) / (r * r),
    },
  ],
  [
    {
      l: 3,
      key: 'z3',
      label: 'z³',
      evaluate: (x, y, z, r) =>
        (F_Z3 * z * (5 * z * z - 3 * r * r)) / (r * r * r),
    },
    {
      l: 3,
      key: 'xz2',
      label: 'xz²',
      evaluate: (x, y, z, r) => (F_XZ2 * x * (5 * z * z - r * r)) / (r * r * r),
    },
    {
      l: 3,
      key: 'yz2',
      label: 'yz²',
      evaluate: (x, y, z, r) => (F_XZ2 * y * (5 * z * z - r * r)) / (r * r * r),
    },
    {
      l: 3,
      key: 'xyz',
      label: 'xyz',
      evaluate: (x, y, z, r) => (F_XYZ * x * y * z) / (r * r * r),
    },
    {
      l: 3,
      key: 'z_x2-y2',
      label: 'z(x²−y²)',
      evaluate: (x, y, z, r) => (F_ZX2Y2 * z * (x * x - y * y)) / (r * r * r),
    },
    {
      l: 3,
      key: 'x_x2-3y2',
      label: 'x(x²−3y²)',
      evaluate: (x, y, z, r) =>
        (F_CUBIC * x * (x * x - 3 * y * y)) / (r * r * r),
    },
    {
      l: 3,
      key: 'y_3x2-y2',
      label: 'y(3x²−y²)',
      evaluate: (x, y, z, r) =>
        (F_CUBIC * y * (3 * x * x - y * y)) / (r * r * r),
    },
  ],
];

/**
 * The harmonics of one subshell.
 * @param l - Angular momentum quantum number, 0 to 3.
 * @returns Its `2ℓ + 1` real harmonics, in list order.
 * @throws {Error} When ℓ is outside the s, p, d and f shells this site draws.
 */
export function harmonicsOf(l: number): RealHarmonic[] {
  const shell = REAL_HARMONICS[l];
  if (shell === undefined) {
    throw new RangeError(`no real harmonics for angular momentum ${l}`);
  }
  return shell;
}

/**
 * The letter naming a subshell.
 * @param l - Angular momentum quantum number, 0 to 3.
 * @returns `s`, `p`, `d` or `f`.
 * @throws {Error} When ℓ is outside them.
 */
export function subshellLetter(l: number): string {
  const letter = SUBSHELL_LETTERS[l];
  if (letter === undefined) {
    throw new RangeError(`no subshell letter for angular momentum ${l}`);
  }
  return letter;
}
