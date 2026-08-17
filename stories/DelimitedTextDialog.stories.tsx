import { Button } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import type { DelimitedTextDialogProps } from '../src/delimited/ui/DelimitedTextDialog.tsx';
import { DelimitedTextDialog } from '../src/delimited/ui/DelimitedTextDialog.tsx';

import { MOLECULE_TABLE_HEADER, MOLECULE_TABLE_ROWS } from './moleculeTable.ts';

// The same cells, addressed by their column, so the page behind the dialog is
// the table the dialog hands over.
const PAGE_ROWS = MOLECULE_TABLE_ROWS.map((row) => ({
  id: row.join('|'),
  cells: row.map((value, index) => ({
    column: MOLECULE_TABLE_HEADER[index] ?? String(index),
    value,
  })),
}));

const PAGE_STYLE = {
  display: 'grid',
  padding: 24,
  gap: 12,
  justifyItems: 'start',
} as const;

/**
 * The table a visitor is looking at when they reach for the copy button.
 * @param props - What the page puts underneath the table.
 * @param props.children - The trigger and the dialog itself, so the copy
 * control is read next to the rows it hands over.
 * @returns The molecule table, with those controls beneath it.
 */
function MoleculePage(props: { children: ReactNode }): ReactElement {
  return (
    <div style={PAGE_STYLE}>
      <table className="bp6-html-table bp6-compact bp6-html-table-bordered">
        <thead>
          <tr>
            {MOLECULE_TABLE_HEADER.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PAGE_ROWS.map((row) => (
            <tr key={row.id}>
              {row.cells.map((cell) => (
                <td key={cell.column}>{cell.value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {props.children}
    </div>
  );
}

function DialogFromButtonDemo(props: DelimitedTextDialogProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MoleculePage>
      <Button icon="th" text="Copy the table" onClick={() => setIsOpen(true)} />
      <DelimitedTextDialog
        {...props}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </MoleculePage>
  );
}

const meta = {
  title: 'Delimited/DelimitedTextDialog',
  component: DelimitedTextDialog,
  args: {
    isOpen: true,
    onClose: () => null,
    rows: MOLECULE_TABLE_ROWS,
    header: MOLECULE_TABLE_HEADER,
    fileName: 'molecules',
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    title: { control: 'text' },
    defaultDelimiter: {
      control: 'inline-radio',
      options: ['tab', 'comma', 'semicolon'],
    },
    downloadable: { control: 'boolean' },
    fileName: { control: 'text' },
    height: { control: { type: 'range', min: 120, max: 480, step: 20 } },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The dialog every site rebuilt to hand a table over, shown above the table it comes from: the text, a choice of separator, and a way to copy or save it.',
      },
    },
  },
  render: (args) => (
    <MoleculePage>
      <DelimitedTextDialog {...args} />
    </MoleculePage>
  ),
} satisfies Meta<typeof DelimitedTextDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Open on the page it belongs to; the Controls panel is what closes it here. */
export const Default: Story = {};

/** The same table as CSV, where the name `2,4-D` has to be quoted. */
export const CommaSeparated: Story = {
  args: { defaultDelimiter: 'comma', title: 'Copy the compounds' },
};

/** How it is actually reached: a button in the page's own toolbar. */
export const FromAButton: Story = {
  args: { isOpen: false },
  render: (args) => <DialogFromButtonDemo {...args} />,
};
