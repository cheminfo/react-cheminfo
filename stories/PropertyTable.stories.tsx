import type { Meta, StoryObj } from '@storybook/react-vite';
import { MF } from 'react-mf';

import { PropertyTable } from '../src/property/ui/PropertyTable.tsx';

import '../styles/chrome.css';

const meta = {
  title: 'Clipboard/PropertyTable',
  component: PropertyTable,
  args: {
    title: 'Composition',
    rows: [
      {
        label: 'Molecular formula',
        value: <MF mf="C8H10N4O2" />,
        copy: 'C8H10N4O2',
      },
      { label: 'Monoisotopic mass', value: '194.0804', note: 'Da' },
      { label: 'Molecular weight', value: '194.19', note: 'g/mol' },
      { label: 'logP', value: '—' },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(22rem, 92vw)' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One group of properties as a two-column table, every value copied by a click; a row the data holds no value for is a plain cell.',
      },
    },
  },
} satisfies Meta<typeof PropertyTable>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Caffeine's composition: a drawn formula, two masses, a missing value. */
export const Default: Story = {};
