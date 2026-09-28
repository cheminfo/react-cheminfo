import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { plotRect } from '../../core/chartGeometry.ts';
import { PlotCaption } from '../PlotCaption.tsx';

// Rendered to a string, exactly as the legend at the other corner is tested:
// the caption holds nothing and answers no gesture, so where it sits and what
// it reads is the whole of what there is to check — and both are what an
// exported figure carries.

const plot = plotRect({ width: 600, height: 400 });

const CAPTION = 'lc-msms-run.mzML · scan 2 of 3 · 0.201 min · MS2 725.1400';

/**
 * The caption a pane asks for.
 * @param text - What it says.
 * @param until - Where a legend beside it begins, if one does.
 * @returns The markup it drew.
 */
function drawCaption(text: string, until?: number): string {
  return renderToStaticMarkup(
    <svg>
      <PlotCaption text={text} plot={plot} until={until} />
    </svg>,
  );
}

test('the caption sits in the top left of the plot, on the legend rows own line', () => {
  // Six in from the plot's left edge and centred seven below its top, which is
  // where `legendBox` puts the first row of the legend at the other corner.
  expect(drawCaption(CAPTION)).toContain('<text x="66" y="23"');
  expect(drawCaption(CAPTION)).toContain(`>${CAPTION}</text>`);
});

test('it stops short of a legend rather than running under the box', () => {
  const markup = drawCaption(CAPTION, 300);

  // 300 less the gap, the margin and the plot's own left edge leaves 229
  // pixels, which is 37 characters at the legend's advance — 36 of the caption
  // and the ellipsis saying that it goes on.
  expect(markup).toContain('>lc-msms-run.mzML · scan 2 of 3 · 0.2…</text>');
});

test('a caption with room for a stub is not written at all', () => {
  expect(drawCaption(CAPTION, plot.left + 40)).toBe('<svg></svg>');
});

test('a pane with nothing to say draws nothing', () => {
  expect(drawCaption('')).toBe('<svg></svg>');
});
