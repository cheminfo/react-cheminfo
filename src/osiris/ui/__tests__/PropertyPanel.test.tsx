import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import {
  BENZIDINE,
  BENZIDINE_MUTAGENIC,
} from '../../core/__tests__/benzidine.ts';
import { PropertyPanel } from '../PropertyPanel.tsx';

test('the panel opens on the formula and the name of the molecule', () => {
  const html = renderToStaticMarkup(<PropertyPanel properties={BENZIDINE} />);

  expect(html).toContain('<header class="property-panel__head">');
  expect(html).toContain(
    '<span class="property-panel__label">Benzidine</span>',
  );
});

test('a host that already shows the formula drops the head, and nothing else', () => {
  const html = renderToStaticMarkup(
    <PropertyPanel properties={BENZIDINE} head={false} />,
  );

  expect(html).not.toContain('property-panel__head');
  expect(html).not.toContain('Benzidine');
  expect(html).toContain(
    '<h5 class="bp6-heading">Predicted toxicity risks</h5>',
  );
  expect(html).toContain('<h5 class="bp6-heading">Predicted properties</h5>');
  // The ten numbers are all there: cLogP first, the drug score last.
  expect(html.match(/class="property-row"/g)).toHaveLength(10);
  expect(html).toContain('<span class="property-row__value">1.96</span>');
  expect(html).toContain('<span class="property-row__value">0.09</span>');
});

test('without a molecule the head is never drawn, and the note says why', () => {
  const idle = renderToStaticMarkup(<PropertyPanel head={false} />);
  const pending = renderToStaticMarkup(<PropertyPanel pending />);

  expect(idle).toContain('<p class="osiris-note">Nothing to predict yet.</p>');
  expect(pending).toContain('<p class="osiris-note">Predicting…</p>');
  expect(pending).not.toContain('property-panel__head');
});

test('a question about one number draws that row and no risk', () => {
  const html = renderToStaticMarkup(
    <PropertyPanel
      properties={BENZIDINE}
      risks={false}
      rows={['drugScore', 'logP']}
      openRisk="mutagenic"
      loadDetail={async () => BENZIDINE_MUTAGENIC}
    />,
  );

  expect(html).not.toContain('Predicted toxicity risks');
  expect(html).not.toContain('risk-findings');
  expect(html).not.toContain('Working out why');
  // Drawn in the panel's order, cLogP first, whatever order they were asked in.
  expect(html.match(/<span class="property-row__label">[^<]*/g)).toStrictEqual([
    '<span class="property-row__label">cLogP',
    '<span class="property-row__label">Drug score',
  ]);
});

test('a question about the risks alone leaves the numbers out', () => {
  const html = renderToStaticMarkup(
    <PropertyPanel properties={BENZIDINE} rows={[]} />,
  );

  expect(html).toContain('Predicted toxicity risks');
  expect(html).not.toContain('Predicted properties');
  expect(html).not.toContain('property-row');
});
