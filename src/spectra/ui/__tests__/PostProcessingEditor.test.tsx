import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { SettingsProblem } from '../../core/problems.ts';
import type { PostProcessingSettings } from '../../core/settings.ts';
import { PostProcessingEditor } from '../PostProcessingEditor.tsx';

const SETTINGS: PostProcessingSettings = {
  ids: ['first'],
  filters: [{ name: 'pqn', options: { max: 100 } }, { name: 'centerMean' }],
  scale: {
    method: 'minmax',
    targetID: 'second',
    range: { from: 7, toIndex: 12 },
  },
  ranges: [{ label: 'aromatic', from: 6.5, to: 8.5, fromIndex: 3 }],
  calculations: [{ label: 'ratio', formula: 'aromatic / 2' }],
};

const SPECTRUM_IDS: readonly string[] = ['first', 'second'];

const HEADINGS =
  /<h4[^>]*>(?:Spectra|Matrix steps|Scaling|Ranges|Calculations)<\/h4>/g;

/**
 * The add menu on its own, so its options can be counted without the page.
 * @param html - The whole rendered panel.
 * @returns The select element, or an empty string when it is not there.
 */
function addMenu(html: string): string {
  const found =
    /<select[^>]*aria-label="Add a matrix step"[\S\s]*?<\/select>/.exec(html);
  return found?.[0] ?? '';
}

test('the matrix menu offers the three names the processor matches and no fourth', () => {
  const menu = addMenu(
    renderToStaticMarkup(
      <PostProcessingEditor
        value={SETTINGS}
        problems={[]}
        onChange={() => null}
      />,
    ),
  );

  expect(menu.match(/<option/g)).toHaveLength(4);
  expect(menu).toContain('value="pqn"');
  expect(menu).toContain('value="centerMean"');
  expect(menu).toContain('value="rescale"');
});

test('a matrix step carries its own options, and centerMean says it has none', () => {
  const html = renderToStaticMarkup(
    <PostProcessingEditor
      value={SETTINGS}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('Probabilistic quotient normalization');
  expect(html).toContain('value="100"');
  expect(html).toContain('anything set here is ignored');
  expect(html).toContain('aria-label="Move matrix step 2 up"');
  expect(html).toContain('aria-label="Remove matrix step 1"');
});

test('every scaling the processor matches is offered, plus doing none at all', () => {
  const html = renderToStaticMarkup(
    <PostProcessingEditor
      value={SETTINGS}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('None — every spectrum is left as it is');
  expect(html).toContain('Smallest value');
  expect(html).toContain('Largest value');
  expect(html).toContain('Both ends');
  expect(html).toContain('Integral');
});

test('the scaling window says that a point number wins over an x value', () => {
  const html = renderToStaticMarkup(
    <PostProcessingEditor
      value={SETTINGS}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('value="7"');
  expect(html).toContain('value="12"');
  expect(html).toContain('A point number silently wins over an x value');
  expect(html).toContain('Subtract the reference spectrum');
});

test('a range carries the name the calculations read it by', () => {
  const html = renderToStaticMarkup(
    <PostProcessingEditor
      value={SETTINGS}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('value="aromatic"');
  expect(html).toContain('value="6.5"');
  expect(html).toContain('value="8.5"');
  expect(html).toContain('aria-label="Name of range 1"');
  expect(html).toContain('A range with no name is silently skipped');
});

test('a range draws the point numbers too, since the processor reads them first', () => {
  const html = renderToStaticMarkup(
    <PostProcessingEditor
      value={SETTINGS}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('value="3"');
  expect(html).toContain('From point');
  expect(html).toContain(
    'A range resolves its window the same way the scaling',
  );
});

test('a calculation is a name and a formula, and the formula is not prose', () => {
  const html = renderToStaticMarkup(
    <PostProcessingEditor
      value={SETTINGS}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('value="ratio"');
  expect(html).toContain('value="aromatic / 2"');
  expect(html).toContain('aria-label="Formula of calculation 1"');
  expect(html).toContain('font-family:ui-monospace');
});

test('the ids are typed as a list when the processor holds nothing to pick from', () => {
  const html = renderToStaticMarkup(
    <PostProcessingEditor
      value={{ ...SETTINGS, ids: ['first', 'second'] }}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('value="first, second"');
  expect(html).toContain('placeholder="every spectrum the processor holds"');
});

test('the ids are ticked when the processor says which spectra it holds', () => {
  const html = renderToStaticMarkup(
    <PostProcessingEditor
      value={SETTINGS}
      problems={[]}
      spectrumIds={SPECTRUM_IDS}
      onChange={() => null}
    />,
  );

  expect(html.match(/bp6-checkbox/g)).toHaveLength(2);
  expect(html).toContain('</span>first</label>');
  expect(html).toContain('</span>second</label>');
  expect(html).toContain('With every box ticked the settings name no spectrum');
  expect(html).toContain('The first spectrum the processor holds');
});

test('a spectrum the settings name and the processor does not hold is still drawn', () => {
  const html = renderToStaticMarkup(
    <PostProcessingEditor
      value={{
        ...SETTINGS,
        ids: ['first', 'ghost'],
        scale: { method: 'max', targetID: 'phantom' },
      }}
      problems={[]}
      spectrumIds={SPECTRUM_IDS}
      onChange={() => null}
    />,
  );

  expect(html.match(/bp6-checkbox/g)).toHaveLength(3);
  expect(html).toContain('ghost — not a spectrum the processor holds');
  expect(html).toContain('phantom — not a spectrum the processor holds');
});

test('a scaling the processor throws on is drawn as itself, never as None', () => {
  const html = renderToStaticMarkup(
    <PostProcessingEditor
      value={{ ...SETTINGS, scale: { method: 'gaussian' } }}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('value="gaussian"');
  expect(html).toContain('gaussian — not a scaling the processor knows');
});

test('each part shows only its own problems, matched on what settingsProblems wrote', () => {
  const problems: readonly SettingsProblem[] = [
    {
      severity: 'error',
      where: 'Matrix step 1',
      message: 'The matrix stage only knows pqn, centerMean, rescale.',
    },
    {
      severity: 'warning',
      where: 'Scaling',
      message: 'The difference is taken against the first spectrum.',
    },
    { severity: 'error', where: 'Range 1', message: 'From is not below to.' },
    {
      severity: 'error',
      where: 'Calculations',
      message:
        'A calculation reads the range integrals, and no range is named.',
    },
    {
      severity: 'error',
      where: 'Resampling',
      message: 'From is not below to.',
    },
  ];
  const html = renderToStaticMarkup(
    <PostProcessingEditor
      value={SETTINGS}
      problems={problems}
      onChange={() => null}
    />,
  );

  expect(html.match(/<li>/g)).toHaveLength(4);
  expect(html.match(HEADINGS)).toHaveLength(5);
  expect(html).toContain('Matrix step 1 — The matrix stage only knows');
  expect(html).toContain('Range 1 — From is not below to.');
  expect(html).not.toContain('Resampling — From is not below to.');
});
