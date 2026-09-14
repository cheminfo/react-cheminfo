import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/index.ts';
import { TrackedLineChart } from '../../../chart/ui/TrackedLineChart.tsx';
import { TrackedStickChart } from '../../../chart/ui/TrackedStickChart.tsx';
import { evenScale } from '../../../color/core/interpolate.ts';
import { ColorScaleBar } from '../../../color/ui/ColorScaleBar.tsx';
import { ColorScaleEditor } from '../../../color/ui/ColorScaleEditor.tsx';
import { ColorScaleLegend } from '../../../color/ui/ColorScaleLegend.tsx';
import { ColorScaleSelect } from '../../../color/ui/ColorScaleSelect.tsx';
import { CategoryLegend } from '../../../periodic/ui/CategoryLegend.tsx';
import { ElementCell } from '../../../periodic/ui/ElementCell.tsx';
import { ScatterMatrix } from '../../../scatter/ui/ScatterMatrix.tsx';
import { EMPTY_SETTINGS } from '../../../spectra/core/settings.ts';
import { FilterChainEditor } from '../../../spectra/ui/FilterChainEditor.tsx';
import { PrincipalComponentSelect } from '../../../spectra/ui/PrincipalComponentSelect.tsx';
import { SpectraSettingsEditor } from '../../../spectra/ui/SpectraSettingsEditor.tsx';

import { PROBE, noop, rootClasses } from './rootClasses.ts';

const SERIES = [
  { id: 's1', label: 'S1', values: [1, -1, 1], color: '#0072b2' },
];

/** The figures and editors, and the names their root element must end with. */
const CASES: Array<[string, ReactElement, string[]]> = [
  [
    'TrackedLineChart',
    <TrackedLineChart
      key="line"
      categories={['a', 'b', 'c']}
      series={SERIES}
      width={460}
      height={260}
      y={{ label: 'Weight' }}
      className={PROBE}
    />,
    ['chart-frame', PROBE],
  ],
  [
    'TrackedStickChart',
    <TrackedStickChart
      key="stick"
      positions={[1, 2, 3]}
      categories={['a', 'b', 'c']}
      series={SERIES}
      width={600}
      height={160}
      className={PROBE}
    />,
    ['chart-frame', PROBE],
  ],
  [
    'ColorScaleBar',
    <ColorScaleBar
      key="bar"
      scale={evenScale(['#000000', '#ffffff'])}
      className={PROBE}
    />,
    [PROBE],
  ],
  [
    'ColorScaleEditor',
    <ColorScaleEditor
      key="editor"
      value={evenScale(['#0000ff', '#ff0000'])}
      onChange={noop}
      className={PROBE}
    />,
    [PROBE],
  ],
  [
    'ColorScaleLegend',
    <ColorScaleLegend
      key="legend"
      scale={['#000000', '#ffffff']}
      min={0}
      max={1}
      className={PROBE}
    />,
    [PROBE],
  ],
  [
    'ColorScaleSelect',
    <ColorScaleSelect
      key="select"
      value="plasma"
      onChange={noop}
      className={PROBE}
    />,
    [PROBE],
  ],
  [
    'CategoryLegend',
    <CategoryLegend key="categories" className={PROBE} />,
    [PROBE],
  ],
  [
    'ElementCell',
    <ElementCell
      key="cell"
      atomicNumber={26}
      symbol="Fe"
      name="Iron"
      swatch={{ background: '#ffffff', foreground: '#000000' }}
      column={8}
      row={4}
      onSelect={noop}
      className={PROBE}
    />,
    [PROBE],
  ],
  [
    'ScatterMatrix',
    <ScatterMatrix
      key="matrix"
      scores={rowMatrix([
        [0, 1],
        [1, 0],
        [2, 2],
      ])}
      axes={[
        { name: 'PC 1', share: 0.6 },
        { name: 'PC 2', share: 0.3 },
      ]}
      count={2}
      width={400}
      groupOf={[0, 0, 0]}
      groups={[{ id: 'a', label: 'A', color: '#0072b2' }]}
      onSelectPair={noop}
      className={PROBE}
    />,
    [PROBE],
  ],
  [
    'FilterChainEditor',
    <FilterChainEditor
      key="chain"
      value={[]}
      onChange={noop}
      className={PROBE}
    />,
    [PROBE],
  ],
  [
    'PrincipalComponentSelect',
    <PrincipalComponentSelect
      key="components"
      value={{ x: 0, y: 1 }}
      count={4}
      onChange={noop}
      className={PROBE}
    />,
    [PROBE],
  ],
  [
    'SpectraSettingsEditor',
    <SpectraSettingsEditor
      key="settings"
      value={EMPTY_SETTINGS}
      onChange={noop}
      className={PROBE}
    />,
    [PROBE],
  ],
];

test.each(CASES)(
  "%s adds a caller's class to its root element",
  (_name, element, expected) => {
    const classes = rootClasses(renderToStaticMarkup(element));

    expect(classes.slice(-expected.length)).toStrictEqual(expected);
  },
);
