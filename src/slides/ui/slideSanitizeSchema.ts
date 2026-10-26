import type { Options as SanitizeSchema } from 'rehype-sanitize';
import { defaultSchema } from 'rehype-sanitize';

/**
 * The MathML Core elements a formula is written with. `annotation-xml`, which
 * may carry HTML, and the legacy `maction` are left out.
 */
const MATHML_ELEMENTS = [
  'math',
  'merror',
  'mfrac',
  'mi',
  'mmultiscripts',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mprescripts',
  'mroot',
  'mrow',
  'ms',
  'mspace',
  'msqrt',
  'mstyle',
  'msub',
  'msubsup',
  'msup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
  'semantics',
  'annotation',
];

/**
 * What every MathML element may carry, colours aside: a formula takes the
 * slide's ink, as everything else on it does.
 */
const MATHML_GLOBAL = ['dir', 'displaystyle', 'mathvariant', 'scriptlevel'];

/** The attributes particular to one MathML element, by hast property name. */
const MATHML_ATTRIBUTES: Record<string, string[]> = {
  math: [...MATHML_GLOBAL, 'display', 'alttext'],
  mo: [
    ...MATHML_GLOBAL,
    'form',
    'fence',
    'separator',
    'lspace',
    'rspace',
    'stretchy',
    'symmetric',
    'maxsize',
    'minsize',
    'largeop',
    'movablelimits',
  ],
  mfrac: [...MATHML_GLOBAL, 'linethickness'],
  mspace: [...MATHML_GLOBAL, 'width', 'height', 'depth'],
  mpadded: [...MATHML_GLOBAL, 'width', 'height', 'depth', 'lspace', 'voffset'],
  mover: [...MATHML_GLOBAL, 'accent'],
  munder: [...MATHML_GLOBAL, 'accentunder'],
  munderover: [...MATHML_GLOBAL, 'accent', 'accentunder'],
  mtd: [...MATHML_GLOBAL, 'columnspan', 'rowSpan'],
  annotation: ['encoding'],
};

/**
 * What survives of the raw HTML a deck writes.
 *
 * GitHub's schema, which already strips scripts, event handlers and every URL
 * that is not http, https or relative, plus what decks legitimately use beyond
 * it: figures, the class a site styles a block with, frames, and formulas
 * written in MathML, which the browser draws natively. Which frame may actually
 * be drawn is decided by `isFamilyFrameSource` when it renders.
 */
export const SLIDE_SANITIZE_SCHEMA: SanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'caption',
    'figcaption',
    'figure',
    'iframe',
    'mark',
    'small',
    'u',
    ...MATHML_ELEMENTS,
  ],
  attributes: {
    ...defaultSchema.attributes,
    ...mathmlAttributes(),
    iframe: ['src', 'allowFullScreen'],
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className'],
  },
};

/**
 * The attributes of every MathML element, those of its own and the global
 * ones.
 * @returns The attribute lists, by element.
 */
function mathmlAttributes(): Record<string, string[]> {
  const attributes: Record<string, string[]> = {};
  for (const element of MATHML_ELEMENTS) {
    attributes[element] = MATHML_ATTRIBUTES[element] ?? MATHML_GLOBAL;
  }
  return attributes;
}
