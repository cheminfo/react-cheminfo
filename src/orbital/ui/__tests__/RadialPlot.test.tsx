import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PHASE_PALETTES } from '../../core/palette.ts';
import { RadialPlot } from '../RadialPlot.tsx';

const SODIUM_3S = { n: 3, l: 0, charge: 2.2 };

test('the plot is named, and every radial node is ruled', () => {
  const html = renderToStaticMarkup(
    <RadialPlot parameters={SODIUM_3S} name="3s" width={480} />,
  );

  expect(html).toContain(
    'aria-label="Radial distribution of the 3s orbital, 2 radial nodes"',
  );
  expect(html.split('data-mark="node"')).toHaveLength(3);
  expect(html.split('data-mark="peak"')).toHaveLength(2);
  expect(html).toContain('Distance from the nucleus (pm)');
  expect(html).not.toContain('data-mark="amplitude');
});

test('the amplitude is drawn in the phase colours when asked for', () => {
  const palette = PHASE_PALETTES.colorBlindSafe;
  const html = renderToStaticMarkup(
    <RadialPlot
      parameters={SODIUM_3S}
      width={480}
      showAmplitude
      palette={palette}
      showPeak={false}
      unit="angstrom"
    />,
  );

  expect(html.split('data-mark="amplitude-positive"')).toHaveLength(3);
  expect(html.split('data-mark="amplitude-negative"')).toHaveLength(2);
  expect(html).toContain(`stroke="${palette.negative}"`);
  expect(html).not.toContain('data-mark="peak"');
  expect(html).toContain('Distance from the nucleus (Å)');
  expect(html).toContain('r²R² and R (relative)');
});

test('the caption is written from the plotted samples', () => {
  const html = renderToStaticMarkup(
    <RadialPlot
      parameters={{ n: 1, l: 0, charge: 1 }}
      width={300}
      className="radial"
      renderCaption={(distribution) =>
        `${distribution.nodeRadii.length} nodes, peak at ${Math.round(
          distribution.peakDistance * 100,
        )} pm`
      }
    />,
  );

  expect(html).toContain('<figure class="radial"');
  expect(html).toContain('<figcaption');
  expect(html).toContain('0 nodes, peak at 53 pm');
  expect(html).toContain(
    'aria-label="Radial distribution of an orbital, 0 radial nodes"',
  );
});
