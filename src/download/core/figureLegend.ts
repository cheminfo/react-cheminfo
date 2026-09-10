/**
 * The key, painted into the file the figure leaves the page as.
 *
 * A legend is HTML — it is a filter the reader presses, not a drawing — so it
 * is inside the chrome the export otherwise leaves behind. But a saved figure
 * without its key says nothing: a reader looking at three colours has no way
 * back to the three species. So the card is redrawn, once, in SVG, from the
 * boxes the browser laid it out in.
 *
 * It is redrawn from measurements rather than re-derived from the styles that
 * made it, so the copy cannot drift from the card on screen: whatever the
 * browser did with the wrapping, the folding and the type, that is what the
 * file gets.
 */

/** The card the entries sit on. */
export interface FigureLegendCard {
  /** Its width, in pixels. */
  width: number;
  /** Its height. */
  height: number;
  /**
   * How round its corners are, in pixels.
   * @default 0
   */
  radius?: number;
  /**
   * What is painted behind it.
   * @default undefined — nothing is painted
   */
  background?: string;
  /**
   * The colour of the line round it.
   * @default undefined — no line is drawn
   */
  border?: string;
  /**
   * How heavy that line is, in pixels.
   * @default 1
   */
  borderWidth?: number;
}

/** One mark of the key, already an SVG of its own. */
export interface FigureLegendMark {
  /** The `<svg>` element as it was serialized, tokens already resolved. */
  markup: string;
  /** Its left edge, in pixels from the left of the card. */
  x: number;
  /** Its top edge, in pixels from the top of the card. */
  y: number;
}

/** One run of words of the key. */
export interface FigureLegendText {
  /** What it says. */
  text: string;
  /** Its left edge, in pixels from the left of the card. */
  x: number;
  /** The middle of its line, in pixels from the top of the card. */
  y: number;
  /**
   * Its colour.
   * @default undefined — the document's own
   */
  color?: string;
  /**
   * Its size, in pixels.
   * @default undefined — the document's own
   */
  fontSize?: number;
  /**
   * Its weight.
   * @default undefined — the document's own
   */
  fontWeight?: string;
}

/** A key, measured off the page and ready to be painted. */
export interface FigureLegendPrint {
  /** The card itself. */
  card: FigureLegendCard;
  /** Its marks, in the order they are drawn. */
  marks: readonly FigureLegendMark[];
  /** Its words, in the order they are drawn. */
  texts: readonly FigureLegendText[];
}

/**
 * A key, as the markup that goes into the saved figure.
 * @param print - The card, its marks and its words. See {@link FigureLegendPrint}.
 * @returns The markup, in the card's own coordinates: the caller places it.
 */
export function figureLegendMarkup(print: FigureLegendPrint): string {
  const { card, marks, texts } = print;
  const parts: string[] = [groundMarkup(card)];

  for (const mark of marks) {
    parts.push(
      `<g transform="translate(${round(mark.x)} ${round(mark.y)})">${mark.markup}</g>`,
    );
  }
  for (const run of texts) parts.push(textMarkup(run));

  return parts.join('');
}

/**
 * The card the entries are written on.
 * @param card - Its measurements. See {@link FigureLegendCard}.
 * @returns Its markup, or nothing when the card has neither ground nor line.
 */
function groundMarkup(card: FigureLegendCard): string {
  const { width, height, radius = 0, background, border } = card;
  if (background === undefined && border === undefined) return '';

  const borderWidth = card.borderWidth ?? 1;
  // Drawn inside its own line, which a stroke otherwise straddles: half of it
  // would fall outside the card and be clipped by the figure's edge.
  const inset = border === undefined ? 0 : borderWidth / 2;
  const line =
    border === undefined
      ? ''
      : ` stroke="${attribute(border)}" stroke-width="${round(borderWidth)}"`;

  return (
    `<rect x="${round(inset)}" y="${round(inset)}"` +
    ` width="${round(Math.max(0, width - inset * 2))}"` +
    ` height="${round(Math.max(0, height - inset * 2))}"` +
    ` rx="${round(radius)}" fill="${attribute(background ?? 'none')}"${line}/>`
  );
}

/**
 * One run of words, set on the middle of the line it was laid out on.
 * @param run - The words and where they sit. See {@link FigureLegendText}.
 * @returns Its markup, or nothing when it says nothing.
 */
function textMarkup(run: FigureLegendText): string {
  if (run.text === '') return '';

  const fill = run.color === undefined ? '' : ` fill="${attribute(run.color)}"`;
  const size =
    run.fontSize === undefined ? '' : ` font-size="${round(run.fontSize)}px"`;
  const weight =
    run.fontWeight === undefined
      ? ''
      : ` font-weight="${attribute(run.fontWeight)}"`;

  return (
    `<text x="${round(run.x)}" y="${round(run.y)}" dominant-baseline="central"` +
    `${fill}${size}${weight}>${text(run.text)}</text>`
  );
}

function attribute(value: string): string {
  return text(value).replaceAll('"', '&quot;');
}

function text(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

const round = (value: number): number => Math.round(value * 100) / 100;
