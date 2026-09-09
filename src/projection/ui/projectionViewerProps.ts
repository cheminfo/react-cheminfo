/**
 * What a caller hands a {@link ProjectionViewer}, and what it hands back.
 *
 * The types live beside the component rather than inside it because the shell
 * is short and its options are not: a reader looking for what the viewer does
 * should not have to scroll past a page of documented props to find it.
 */

import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionCopyPatch } from '../core/projectionCopyPatch.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';
import type { ProjectionSamples } from '../core/projectionSamples.ts';
import type { ProjectionTab } from '../core/projectionTabs.ts';

import type { ProjectionVariableTrack } from './ProjectionVariablesTab.tsx';
import type { ProjectionSelection } from './projectionSelection.ts';

/** What {@link ProjectionViewer} needs. */
export interface ProjectionViewerProps {
  /** What the run produced, whatever produced it. */
  result: ProjectionResult;
  /** Who the rows are. */
  samples: ProjectionSamples;
  /**
   * The tab showing. Present, the caller owns it, which is how a page puts the
   * tab in its own URL.
   * @default undefined — the viewer keeps its own
   */
  tab?: ProjectionTab;
  /**
   * Which panels the site offers, in any order.
   *
   * The viewer already hides a panel the result cannot fill, so this is for the
   * other reason a panel should not be there: the page around it has no room,
   * or has already said the same thing in its own words. Naming a panel the
   * result cannot fill does not conjure it, and the map survives every filter —
   * a viewer showing nothing at all is not a viewer.
   *
   * With one panel left there are no pills, so `panels={['map']}` is how a site
   * embeds the scores plot and nothing else.
   * @default undefined — every panel the result can fill
   */
  panels?: readonly ProjectionTab[];
  /**
   * The tab it opens on. A tab the result cannot fill, or that `panels` leaves
   * out, is ignored.
   * @default the first tab the result can fill
   */
  defaultTab?: ProjectionTab;
  /**
   * Called when the reader moves to another tab.
   * @default undefined
   */
  onTabChange?: (tab: ProjectionTab) => void;
  /**
   * The selected rows, by name. Present, the caller owns the selection; the
   * outline drawn while a lasso is being dragged stays inside the viewer
   * either way.
   * @default undefined — the viewer keeps its own
   */
  selected?: readonly string[];
  /**
   * The rows selected when it opens.
   * @default undefined — nothing is selected
   */
  defaultSelected?: readonly string[];
  /**
   * Called when a lasso is released, a dot is clicked, a group is picked from
   * the legend, or the selection is cleared — never while a lasso is being
   * drawn, because a caller filtering a table behind it could not survive
   * sixty calls a second. The rows arrive by name, so a caller never has to
   * keep a second copy of the row order to read them.
   * @default undefined
   */
  onSelectionChange?: (selection: ProjectionSelection) => void;
  /**
   * Called as the pointer crosses the "what differs" panels, and with `null`
   * when it leaves. It fires on every measurement the pointer enters, so a
   * caller doing real work in it — lighting a band on a spectrum beside the
   * viewer — should hold the value in a ref rather than in state.
   * @default undefined
   */
  onTrackVariable?: (track: ProjectionVariableTrack | null) => void;
  /**
   * Called with the row under the pointer on the map, or `null`. The card is
   * drawn either way; this is for a page lighting up its own table.
   * @default undefined
   */
  onHoverSample?: (id: string | null) => void;
  /**
   * What the figure is showing. Present, the caller owns every option, which
   * is how a site persists them or writes them into a share link.
   * @default undefined — the viewer keeps its own
   */
  options?: Partial<ProjectionOptions>;
  /**
   * The options it opens with, when it keeps its own.
   * @default {}
   */
  defaultOptions?: Partial<ProjectionOptions>;
  /**
   * Called with every option after a change, not only the one that changed.
   * @default undefined
   */
  onOptionsChange?: (options: ProjectionOptions) => void;
  /**
   * The words the viewer writes, merged over its own one key at a time.
   * @default PROJECTION_COPY
   */
  copy?: ProjectionCopyPatch<ProjectionCopy>;
  /**
   * Height of the figure, in pixels. The width always follows the container.
   * @default 460
   */
  height?: number;
  /**
   * How a number is written in a hover card and a readout.
   * @default a rounding to three decimals with the trailing zeros dropped
   */
  formatValue?: (value: number) => string;
  /**
   * Whether a drag on a touch screen draws a lasso rather than scrolling the
   * page.
   * @default false
   */
  touchLasso?: boolean;
  /**
   * Whether the wheel zooms the map about the pointer, once the pointer has
   * rested on the picture for half a second. On, because the viewer is given a
   * panel of its own; a page that sets it in a column of prose should turn it
   * off, so that a reader on their way past the figure keeps their scroll.
   * @default true
   */
  wheelZoom?: boolean;
  /**
   * What a figure saved from the bar is called, without its extension; the
   * view it was saved from is added to it, so the map of a run called
   * `ecstasy` arrives as `ecstasy-map.png`. Name it after the data rather than
   * after the tool: a reader with four of these in a downloads folder cannot
   * tell four `projection-map.png` apart.
   * @default 'projection'
   */
  fileName?: string;
  /**
   * Class the viewer carries, in addition to `projection-viewer`.
   * @default undefined
   */
  className?: string;
  /**
   * Value of the `data-testid` attribute of the viewer.
   * @default undefined
   */
  testId?: string;
}
