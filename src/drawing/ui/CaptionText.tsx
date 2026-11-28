/**
 * A caption drawn as live SVG text, the React counterpart of `captionMarkup`:
 * the same lines and runs on screen as in a saved figure.
 */

import type { ReactElement } from 'react';

import { lineLayout, scriptShift, spanSize } from '../render/captionRuns.ts';
import { captionTransform } from '../render/captions.ts';
import { metricsOf } from '../render/metrics.ts';
import type { CaptionPrimitive } from '../render/primitives.ts';

/** Props of {@link CaptionText}. */
export interface CaptionTextProps {
  /** The caption, laid out by `captionPrimitive`. */
  caption: CaptionPrimitive;
  /** The colour it is drawn in, `#rrggbb`. */
  ink: string;
}

/**
 * A caption, as live SVG: one text element per line, its runs set in their
 * size, weight, slant and script shift, a charge over its count, turned
 * about its anchor. A compound number carries `data-cheminfo-ref` and
 * `data-cheminfo-row`, as in a saved figure.
 * @param props - See {@link CaptionTextProps}.
 * @returns The lines.
 */
export function CaptionText(props: CaptionTextProps): ReactElement {
  const { caption, ink } = props;
  const metrics = metricsOf(caption.family);
  return (
    <g transform={captionTransform(caption)}>
      {keyedByText(caption.lines, lineText).map(
        ({ key, item: line, position }) => {
          let shift = 0;
          const baseline = caption.baselines[position] ?? caption.y;
          const layout = lineLayout(
            line,
            caption.size,
            metrics,
            caption.anchor,
          );
          return line.length === 0 ? null : (
            <text
              key={key}
              x={caption.x + layout.offset}
              y={baseline}
              textAnchor={layout.anchor}
              fontSize={caption.size}
              fontFamily={caption.family}
              fill={ink}
              stroke="none"
              xmlSpace="preserve"
              data-cheminfo-ref={caption.label?.key}
              data-cheminfo-row={caption.label?.row}
            >
              {keyedByText(line, (span) => span.text).map(
                ({ key: spanKey, item: span, position: spanIndex }) => {
                  const dx = layout.dx[spanIndex] ?? 0;
                  const target = scriptShift(span, caption.size);
                  const dy = target - shift;
                  shift = target;
                  const size = spanSize(span, caption.size);
                  return (
                    <tspan
                      key={spanKey}
                      dx={dx === 0 ? undefined : dx}
                      dy={dy === 0 ? undefined : dy}
                      fontSize={size === caption.size ? undefined : size}
                      fontWeight={span.bold ? 'bold' : undefined}
                      fontStyle={span.italic ? 'italic' : undefined}
                    >
                      {span.text}
                    </tspan>
                  );
                },
              )}
            </text>
          );
        },
      )}
    </g>
  );
}

function lineText(line: CaptionPrimitive['lines'][number]): string {
  let text = '';
  for (const span of line) text += span.text;
  return text;
}

// Items with a key made of their text, a repeat told apart by its rank, and
// their place in the list.
function keyedByText<T>(
  items: readonly T[],
  text: (item: T) => string,
): Array<{ key: string; item: T; position: number }> {
  const seen = new Map<string, number>();
  const keyed: Array<{ key: string; item: T; position: number }> = [];
  for (const item of items) {
    const base = text(item);
    const rank = (seen.get(base) ?? 0) + 1;
    seen.set(base, rank);
    keyed.push({ key: `${base}#${rank}`, item, position: keyed.length });
  }
  return keyed;
}
