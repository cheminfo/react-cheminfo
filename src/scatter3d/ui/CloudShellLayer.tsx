import type { ReactElement } from 'react';
import { memo, useId } from 'react';

import type { ConfidenceEllipsoid } from '../core/confidenceEllipsoid.ts';
import type { OrbitCamera, OrbitViewport } from '../core/orbitCamera.ts';

import { projectShellOutline } from './cloudGeometry.ts';
import { SHELL_FILL_OPACITY, shellGlassStops } from './cloudShellStyles.ts';

/** One group's shell, fitted once and ready to be turned. */
export interface CloudShell {
  /** A stable key, so a re-render does not rebuild every shell. */
  id: string;
  /** Its colour, which is its group's. */
  color: string;
  /** The shape it summarises, in cube units. */
  ellipsoid: ConfidenceEllipsoid;
  /**
   * How strongly it is drawn, from a legend entry switching its group off.
   * @default 1
   */
  opacity?: number;
}

/** What {@link CloudShellLayer} draws. */
export interface CloudShellLayerProps {
  /** The shells, one per group that has one. */
  shells: readonly CloudShell[];
  /** Where the reader is standing. */
  camera: OrbitCamera;
  /** Where the middle of the cube is, and how large it is drawn. */
  viewport: OrbitViewport;
  /**
   * How solid one wall of the glass is. Turn it down when many groups overlap,
   * since two shells crossing compound to twice this.
   * @default 0.1
   */
  fillOpacity?: number;
}

/**
 * The group shells, as translucent glass.
 *
 * Each one is drawn as a single ellipse, because that is exactly what a shell
 * looks like: an orthographic camera sends a sphere carried by three axes to
 * an ellipse, whatever it is turned to. So the outline is a curve rather than
 * a ring of facets, it stays a curve at any zoom, and there are no seams
 * between neighbouring faces to read as a wireframe.
 *
 * What the faces were for is kept in the fill. A ray through a shell crosses
 * it twice — the near wall and the far one — so the glass is darkest where the
 * reader looks through both walls at a glancing angle, which is the rim, and
 * lightest through the middle where the far wall is turned away. That is one
 * gradient, and it says the shell is a solid the same way a hundred and sixty
 * stacked polygons did.
 * @param props - See {@link CloudShellLayerProps}.
 * @returns The shells.
 */
export const CloudShellLayer = memo(function CloudShellLayer(
  props: CloudShellLayerProps,
): ReactElement {
  const { shells, camera, viewport, fillOpacity = SHELL_FILL_OPACITY } = props;
  const prefix = useId();

  const drawn = [];
  for (const shell of shells) {
    const outline = projectShellOutline(shell.ellipsoid, camera, viewport);
    if (outline === null) continue;
    drawn.push({ shell, outline });
  }
  // Furthest first, so a shell in front of another is drawn over it.
  drawn.sort((a, b) => a.outline.depth - b.outline.depth);

  return (
    <g data-layer="shells" pointerEvents="none">
      {drawn.map(({ shell, outline }) => {
        const paint = `${prefix}${shell.id}`;
        return (
          <g key={shell.id} data-shell={shell.id}>
            <defs>
              <radialGradient id={paint}>
                {shellGlassStops((shell.opacity ?? 1) * fillOpacity).map(
                  (stop) => (
                    <stop
                      key={stop.offset}
                      offset={stop.offset}
                      stopColor={shell.color}
                      stopOpacity={stop.opacity}
                    />
                  ),
                )}
              </radialGradient>
            </defs>
            <ellipse
              cx={outline.cx}
              cy={outline.cy}
              rx={outline.rx}
              ry={outline.ry}
              transform={`rotate(${outline.angle} ${outline.cx} ${outline.cy})`}
              fill={`url(#${paint})`}
            />
          </g>
        );
      })}
    </g>
  );
});
