/**
 * What a consumer hands the chart, and what the chart tells it back.
 *
 * Held apart from the component because it is the whole of the chart's public
 * API — every spectrum drawn, every claim laid over it and every gesture that
 * comes back out is one of these — while the component behind it is an assembly
 * of a dozen layers nobody needs to read in order to mount one.
 *
 * Everything arrives as a prop and nothing is reached for: the chart reads no
 * context and no store and holds no state of its own, so the same component
 * serves the editor, a report page that only ever draws one spectrum, and a
 * test.
 */

import type { XpsHighlight } from '../core/xpsHighlight.ts';
import type { XpsDomain, XpsSpectrum } from '../core/xpsSpectrum.ts';
import type { XpsSettings } from '../core/xpsState.ts';

export interface XpsChartProps {
  /** The spectra to draw, in the order they are stacked. */
  spectra: readonly XpsSpectrum[];
  /** How they are drawn. */
  settings: XpsSettings;
  /** The window, `null` to fit what is drawn. */
  domain: XpsDomain | null;
  /**
   * Identity of the spectrum the panels act on, `null` for none.
   * @default null
   */
  selectedId?: string | null;
  /**
   * What the pointer is resting on, anywhere in the viewer.
   * @default NO_HIGHLIGHT
   */
  highlight?: XpsHighlight;
  /** Called with the window a gesture asked for, `null` to fit again. */
  onDomainChange: (domain: XpsDomain | null) => void;
  /**
   * Called with what the pointer is over, for the rest of the viewer.
   * @default undefined
   */
  onHighlightChange?: (highlight: XpsHighlight) => void;
  /**
   * Called with the binding energy of a click, so a panel can look it up.
   * @default undefined
   */
  onPickEnergy?: (bindingEnergy: number | null) => void;
  /**
   * Called when a trace is clicked.
   * @default undefined
   */
  onSelectSpectrum?: (id: string) => void;
  /**
   * Whether a file is being dragged over the chart.
   * @default false
   */
  isOver?: boolean;
  /**
   * Whether a dropped file is still being read.
   * @default false
   */
  isReading?: boolean;
}
