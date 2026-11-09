/**
 * A caption written as SVG text, its scripts lowered and raised with `dy`.
 */

import { lineLayout, scriptShift, spanSize } from './captionRuns.ts';
import { captionTransform } from './captions.ts';
import { escapeAttribute, escapeText, number } from './markup.ts';
import { metricsOf } from './metrics.ts';
import type { CaptionPrimitive } from './primitives.ts';

/**
 * A caption as SVG: one text element per line, its runs as tspans in their
 * own weight, slant and size, a script lowered or raised with `dy` and a
 * charge set back over its count with `dx`, so any reader of SVG places them.
 * A turned caption is a group turned about its anchor.
 * @param caption - The caption.
 * @param ink - Its colour.
 * @returns The markup.
 */
export function captionMarkup(caption: CaptionPrimitive, ink: string): string {
  const lines: string[] = [];
  const metrics = metricsOf(caption.family);
  for (const [index, line] of caption.lines.entries()) {
    if (line.length === 0) continue;
    const layout = lineLayout(line, caption.size, metrics, caption.anchor);
    let shift = 0;
    const spans = line.map((span, position) => {
      const dx = layout.dx[position] ?? 0;
      const target = scriptShift(span, caption.size);
      const dy = target - shift;
      shift = target;
      const size = spanSize(span, caption.size);
      const attributes = [
        dx === 0 ? '' : ` dx="${number(dx)}"`,
        dy === 0 ? '' : ` dy="${number(dy)}"`,
        size === caption.size ? '' : ` font-size="${number(size)}"`,
        span.bold ? ' font-weight="bold"' : '',
        span.italic ? ' font-style="italic"' : '',
      ].join('');
      return `<tspan${attributes}>${escapeText(span.text)}</tspan>`;
    });
    const y = caption.baselines[index] ?? caption.y;
    lines.push(
      `<text x="${number(caption.x + layout.offset)}" y="${number(y)}" text-anchor="${layout.anchor}" font-size="${number(caption.size)}" font-family="${escapeAttribute(caption.family)}" fill="${ink}" stroke="none" xml:space="preserve">${spans.join('')}</text>`,
    );
  }
  const transform = captionTransform(caption);
  return transform
    ? `<g transform="${transform}">${lines.join('')}</g>`
    : lines.join('');
}
