import type { Meta, StoryObj } from '@storybook/react-vite';

import { CopyButton } from '../src/clipboard/ui/CopyButton.tsx';

import { MOLECULE_TABLE_HEADER, MOLECULE_TABLE_ROWS } from './moleculeTable.ts';

const CAFFEINE_SMILES = 'CN1C=NC2=C1C(=O)N(C)C(=O)N2C';
const CAFFEINE_INCHI =
  'InChI=1S/C8H10N4O2/c1-10-4-9-6-5(10)7(13)12(3)8(14)11(2)6/h4H,1-3H3';

/**
 * What a hit list writes when the button is pressed. A page holding thousands
 * of structures cannot build this string on every render, which is what the
 * lazy form of `content` is for.
 * @returns The whole table, tab separated.
 */
function hitList(): string {
  const lines = [MOLECULE_TABLE_HEADER.join('\t')];
  for (const row of MOLECULE_TABLE_ROWS) {
    lines.push(row.join('\t'));
  }
  return lines.join('\n');
}

const meta = {
  title: 'Clipboard/CopyButton',
  component: CopyButton,
  args: { content: CAFFEINE_SMILES, label: 'Copy SMILES' },
  argTypes: {
    content: { control: 'text' },
    label: { control: 'text' },
    copiedLabel: { control: 'text' },
    title: { control: 'text' },
    minimal: { control: 'boolean' },
    small: { control: 'boolean' },
    disabled: { control: 'boolean' },
    resetAfter: { control: { type: 'range', min: 300, max: 5000, step: 100 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A button that puts a piece of text on the clipboard and confirms it with a tick for a moment.',
      },
    },
  },
} satisfies Meta<typeof CopyButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Without its background, which is what a toolbar or a code block wants. */
export const Minimal: Story = {
  args: { minimal: true, small: true },
};

/** No label at all: a dense row of them, each saying what it copies on hover. */
export const IconOnly: Story = {
  args: { label: undefined, title: 'Copy the SMILES', minimal: true },
};

/** The label and its confirmation are both the site's own words. */
export const CustomLabel: Story = {
  args: {
    content: CAFFEINE_INCHI,
    label: 'Copy the InChI',
    copiedLabel: 'On the clipboard',
    icon: 'clipboard',
  },
};

/** The lazy form: the table is only written out once the button is pressed. */
export const LazyContent: Story = {
  args: { content: hitList, label: 'Copy 5 rows' },
  parameters: { controls: { exclude: ['content'] } },
};
