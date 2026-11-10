/**
 * The peak shapes a fit was made with, and how tall each of them stands.
 *
 * A CASA block states a component as a position, a width, an **area** and a
 * shape name — never as a height — because the area is what a composition is
 * computed from. Drawing one therefore means turning that area back into an
 * amplitude, and the factor doing it is a property of the shape: the same area
 * under the same FWHM is 1.48 times taller as a Gaussian than as a Lorentzian,
 * because the Lorentzian keeps a third of itself out in tails the eye never
 * counts.
 *
 * The names come out of the file exactly as CASA wrote them — `GL(30)`,
 * `SGL(20)`, `LA(1.53, 243, 25)` — so parsing them is part of drawing them.
 * Anything unrecognised falls back to a pseudo-Voigt rather than to nothing: a
 * component drawn a little wrong in the tails still says where the chemistry
 * sits, where a component not drawn at all silently removes a claim the file
 * made.
 */

/** How a fitted component is drawn. */
export type ComponentShapeKind =
  'gaussian' | 'lorentzian' | 'pseudoVoigt' | 'asymmetric';

/** A shape, as the drawing needs it rather than as the file wrote it. */
export interface ComponentShape {
  /** Which family it belongs to. */
  kind: ComponentShapeKind;
  /** How much of it is Lorentzian: `0` pure Gaussian, `1` pure Lorentzian. */
  lorentzianFraction: number;
  /** The exponent on the low-energy flank of an asymmetric shape. */
  lowExponent: number;
  /** The exponent on the high-energy flank. */
  highExponent: number;
  /**
   * The integral of the unit-height shape over `t = (energy − centre) / fwhm`,
   * which is what turns a stated area into an amplitude.
   */
  integral: number;
}

/** One fitted peak, in the units of the axis it is being drawn on. */
export interface ComponentPeak {
  /** Where it sits, in eV of whichever axis the chart is drawn against. */
  centre: number;
  /** Full width at half maximum, in eV. */
  fwhm: number;
  /** Area under it, in counts × eV, as the file states it. */
  area: number;
  /** The shape, as the file names it. */
  shape: string;
}

/**
 * How much Lorentzian a shape nobody named is taken to hold.
 *
 * Thirty percent is what CASA offers first and what most published fits use, so
 * an unnamed shape is drawn as the one it most likely was rather than as a pure
 * Gaussian nobody fits with.
 */
export const DEFAULT_LORENTZIAN_FRACTION = 0.3;

/** The integral of a unit-height Gaussian over `t`, `sqrt(pi / (4 ln2))`. */
export const GAUSSIAN_INTEGRAL = Math.sqrt(Math.PI / (4 * Math.LN2));

/** The integral of a unit-height Lorentzian over `t`, `pi / 2`. */
export const LORENTZIAN_INTEGRAL = Math.PI / 2;

/**
 * Read a shape name into something that can be drawn.
 *
 * CASA's notation is a family letter and its parameters in brackets, and the
 * number in `GL(30)` is the **percentage of Lorentzian**: `GL(0)` is a pure
 * Gaussian and `GL(100)` a pure Lorentzian. `SGL` is the sum form of the same
 * mixture and `GL` the product form; both are drawn here as the sum, which is
 * the ordinary pseudo-Voigt — the two differ by a few percent in the flanks and
 * by nothing a reader of a chart can act on.
 *
 * `LA(α, β, m)` is the asymmetric Lorentzian a metal's conduction band needs:
 * the flank exponents are `α` low and `β` high, and the Gaussian width `m` it is
 * convolved with is ignored, since convolving at draw time costs more than the
 * shoulder it rounds off is worth. A name that states no exponents has nothing
 * to be asymmetric by and is drawn as the Lorentzian it reduces to.
 * @param shape - The name as the file wrote it; case and spacing are free.
 * @returns The shape, a pseudo-Voigt of `DEFAULT_LORENTZIAN_FRACTION` for any
 * name that is not one of the known families.
 */
export function parseComponentShape(shape: string): ComponentShape {
  const text = shape.trim().toLowerCase();
  const parameters = shapeParameters(text);

  if (text.startsWith('la') || text.startsWith('lorentzianasym')) {
    const low = usableExponent(parameters[0], 1);
    const high = usableExponent(parameters[1], low);
    return {
      kind: 'asymmetric',
      lorentzianFraction: 1,
      lowExponent: low,
      highExponent: high,
      integral: asymmetricIntegral(low, high),
    };
  }
  if (text.startsWith('gl') || text.startsWith('sgl')) {
    return mixed(percentage(parameters[0]));
  }
  if (text.startsWith('gaussianlorentzian')) {
    return mixed(DEFAULT_LORENTZIAN_FRACTION);
  }
  if (text.startsWith('gaussian') || text === 'g') return mixed(0);
  if (text.startsWith('lorentzian') || text === 'l') return mixed(1);
  return mixed(DEFAULT_LORENTZIAN_FRACTION);
}

/**
 * The unit-height shape at a distance from its own centre.
 *
 * `t` is in full widths at half maximum, so every family below reads `0.5` at
 * `t = ±0.5` by construction and the width the file states is the width drawn.
 * @param shape - The shape.
 * @param t - How far from the centre, in FWHM.
 * @returns Its value, `1` at the centre and falling away either side.
 */
export function shapeValue(shape: ComponentShape, t: number): number {
  if (!Number.isFinite(t)) return 0;
  if (shape.kind === 'asymmetric') {
    return lorentzian(t) ** (t < 0 ? shape.lowExponent : shape.highExponent);
  }
  const mix = shape.lorentzianFraction;
  if (mix <= 0) return gaussian(t);
  if (mix >= 1) return lorentzian(t);
  return (1 - mix) * gaussian(t) + mix * lorentzian(t);
}

/**
 * Build a mixture of a Gaussian and a Lorentzian.
 * @param fraction - How much of it is Lorentzian, from 0 to 1.
 * @returns The shape, named for the family it collapses to at either end.
 */
function mixed(fraction: number): ComponentShape {
  const mix = Math.min(1, Math.max(0, fraction));
  let kind: ComponentShapeKind = 'pseudoVoigt';
  if (mix === 0) kind = 'gaussian';
  else if (mix === 1) kind = 'lorentzian';
  return {
    kind,
    lorentzianFraction: mix,
    lowExponent: 1,
    highExponent: 1,
    integral: (1 - mix) * GAUSSIAN_INTEGRAL + mix * LORENTZIAN_INTEGRAL,
  };
}

/**
 * A unit-height Gaussian in units of its own FWHM.
 * @param t - How far from the centre, in FWHM.
 * @returns Its value, `0.5` at `t = ±0.5`.
 */
function gaussian(t: number): number {
  return Math.exp(-4 * Math.LN2 * t * t);
}

/**
 * A unit-height Lorentzian in units of its own FWHM.
 * @param t - How far from the centre, in FWHM.
 * @returns Its value, `0.5` at `t = ±0.5`.
 */
function lorentzian(t: number): number {
  return 1 / (1 + 4 * t * t);
}

/** How far out an asymmetric shape is integrated, in FWHM. */
const INTEGRATION_REACH = 40;

/** How many slices that reach is cut into, either side of the centre. */
const INTEGRATION_SLICES = 4000;

/**
 * The integral of a unit-height asymmetric Lorentzian, worked out numerically.
 *
 * There is a closed form in gamma functions and it is not worth carrying one:
 * the midpoint sum below settles to five figures in a few thousand terms, and it
 * is computed once per component rather than once per drawn point. An exponent
 * below one leaves a tail with no finite integral at all, which the reach then
 * truncates — the drawn peak is a hair too tall, and every alternative is worse.
 * @param lowExponent - The exponent on the low-energy flank.
 * @param highExponent - The exponent on the high-energy flank.
 * @returns The integral over `t`, in FWHM.
 */
function asymmetricIntegral(lowExponent: number, highExponent: number): number {
  const step = INTEGRATION_REACH / INTEGRATION_SLICES;
  let sum = 0;
  for (let slice = 0; slice < INTEGRATION_SLICES; slice++) {
    const t = (slice + 0.5) * step;
    sum += lorentzian(t) ** highExponent + lorentzian(t) ** lowExponent;
  }
  return sum * step;
}

/**
 * The numbers inside a shape name's brackets.
 * @param text - The name, lowercased and trimmed.
 * @returns The numbers in the order they were written, empty when none.
 */
function shapeParameters(text: string): number[] {
  const open = text.indexOf('(');
  if (open === -1) return [];
  const close = text.indexOf(')', open);
  const inside = text.slice(open + 1, close === -1 ? undefined : close);
  const numbers: number[] = [];
  for (const part of inside.split(',')) {
    const value = Number.parseFloat(part.trim());
    if (Number.isFinite(value)) numbers.push(value);
  }
  return numbers;
}

/**
 * A percentage of Lorentzian, as a fraction.
 * @param value - The number the name stated, absent when it stated none.
 * @returns The fraction, `DEFAULT_LORENTZIAN_FRACTION` when unstated.
 */
function percentage(value: number | undefined): number {
  if (value === undefined) return DEFAULT_LORENTZIAN_FRACTION;
  return Math.min(1, Math.max(0, value / 100));
}

/**
 * A flank exponent, as a number a shape survives.
 * @param value - The number the name stated, absent when it stated none.
 * @param fallback - What to use instead.
 * @returns The exponent, above zero.
 */
function usableExponent(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return value;
}
