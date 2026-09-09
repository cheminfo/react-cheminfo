import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { SettingsProblem } from '../../core/problems.ts';
import type { SpectraProcessorSettings } from '../../core/settings.ts';
import { NormalizationEditor } from '../NormalizationEditor.tsx';

const SETTINGS: SpectraProcessorSettings = {
  maxMemory: 268435456,
  normalization: {
    from: 400,
    to: 4000,
    numberOfPoints: 2048,
    exclusions: [{ from: 1900, to: 2100 }],
    filters: [{ name: 'centerMean' }],
  },
};

test('the stage is read by its headings, one part per thing it decides', () => {
  const html = renderToStaticMarkup(
    <NormalizationEditor
      value={SETTINGS}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('>Memory</h4>');
  expect(html).toContain('>Resampling</h4>');
  expect(html).toContain('>Order</h4>');
  expect(html).toContain('>Excluded zones</h4>');
  expect(html).toContain('>Chain</h4>');
});

test('the budget is edited in megabytes, because nobody thinks in bytes', () => {
  const html = renderToStaticMarkup(
    <NormalizationEditor
      value={SETTINGS}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('Budget (MB)');
  expect(html).toContain('value="256"');
  expect(html).toContain('placeholder="256"');
  expect(html).not.toContain('value="268435456"');
});

test('passing the budget is called out, because it is what freezes the settings', () => {
  const html = renderToStaticMarkup(
    <NormalizationEditor
      value={SETTINGS}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('throws the original spectra away');
});

test('the grid is three numbers, each saying what upstream does when it is empty', () => {
  const html = renderToStaticMarkup(
    <NormalizationEditor
      value={SETTINGS}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('placeholder="the first x"');
  expect(html).toContain('placeholder="the last x"');
  expect(html).toContain('placeholder="1024"');
  expect(html).toContain('value="400"');
  expect(html).toContain('value="4000"');
  expect(html).toContain('value="2048"');
});

test('both orders are offered, and the one in force says which x the range is read in', () => {
  const html = renderToStaticMarkup(
    <NormalizationEditor
      value={SETTINGS}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('Filter, then resample');
  expect(html).toContain('Resample, then filter');
  expect(html).toContain('the x the chain leaves behind');
  expect(html).not.toContain('the x the file holds');
});

test('resampling first flips the line under the control, since the x changes with it', () => {
  const html = renderToStaticMarkup(
    <NormalizationEditor
      value={{
        ...SETTINGS,
        normalization: {
          ...SETTINGS.normalization,
          applyRangeSelectionFirst: true,
        },
      }}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('the x the file holds');
  expect(html).not.toContain('the x the chain leaves behind');
});

test('an excluded zone is a row of two bounds and a switch that only hides it', () => {
  const html = renderToStaticMarkup(
    <NormalizationEditor
      value={SETTINGS}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('value="1900"');
  expect(html).toContain('value="2100"');
  expect(html).toContain('Hide on the chart only');
  expect(html).toContain('the points it would have held are shared out');
});

test('a problem is drawn under the part it is about, not in one list at the top', () => {
  const problems: readonly SettingsProblem[] = [
    {
      severity: 'error',
      where: 'Memory',
      message: 'The budget must be a number above zero.',
    },
    {
      severity: 'error',
      where: 'Excluded zone 1',
      message: 'From is not below to.',
    },
  ];
  const html = renderToStaticMarkup(
    <NormalizationEditor
      value={SETTINGS}
      problems={problems}
      onChange={() => null}
    />,
  );

  expect(html).toContain('Memory — The budget must be a number above zero.');
  expect(html).toContain('Excluded zone 1 — From is not below to.');
  expect(html.match(/<li>/g)).toHaveLength(2);
});

test('the order in force is the segment marked chosen, and it is the filtering one by default', () => {
  const html = renderToStaticMarkup(
    <NormalizationEditor
      value={SETTINGS}
      problems={[]}
      onChange={() => null}
    />,
  );
  const chosen = /aria-checked="true"[\S\s]*?button-text">(?<label>[^<]+)/.exec(
    html,
  )?.groups?.label;

  expect(chosen).toBe('Filter, then resample');
  expect(html.match(/aria-checked="true"/g)).toHaveLength(1);
});

test('asking for the grid first moves the mark onto the other segment, since only one order runs', () => {
  const html = renderToStaticMarkup(
    <NormalizationEditor
      value={{
        ...SETTINGS,
        normalization: {
          ...SETTINGS.normalization,
          applyRangeSelectionFirst: true,
        },
      }}
      problems={[]}
      onChange={() => null}
    />,
  );
  const chosen = /aria-checked="true"[\S\s]*?button-text">(?<label>[^<]+)/.exec(
    html,
  )?.groups?.label;

  expect(chosen).toBe('Resample, then filter');
  expect(html.match(/aria-checked="true"/g)).toHaveLength(1);
});

test('a zone hidden from the chart carries a ticked switch, and one that is dropped does not', () => {
  const html = renderToStaticMarkup(
    <NormalizationEditor
      value={{
        ...SETTINGS,
        normalization: {
          ...SETTINGS.normalization,
          exclusions: [
            { from: 1900, to: 2100, ignore: true },
            { from: 2500, to: 2600 },
          ],
        },
      }}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(
    html.match(/<input class="bp6-control-input" type="checkbox"[^>]*>/g),
  ).toStrictEqual([
    '<input class="bp6-control-input" type="checkbox" checked=""/>',
    '<input class="bp6-control-input" type="checkbox"/>',
  ]);
});

test('the switch is left untouched when the zone says nothing about hiding it', () => {
  const html = renderToStaticMarkup(
    <NormalizationEditor
      value={SETTINGS}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('<input class="bp6-control-input" type="checkbox"/>');
  expect(html).not.toContain('checked=""');
});

test('a budget that is not a whole number of megabytes is shown in full, never rounded to a lie', () => {
  const html = renderToStaticMarkup(
    <NormalizationEditor
      value={{ ...SETTINGS, maxMemory: 1_500_000 }}
      problems={[]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('value="1.430511474609375"');
  expect(html).not.toContain('value="1"');
  expect(html).not.toContain('value="1500000"');
});
