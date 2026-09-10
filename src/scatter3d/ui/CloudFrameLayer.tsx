import type { ReactElement } from 'react';
import { memo } from 'react';

import { CUBE_ARMS, CUBE_ORIGIN, cubeEdges } from '../core/cubeFrame.ts';
import type { OrbitCamera, OrbitViewport } from '../core/orbitCamera.ts';
import { projectPoint } from '../core/orbitCamera.ts';

import { projectSegments } from './cloudGeometry.ts';

/** What {@link CloudFrameLayer} draws. */
export interface CloudFrameLayerProps {
  /** Where the reader is standing. */
  camera: OrbitCamera;
  /** Where the middle of the cube is, and how large it is drawn. */
  viewport: OrbitViewport;
  /** What the axis running left to right is called. */
  xLabel: string;
  /** What the axis running bottom to top is called. */
  yLabel: string;
  /** What the axis running away from the reader is called. */
  zLabel: string;
}

/**
 * The box the cloud sits in, and the three arms that name its axes.
 *
 * A cloud of dots on an empty background has no orientation: turn it and
 * nothing says it turned, and a dot near the top of the picture could be near
 * or far. The frame is what fixes that, and it is why the projection can stay
 * orthographic — it carries the depth that perspective would otherwise have
 * to, and unlike perspective it distorts no distance the reader is there to
 * compare.
 *
 * All twelve edges are drawn, not the three at the back: which edges are
 * hidden changes as the box turns, and a frame that kept rearranging itself
 * would read as three axes rather than as one box.
 * @param props - See {@link CloudFrameLayerProps}.
 * @returns The frame.
 */
export const CloudFrameLayer = memo(function CloudFrameLayer(
  props: CloudFrameLayerProps,
): ReactElement {
  const { camera, viewport, xLabel, yLabel, zLabel } = props;

  const edges = projectSegments(EDGES, camera, viewport);
  const origin = projectPoint(CUBE_ORIGIN, camera, viewport);
  const names = { x: xLabel, y: yLabel, z: zLabel };

  return (
    <g data-layer="frame" pointerEvents="none">
      {edges.map((edge, at) => (
        <line
          key={at}
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}
      {CUBE_ARMS.map((arm) => {
        const end = projectPoint(arm.end, camera, viewport);
        const label = projectPoint(arm.label, camera, viewport);
        return (
          <g key={arm.axis}>
            <line
              x1={origin.x}
              y1={origin.y}
              x2={end.x}
              y2={end.y}
              stroke="var(--border-strong)"
              strokeWidth={1.5}
            />
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={ARM_LABEL_SIZE}
              fontWeight={600}
              fill="var(--text-muted)"
            >
              {names[arm.axis]}
            </text>
          </g>
        );
      })}
    </g>
  );
});

/** Cut once, because the corners of a cube do not depend on the camera. */
const EDGES = cubeEdges();

/** The same size a chart writes an axis title at, so the two read alike. */
const ARM_LABEL_SIZE = 11;
