import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { FigureFormat } from '../../core/downloadFigure.ts';
import type { FigureLayout } from '../../core/figureLayout.ts';
import type { FigurePixels } from '../../core/figureScale.ts';
import { FigureDownloadPanel } from '../FigureDownloadPanel.tsx';

const SCREEN = { width: 720, height: 380 };

test('a figure that cannot be drawn again is offered no size', () => {
  const html = panel({ format: 'svg', scale: 1 });

  expect(html).not.toContain('>Size<');
  expect(html).toContain(
    'Opens at 720 × 380 pixels, and stays sharp at any size.',
  );
});

test('an SVG saved at twice opens twice as large', () => {
  const html = panel({ format: 'svg', scale: 2 });

  expect(html).toContain(
    'Opens at 1440 × 760 pixels, and stays sharp at any size.',
  );
  expect(html).not.toMatch(/role="radio"[^>]*disabled/u);
});

test('only a PNG is held to what a browser can paint', () => {
  const wide = { width: 5000, height: 1000 };
  const png = panel({ format: 'png', size: wide });
  const svg = panel({ format: 'svg', size: wide });

  expect(png).toMatch(/title="15000 × 3000 pixels" tabindex/u);
  expect(png).toMatch(/title="20000 × 4000 pixels" disabled=""/u);
  expect(svg).not.toMatch(/role="radio"[^>]*disabled/u);
});

test('the size picked is what the panel says it will draw', () => {
  const html = panel({ format: 'svg', layout: 'wide', scale: 1 });

  expect(html).toContain('>Size<');
  expect(html).toContain('aria-label="Size — 16:9"');
  expect(html).toContain('Opens at 720 × 405 pixels');
});

test('a PNG multiplies the size picked, not the size on screen', () => {
  const html = panel({ format: 'png', layout: 'column' });

  expect(html).toContain('Saved 642 × 338 pixels.');
});

test('a custom size shows the two sides it will be drawn at', () => {
  const html = panel({
    format: 'svg',
    layout: 'custom',
    custom: { width: 1200, height: 800 },
    scale: 1,
  });

  expect(html).toContain('>Width × height<');
  expect(html).toMatch(/aria-label="Width"[^>]*value="1200"/u);
  expect(html).toMatch(/aria-label="Height"[^>]*value="800"/u);
  expect(html).toContain('Opens at 1200 × 800 pixels');
});

test('the custom sides are not offered for any other size', () => {
  const html = panel({ format: 'svg', layout: 'standard', scale: 1 });

  expect(html).not.toContain('aria-label="Width"');
  expect(html).toContain('Opens at 720 × 540 pixels');
});

interface PanelOptions {
  /** The file asked for. */
  format: FigureFormat;
  /** The shape picked, or none when the figure cannot be drawn again. */
  layout?: FigureLayout;
  /** The size typed for a custom shape. */
  custom?: FigurePixels;
  /** The multiple picked. */
  scale?: number;
  /** The figure on screen. */
  size?: FigurePixels;
}

/**
 * The panel over the iris map, rendered to markup.
 * @param options - See {@link PanelOptions}.
 * @returns The markup.
 */
function panel(options: PanelOptions): string {
  const { format, layout, custom = null, scale = 2, size = SCREEN } = options;
  return renderToStaticMarkup(
    <FigureDownloadPanel
      title="Save figure"
      format={format}
      scale={scale}
      scales={[1, 2, 3, 4]}
      size={size}
      failure={null}
      saving={false}
      onFormatChange={() => null}
      onScaleChange={() => null}
      onSave={() => null}
      sizing={
        layout === undefined
          ? undefined
          : {
              layout,
              custom,
              onLayoutChange: () => null,
              onCustomChange: () => null,
            }
      }
    />,
  );
}
