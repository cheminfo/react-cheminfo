import type { Meta, StoryObj } from '@storybook/react-vite';

import type { MoleculeFileRow } from '../src/structure/core/moleculeFileTypes.ts';
import { MoleculeExport } from '../src/structure/ui/MoleculeExport.tsx';

const PAGE: MoleculeFileRow[] = [
  { idCode: 'gCaHLHBj@@', name: 'ethanol', fields: { mw: 46.07 } },
];

/**
 * A search of three pages, as a site's API answers it.
 * @yields {MoleculeFileRow[]} Each page.
 */
async function* threePages() {
  yield PAGE;
  yield PAGE;
  yield PAGE;
}

const meta: Meta<typeof MoleculeExport> = {
  title: 'Structure/MoleculeExport',
  component: MoleculeExport,
  args: { read: threePages, fileName: 'matches' },
};

export default meta;

type Story = StoryObj<typeof MoleculeExport>;

export const MoreThanAFileHolds: Story = { args: { total: 34_567 } };

export const EveryMatchFits: Story = { args: { total: 3 } };

export const NotCounted: Story = {};
