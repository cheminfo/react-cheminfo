import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { ClickToCopy } from '../src/clipboard/ui/ClickToCopy.tsx';

const ACROLEIN_SMILES = 'C=CC=O';

const ORBITALS = [
  { name: 'ψ12', energy: -10.28 },
  { name: 'ψ11', energy: -13.19 },
  { name: 'ψ10', energy: -14.02 },
];

const meta = {
  title: 'Clipboard/ClickToCopy',
  component: ClickToCopy,
  args: {
    value: ACROLEIN_SMILES,
    label: 'SMILES',
    children: ACROLEIN_SMILES,
  },
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A value copied by clicking it: a cursor carrying a clipboard and a tint announce it on hover, and a tick confirms the copy.',
      },
    },
  },
} satisfies Meta<typeof ClickToCopy>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A formula copied as text, and with its subscripts where the paste keeps HTML. */
export const Formula: Story = {
  args: {
    value: { text: 'C3H4O', html: 'C<sub>3</sub>H<sub>4</sub>O' },
    label: 'molecular formula',
    children: (
      <>
        C<sub>3</sub>H<sub>4</sub>O
      </>
    ),
  },
  parameters: { controls: { exclude: ['value', 'children'] } },
};

/** Each cell of a column is its own target, and the table stays a table. */
export const TableCells: Story = {
  render: () => (
    <table className="bp6-html-table bp6-compact">
      <thead>
        <tr>
          <th>Orbital</th>
          <th>Energy (eV)</th>
        </tr>
      </thead>
      <tbody>
        {ORBITALS.map((orbital) => (
          <tr key={orbital.name}>
            <td>{orbital.name}</td>
            <ClickToCopy
              as="td"
              value={orbital.energy.toFixed(2)}
              label={`energy of ${orbital.name}`}
            >
              {orbital.energy.toFixed(2)}
            </ClickToCopy>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/** A value inside a clickable row copies without also opening the row. */
export const InsideClickableRow: Story = {
  render: function InsideClickableRow() {
    const [opened, setOpened] = useState(0);
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <div
          role="button"
          tabIndex={0}
          data-testid="row"
          onClick={() => setOpened((count) => count + 1)}
          style={{ padding: 8, border: '1px solid var(--border)' }}
        >
          Acrolein —{' '}
          <ClickToCopy value={ACROLEIN_SMILES} label="SMILES">
            {ACROLEIN_SMILES}
          </ClickToCopy>
        </div>
        <span data-testid="opened">Opened {opened} times</span>
      </div>
    );
  },
};

/** A link inside the value keeps its own click and copies nothing. */
export const NestedLink: Story = {
  render: function NestedLink() {
    const [followed, setFollowed] = useState(0);
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <ClickToCopy value="7847" label="PubChem CID">
          CID 7847{' '}
          <a
            href="#pubchem"
            onClick={(event) => {
              event.preventDefault();
              setFollowed((count) => count + 1);
            }}
          >
            PubChem
          </a>
        </ClickToCopy>
        <span data-testid="followed">Followed {followed} times</span>
      </div>
    );
  },
};

/**
 * The family's selection policy: the text of a tool is not selectable, a field
 * is, and a region marked `selectable` is read and quoted.
 */
export const SelectionPolicy: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      <p data-testid="tool-text">
        Hybrid orbitals are an idealised localised model of bonding: dragging
        across this paragraph selects nothing.
      </p>
      <input
        className="bp6-input"
        aria-label="SMILES"
        defaultValue={ACROLEIN_SMILES}
      />
      <p className="text-selectable" data-testid="prose">
        This paragraph carries <code>text-selectable</code>, so it can be
        quoted.
      </p>
      <p>
        The structure is{' '}
        <ClickToCopy value={ACROLEIN_SMILES} label="SMILES">
          {ACROLEIN_SMILES}
        </ClickToCopy>
        .
      </p>
    </div>
  ),
};
