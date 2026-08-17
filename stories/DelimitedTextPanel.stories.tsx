import type { Meta, StoryObj } from '@storybook/react-vite';

import { DelimitedTextPanel } from '../src/delimited/ui/DelimitedTextPanel.tsx';

import { MOLECULE_TABLE_HEADER, MOLECULE_TABLE_ROWS } from './moleculeTable.ts';

const meta = {
  title: 'Delimited/DelimitedTextPanel',
  component: DelimitedTextPanel,
  args: {
    rows: MOLECULE_TABLE_ROWS,
    header: MOLECULE_TABLE_HEADER,
    fileName: 'molecules',
  },
  argTypes: {
    defaultDelimiter: {
      control: 'inline-radio',
      options: ['tab', 'comma', 'semicolon'],
    },
    downloadable: { control: 'boolean' },
    fileName: { control: 'text' },
    label: { control: 'text' },
    height: { control: { type: 'range', min: 120, max: 480, step: 20 } },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A whole table as text: read it, switch the separator, then copy it or save it. Every cell is escaped for the separator in force, so what a spreadsheet opens holds the columns the page shows.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 'min(46rem, 92vw)' }}>
      <DelimitedTextPanel {...args} />
    </div>
  ),
} satisfies Meta<typeof DelimitedTextPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Tab separated: only the two notes holding a quote have to be escaped. */
export const Default: Story = {};

/**
 * The comma quotes the cells that carry one — the name `2,4-D` and the note
 * spelling it out — which is the file a naive `join(',')` corrupts.
 */
export const CommaSeparated: Story = {
  args: { defaultDelimiter: 'comma' },
};

/** The separator a spreadsheet set to a European locale expects. */
export const SemicolonSeparated: Story = {
  args: { defaultDelimiter: 'semicolon' },
};

/** A sentence saying what the table holds, in place of the row count. */
export const OwnDescription: Story = {
  args: {
    description:
      'Five compounds, with the monoisotopic mass of the neutral molecule.',
  },
};

/** Framed in a course page, where a download cannot start: copy is the way out. */
export const WithoutSave: Story = {
  args: { downloadable: false, height: 200 },
};
