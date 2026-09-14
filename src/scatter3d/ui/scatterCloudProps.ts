/**
 * What a caller hands a `ScatterCloud`.
 *
 * What the cloud shares with the flat map — groups, labels, selection, hover
 * and double click — is declared once in `scatterFigureProps.ts`; this adds
 * the three axes, the shells, and the camera only a box has.
 */

import type { EllipseSize } from '../../scatter/core/confidenceEllipse.ts';
import type {
  ScatterGroupProps,
  ScatterInteractionProps,
} from '../../scatter/ui/scatterFigureProps.ts';
import type { CloudGesture } from '../core/cloudGesture.ts';
import type { OrbitCamera } from '../core/orbitCamera.ts';

/** What a `ScatterCloud` needs. */
export interface ScatterCloudProps
  extends ScatterGroupProps, ScatterInteractionProps {
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
   * How solid one wall of the glass is; `0` draws no shells at all.
   * @default 0.1
   */
  ellipsoidFillOpacity?: number;
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
}
