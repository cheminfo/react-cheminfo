import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { swatchAt } from '../src/color/core/interpolate.ts';
import { positionInRange } from '../src/color/core/scale.ts';
import { resolveColorScale } from '../src/color/core/scaleText.ts';
import { FigureDownload } from '../src/download/ui/FigureDownload.tsx';
import { configurationOf } from '../src/orbital/core/electronConfiguration.ts';
import { UNKNOWN_SWATCH } from '../src/periodic/core/categories.ts';
import type { PeriodicElement } from '../src/periodic/core/elements.ts';
import type { PeriodicTableProps } from '../src/periodic/ui/PeriodicTable.tsx';
import { PeriodicTable } from '../src/periodic/ui/PeriodicTable.tsx';
import { TOKEN } from '../src/tokens/core/familyTokens.ts';

// A property to colour the table by, so the "knows nothing about what it shows"
// claim can be seen rather than read: the table is handed a swatch and a string
// per element and draws a map of the periodic trend.
const ELECTRONEGATIVITY: Record<string, number> = {
  H: 2.2,
  Li: 0.98,
  Be: 1.57,
  B: 2.04,
  C: 2.55,
  N: 3.04,
  O: 3.44,
  F: 3.98,
  Na: 0.93,
  Mg: 1.31,
  Al: 1.61,
  Si: 1.9,
  P: 2.19,
  S: 2.58,
  Cl: 3.16,
  K: 0.82,
  Ca: 1,
  Ga: 1.81,
  Ge: 2.01,
  As: 2.18,
  Se: 2.55,
  Br: 2.96,
  Rb: 0.82,
  Sr: 0.95,
  In: 1.78,
  Sn: 1.96,
  Sb: 2.05,
  Te: 2.1,
  I: 2.66,
  Cs: 0.79,
  Ba: 0.89,
  Tl: 1.62,
  Pb: 2.33,
  Bi: 2.02,
  Po: 2,
  At: 2.2,
  Fe: 1.83,
  Cu: 1.9,
  Zn: 1.65,
  Ag: 1.93,
  Au: 2.54,
  Pt: 2.28,
  Hg: 2,
};

const MIN = 0.79;
const MAX = 3.98;

const meta = {
  title: 'Periodic/PeriodicTable',
  component: PeriodicTable,
  args: { headers: false, legend: true, markers: true, keyboard: true },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The table knows nothing about what it is showing: the caller says ' +
          'what colour each cell takes and what is written in it, and gets ' +
          'back which element was clicked.',
      },
    },
  },
} satisfies Meta<typeof PeriodicTable>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The zero-configuration call: an element picker, coloured by family. */
export const Picker: Story = {
  render: (args) => <PickerDemo {...args} />,
};

/** The same grid as a property map, with the header strips selecting a run. */
export const PropertyMap: Story = {
  args: { headers: true, legend: false },
  render: (args) => <PropertyMapDemo {...args} />,
};

/** Everything outside the shown set is dimmed, so the table keeps its shape. */
export const DimmedSelection: Story = {
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <PeriodicTable
        {...args}
        selected="Fe"
        isIncluded={(element) => element.block === 'd'}
      />
    </div>
  ),
};

/**
 * A table a reader can take away. The save glyph is the site's, in the bar
 * above, pointed at the box the table and its key sit in; the table only has
 * to be inside it. The corner that takes the whole table shows itself when it
 * is pointed at, and stays off a print and out of the saved file.
 */
export const Download: Story = {
  args: { headers: true, legend: true },
  render: (args) => <DownloadDemo {...args} />,
};

/** The table a wall chart draws: the name, and the electrons of each shell. */
export const Shells: Story = {
  args: { headers: true, legend: false },
  render: (args) => (
    <div style={{ maxWidth: 900 }}>
      <PeriodicTable
        {...args}
        selected="Ni"
        detailOf={(element) => element.name}
        shellsOf={(element) => shellsFor(element.atomicNumber)}
      />
    </div>
  ),
};

function PickerDemo(props: PeriodicTableProps): ReactElement {
  const [selected, setSelected] = useState('C');
  return (
    <div style={{ maxWidth: 720 }}>
      <PeriodicTable {...props} selected={selected} onSelect={setSelected} />
      <p style={CAPTION_STYLE}>
        Selected: <strong>{selected}</strong> — click a cell, or focus one and
        walk the table with the arrow keys.
      </p>
    </div>
  );
}

function PropertyMapDemo(props: PeriodicTableProps): ReactElement {
  const [selected, setSelected] = useState('O');
  const [range, setRange] = useState('none');
  return (
    <div style={{ maxWidth: 900 }}>
      <PeriodicTable
        {...props}
        selected={selected}
        onSelect={setSelected}
        onSelectRange={(picked) => {
          setRange(`${picked.kind} ${String(picked.value)}`);
        }}
        swatchOf={swatchFor}
        detailOf={detailFor}
      />
      <p style={CAPTION_STYLE}>
        Electronegativity on viridis; grey where the table above states none.
        Last header clicked: <strong>{range}</strong>.
      </p>
    </div>
  );
}

function DownloadDemo(props: PeriodicTableProps): ReactElement {
  const [selected, setSelected] = useState('O');
  const [range, setRange] = useState('none');
  return (
    <div style={{ maxWidth: 900 }}>
      <div className="no-print" style={BAR_STYLE}>
        <span style={CAPTION_STYLE}>Colour by electronegativity</span>
        <FigureDownload
          targetId="periodic-figure"
          fileName="electronegativity"
          testId="save-table"
        />
      </div>
      <div id="periodic-figure">
        <PeriodicTable
          {...props}
          selected={selected}
          onSelect={setSelected}
          onSelectRange={(picked) => {
            setRange(`${picked.kind} ${String(picked.value)}`);
          }}
          onSelectAll={() => {
            setRange('all');
          }}
          swatchOf={swatchFor}
          detailOf={detailFor}
        />
      </div>
      <p style={CAPTION_STYLE}>
        Selected: <strong>{selected}</strong>. Last header clicked:{' '}
        <strong>{range}</strong>.
      </p>
    </div>
  );
}

const CAPTION_STYLE = { color: TOKEN.textMuted, fontSize: 13 };

const BAR_STYLE = {
  alignItems: 'center',
  display: 'flex',
  gap: 8,
  justifyContent: 'flex-end',
  marginBottom: 8,
} as const;

function swatchFor(element: PeriodicElement) {
  const value = ELECTRONEGATIVITY[element.symbol];
  if (value === undefined) return UNKNOWN_SWATCH;
  return swatchAt(VIRIDIS, positionInRange(value, MIN, MAX));
}

const VIRIDIS = resolveColorScale('viridis').scale;

function shellsFor(atomicNumber: number): number[] {
  const shells: number[] = [];
  for (const subshell of configurationOf(atomicNumber)) {
    shells[subshell.n - 1] = (shells[subshell.n - 1] ?? 0) + subshell.electrons;
  }
  return shells;
}

function detailFor(element: PeriodicElement): string {
  const value = ELECTRONEGATIVITY[element.symbol];
  return value === undefined ? '' : value.toFixed(2);
}
