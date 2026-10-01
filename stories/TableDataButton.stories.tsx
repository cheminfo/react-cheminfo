import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';

import { TableDataButton } from '../src/delimited/ui/TableDataButton.tsx';

import { MOLECULE_TABLE_HEADER, MOLECULE_TABLE_ROWS } from './moleculeTable.ts';

const PAGE_STYLE = {
  display: 'grid',
  padding: 24,
  gap: 12,
  justifyItems: 'start',
} as const;

const HEADER_ROW_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  width: '100%',
} as const;

/**
 * The table the button hands over, with the button where a site puts it: in
 * the row above the rows, not under them.
 * @param props - The button being shown.
 * @param props.button - The control, so the story reads as the page does.
 * @returns The card.
 */
function TablePage(props: { button: ReactElement }): ReactElement {
  return (
    <div style={PAGE_STYLE}>
      <div style={HEADER_ROW_STYLE}>
        <h3 style={{ margin: 0, fontSize: 14 }}>Compounds</h3>
        {props.button}
      </div>
      <table className="bp6-html-table bp6-compact bp6-html-table-bordered">
        <thead>
          <tr>
            {MOLECULE_TABLE_HEADER.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOLECULE_TABLE_ROWS.map((row) => (
            <tr key={row.join('|')}>
              {row.map((value, index) => (
                <td key={MOLECULE_TABLE_HEADER[index] ?? index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const meta = {
  title: 'Delimited/TableDataButton',
  component: TableDataButton,
  args: {
    rows: MOLECULE_TABLE_ROWS,
    header: MOLECULE_TABLE_HEADER,
    fileName: 'molecules',
  },
  argTypes: {
    text: { control: 'text' },
    title: { control: 'text' },
    minimal: { control: 'boolean' },
    small: { control: 'boolean' },
    disabled: { control: 'boolean' },
    defaultDelimiter: {
      control: 'inline-radio',
      options: ['tab', 'comma', 'semicolon'],
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The one control that takes a table off the page. It is named after what it does rather than after a separator, because the dialog behind it writes tab-, comma- or semicolon-separated text and a button that says TSV is wrong two times out of three.',
      },
    },
  },
  render: (args) => <TablePage button={<TableDataButton {...args} />} />,
} satisfies Meta<typeof TableDataButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The glyph alone, which is what a toolbar over a table wants. */
export const Default: Story = {};

/** Named, for a card header with room for words. */
export const WithALabel: Story = {
  args: { text: 'Copy or download', small: true },
};

/** Greyed by itself while the table is empty, rather than opening on nothing. */
export const NothingToHandOver: Story = {
  args: { rows: [] },
};
