import type { ReactElement } from 'react';

import { splitColor } from '../core/palette.ts';
import type { GradientPaint } from '../render/gradients.ts';
import {
  gradientId,
  radialTransform,
  sceneGradients,
} from '../render/gradients.ts';
import type { Scene } from '../render/primitives.ts';

/**
 * The gradients a scene fills its shapes with, each once, laid out as the
 * saved file lays them out, for the paths `<PathView>` fills with them.
 * @param props - The scene.
 * @param props.scene - The rendered drawing.
 * @returns The `<defs>`, or nothing for a scene filled flat.
 */
export function GradientDefs(props: { scene: Scene }): ReactElement | null {
  const paints = sceneGradients(props.scene);
  if (paints.length === 0) return null;
  return (
    <defs>
      {paints.map((paint) => {
        const id = gradientId(paint);
        return paint.kind === 'linear' ? (
          <linearGradient
            key={id}
            id={id}
            gradientUnits="userSpaceOnUse"
            x1={paint.from.x}
            y1={paint.from.y}
            x2={paint.to.x}
            y2={paint.to.y}
          >
            <Stops paint={paint} />
          </linearGradient>
        ) : (
          <radialGradient
            key={id}
            id={id}
            gradientUnits="userSpaceOnUse"
            cx={0}
            cy={0}
            r={1}
            gradientTransform={radialTransform(paint)}
          >
            <Stops paint={paint} />
          </radialGradient>
        );
      })}
    </defs>
  );
}

function Stops(props: { paint: GradientPaint }): ReactElement {
  return (
    <>
      {props.paint.stops.map((stop) => {
        const { hex, opacity } = splitColor(stop.color);
        return (
          <stop
            key={stop.offset}
            offset={stop.offset}
            stopColor={hex}
            stopOpacity={opacity < 1 ? opacity : undefined}
          />
        );
      })}
    </>
  );
}
