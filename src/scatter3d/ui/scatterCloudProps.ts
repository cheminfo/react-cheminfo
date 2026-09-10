/**
 * What a caller hands a `ScatterCloud`.
 *
 * The types live beside the component rather than inside it because the
 * component's own file would otherwise be mostly prose, exactly as the flat
 * scatter's are.
 */

import type { ReactNode } from 'react';

import type { EllipseSize } from '../../scatter/core/confidenceEllipse.ts';
import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import type {
  ScatterGroup,
  ScatterPointOpen,
} from '../../scatter/ui/scatterPlotProps.ts';
import type { SelectionChange } from '../../scatter/ui/useScatterSelection.ts';
import type { CloudGesture } from '../core/cloudGesture.ts';
import type { OrbitCamera } from '../core/orbitCamera.ts';

export type { CloudGesture } from '../core/cloudGesture.ts';

/** What a `ScatterCloud` needs. */
export interface ScatterCloudProps {
  /** Where every sample sits along the axis that runs left to right, in data units. */
  x: ArrayLike<number>;
  /** Along the axis that runs bottom to top, in the same order. */
  y: ArrayLike<number>;
  /** Along the axis that runs away from the reader. */
  z: ArrayLike<number>;
  /** Total width, in pixels, from `useContainerSize`. */
  width: number;
  /** Total height. */
  height: number;
  /** What the axis running left to right is called, written on the frame. */
  xLabel: string;
  /** What the axis running bottom to top is called. */
  yLabel: string;
  /** What the axis running away from the reader is called. */
  zLabel: string;
  /**
   * Which group each sample belongs to, as an index into `groups`. A sample
   * with `-1`, or an index outside the range, is drawn in the muted ink and
   * left out of every shell.
   * @default undefined — every sample is one crowd
   */
  groupOf?: ArrayLike<number>;
  /**
   * The groups, in the order they are coloured and listed.
   * @default undefined
   */
  groups?: readonly ScatterGroup[];
  /**
   * Which groups are drawn faint, by id — what a legend entry switches.
   * @default undefined — every group is drawn in full
   */
  mutedGroups?: ReadonlySet<string>;
  /**
   * How large the group shells are, or `null` for none. A share is read in
   * three dimensions here, so the same share gives a wider shell than the same
   * call gives on the map — which is the point of asking for a share rather
   * than for a distance.
   * @default null
   */
  ellipsoid?: EllipseSize | null;
  /**
   * How many samples a group needs before it is given a shell. Below four a
   * group has no volume to measure, so anything less is read as four.
   * @default 4
   */
  ellipsoidMinimumPoints?: number;
  /**
   * How solid the glass is; `0` draws no shells at all.
   * @default SHELL_FILL_OPACITY
   */
  ellipsoidFillOpacity?: number;
  /**
   * Whether each group's name is written once, over the middle of its own
   * shell. It needs `groups`, since it is their names it writes.
   * @default false
   */
  showGroupLabels?: boolean;
  /**
   * What each sample is called, written beside its own dot. A sample whose
   * entry is `undefined` is left unnamed.
   * @default undefined — no sample is named
   */
  pointLabels?: ReadonlyArray<string | undefined>;
  /**
   * Radius of a dot at the middle of the box, in pixels. One at the front is
   * drawn larger and one at the back smaller, about this.
   * @default 3.5
   */
  pointRadius?: number;
  /**
   * The index from which samples are drawn as outlines rather than filled,
   * which is how one the model was fitted on is told from one placed into it
   * afterwards.
   * @default undefined — every sample is filled
   */
  outlinedFrom?: number;
  /**
   * What a drag does. The cloud never changes it on its own, because the
   * control belongs in the bar above the figure rather than on top of the
   * picture, so it is a plain setting rather than a controlled value.
   * @default 'turn'
   */
  gesture?: CloudGesture;
  /**
   * Where the reader is standing. Present, the caller owns the camera, which
   * is how a site puts a viewpoint in a share link.
   * @default undefined — the cloud keeps its own
   */
  camera?: OrbitCamera;
  /**
   * Called with the camera every frame of a turn leaves behind.
   * @default undefined
   */
  onCameraChange?: (camera: OrbitCamera) => void;
  /**
   * How far in the reader has zoomed; `1` is the resting size. Present, the
   * caller owns it.
   * @default undefined — the cloud keeps its own
   */
  zoom?: number;
  /**
   * Called with the zoom a wheel asks for.
   * @default undefined
   */
  onZoomChange?: (zoom: number) => void;
  /**
   * Whether the wheel zooms the box. On, because a cloud that cannot be zoomed
   * cannot be read where its groups overlap; a figure set in a column of prose
   * should turn it off so a reader on their way past keeps their scroll.
   * @default true
   */
  wheelZoom?: boolean;
  /**
   * The selected rows. Present, the caller owns the selection.
   * @default undefined — the cloud keeps its own
   */
  selected?: readonly number[];
  /**
   * The rows selected before the reader touches anything.
   * @default undefined
   */
  defaultSelected?: readonly number[];
  /**
   * Called when a lasso is released or a dot is tapped — never while a lasso
   * is being drawn, and never while the box is being turned.
   * @default undefined
   */
  onSelectionChange?: (change: SelectionChange) => void;
  /**
   * What a gesture with no modifier held does to the selection. Shift always
   * adds and Alt always removes, exactly as on the map.
   * @default 'replace'
   */
  selectMode?: ScatterSelectionMode;
  /**
   * Called with the row under the pointer, or `-1`.
   * @default undefined
   */
  onHoverChange?: (index: number) => void;
  /**
   * Called when the reader double-clicks a sample, exactly as on the flat map:
   * the gesture for "tell me more about this one", or "let me change it".
   *
   * It fires whichever gesture a drag is set to, because a double click is not
   * a drag — a reader turning the box must not have to switch to Select to
   * open a sample. The sample is selected first, since a double click is also
   * two clicks; the map says why, and the two behave alike on purpose.
   * @default undefined
   */
  onPointDoubleClick?: (point: ScatterPointOpen) => void;
  /**
   * What floats over the figure — a bar, a key, a caption, a card.
   * @default undefined
   */
  overlay?: ReactNode;
  /**
   * What a screen reader is told the figure shows.
   * @default a sentence built from the three axis names and the sample count
   */
  label?: string;
  /**
   * Value of the `data-testid` attribute of the wrapper.
   * @default undefined
   */
  testId?: string;
}
