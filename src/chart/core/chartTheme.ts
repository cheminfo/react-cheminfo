/**
 * Every colour and every measurement the chart is drawn with.
 *
 * Each colour is a custom property with a literal fallback baked in, and is
 * applied through the `style` prop rather than through the matching SVG
 * attribute — `fill="var(--spectrum-axis, #64748b)"` is not a colour any browser
 * resolves, because `var()` is a CSS value and a presentation attribute is not
 * parsed as one. `style={{ fill: CHART_COLORS.axis }}` is.
 *
 * One set of tokens for every viewer built on this package, rather than one per
 * viewer: a page showing a mass spectrum beside an infrared one is showing two
 * charts that have to look like the same instrument, and two token families
 * would let them drift apart at the first theme change.
 *
 * The fallbacks are what make the package usable on its own: a host that sets
 * none of these tokens still gets a chart that reads correctly, and a host with
 * a dark theme or a house palette overrides whichever it cares about by setting
 * the properties on any ancestor. Nothing here is a prop, because a colour
 * threaded through props is a colour that ends up hard-coded in one component
 * that forgot to accept it.
 */

/** The colours of everything the chart draws that is not a spectrum. */
export const CHART_COLORS = {
  /** The two axis lines and their ticks. */
  axis: 'var(--spectrum-axis, #64748b)',
  /** The numbers along both axes. */
  tick: 'var(--spectrum-tick, #475569)',
  /** The axis titles, whatever the viewer calls its two axes. */
  title: 'var(--spectrum-title, #334155)',
  /** The rules across the plot, behind the data. */
  grid: 'var(--spectrum-grid, #e2e8f0)',
  /** The rule at zero, which a mirrored pair is reflected in. */
  zeroRule: 'var(--spectrum-zero-rule, #cbd5e1)',
  /** A mark on a feature an annotation explained. */
  annotation: 'var(--spectrum-annotation, #2563eb)',
  /**
   * A mark where an annotation nothing answered would fall, drawn dashed. Grey
   * rather than red: a fragment the spectrum does not carry is an answer, and
   * colouring it as a failure would say the opposite.
   */
  annotationUnmatched: 'var(--spectrum-annotation-unmatched, #cbd5e1)',
  /**
   * A mark on a place the measurement drawn below was cut from — the peaks a
   * survey scan was fragmented at.
   *
   * Its own token rather than the annotation blue, because the two are claims
   * of different kinds laid over the same peaks: an annotation says *this is
   * what I think that peak is*, and a precursor mark says *this is what the
   * instrument did with it*. A spectrum can carry both at once, and a reader
   * has to be able to tell one row of marks from the other.
   */
  precursor: 'var(--spectrum-precursor, #7c3aed)',
  /** The line from a label back down to the peak it belongs to. */
  leader: 'var(--spectrum-leader, #94a3b8)',
  /** The fill of a label box, opaque enough to read over a dense trace. */
  labelBackground:
    'var(--spectrum-label-background, rgba(255, 255, 255, 0.88))',
  /** Its border. */
  labelBorder: 'var(--spectrum-label-border, #cbd5e1)',
  /** The text inside it. */
  labelText: 'var(--spectrum-label-text, #1e293b)',
  /**
   * The paper a label written straight onto the plot is set on, laid behind its
   * glyphs rather than in a box around them — the colour of the chart itself,
   * which is why a host with a dark theme has to override it along with the rest.
   */
  labelHalo: 'var(--spectrum-label-halo, #ffffff)',
  /** Whatever the pointer has come to rest on, wherever it was hovered. */
  highlight: 'var(--spectrum-highlight, #f97316)',
  /** The rectangle a drag is sweeping out. */
  selection: 'var(--spectrum-selection, rgba(37, 99, 235, 0.12))',
  /** Its edge. */
  selectionBorder: 'var(--spectrum-selection-border, #2563eb)',
  /** The crosshair following the pointer. */
  tracker: 'var(--spectrum-tracker, #94a3b8)',
  /** What it reads out. */
  trackerText: 'var(--spectrum-tracker-text, #0f172a)',
} as const;

/**
 * The type sizes, in pixels.
 *
 * Small and fixed rather than inherited: the chart is a drawing, and a host
 * whose base font is 18px would push its tick labels into one another. The
 * family is deliberately not set here, so the chart still looks like the
 * application it is embedded in.
 */
export const CHART_FONT = {
  /** The numbers along both axes. */
  tick: 10,
  /** The axis titles. */
  title: 12,
  /** The labels pinned above the peaks. */
  label: 11,
  /** The readout the crosshair carries. */
  readout: 11,
} as const;

/**
 * The geometry of a label pinned above a feature.
 *
 * A label is two lines often enough — an m/z over a formula, a wavenumber over
 * the group it is assigned to — that the spacing has to be a constant both the
 * drawing and the declutter sweep agree on, or the boxes are spaced for one
 * height and drawn at another.
 */
export const PEAK_LABEL = {
  /** The baseline-to-baseline distance between two stacked lines. */
  lineHeight: 11,
  /** The clear space between the top of a stick and its first line. */
  topPad: 10,
  /**
   * How far the mark on a named peak reaches from the tip of its stick.
   *
   * It reaches *away* from the stack, down into the peak, because the clear
   * space above the tip is where the numbers are written and the mark is there
   * to say which peak they are about. Short on purpose: what is drawn is the
   * **top of the centroid stick**, enough to put a picked peak exactly on the
   * profile it was picked from — a rule carried all the way to the baseline is
   * the centroid trace itself, which is the other thing the row toggles.
   */
  topMark: 10,
  /**
   * Half the width a label claims while the pointer is on it, which is what the
   * declutter sweep keeps its neighbours out of.
   */
  hoverHalfWidth: 26,
} as const;

/**
 * The halo a label written straight onto the plot carries.
 *
 * A number over a peak is written over whatever the plot has there — a grid
 * line, a dense trace, the crosshair following the pointer, the tail of the
 * label beside it — and a glyph crossed by a line is a glyph read twice before
 * it is read at all. So the glyphs are stroked in the colour of the paper and
 * that stroke is painted *first*, which clears a hairline of chart from around
 * every letter without a box, a border or a fill hiding the data underneath.
 *
 * `paintOrder` is the whole of it and is easy to leave out: the default order
 * paints the stroke over the fill, so the same three properties without it draw
 * every label in white on white.
 */
export const LABEL_HALO = {
  paintOrder: 'stroke',
  stroke: CHART_COLORS.labelHalo,
  strokeWidth: 3,
  strokeLinejoin: 'round',
} as const;

/**
 * How far the supporting line of a label is let back towards the paper.
 *
 * A label is rarely one thing: a mass peak carries what it is *and* how tall it
 * stood, and the crosshair reads a place on both axes at once. Written in one
 * ink they are read together, which means the line somebody wants has to be
 * found among the ones they do not. Six tenths is enough to grade them apart at
 * eleven pixels and not so far as to make the quiet line look disabled.
 */
export const LABEL_QUIET = 0.6;
