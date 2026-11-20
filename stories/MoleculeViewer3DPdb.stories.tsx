import type { Meta, StoryObj } from '@storybook/react-vite';

import ethanol from '../src/molecule3d/core/__tests__/data/ethanol.pdb?raw';
import sn2 from '../src/molecule3d/core/__tests__/data/sn2-ts-conect.pdb?raw';
import { MoleculeViewer3D } from '../src/molecule3d/ui/MoleculeViewer3D.tsx';

const meta = {
  title: 'Molecule3D/PDB',
  component: MoleculeViewer3D,
  args: { molfile: { format: 'pdb', data: ethanol } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A PDB file, read by molstar: its `HETATM` and `ATOM` records, bonded by its `CONECT` records, and by the distances where they say nothing. The files are illustrative, written by hand.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 'min(36rem, 90vw)', height: 420, display: 'flex' }}>
      <MoleculeViewer3D {...args} />
    </div>
  ),
} satisfies Meta<typeof MoleculeViewer3D>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Ethanol as `HETATM` records, every bond written in `CONECT`. */
export const Ethanol: Story = {};

/**
 * An SN2 transition state whose `CONECT` records bond one chlorine, 2.32 Å
 * away: drawn as a bond, however long. With the partial bonds switched on —
 * off by default for a PDB — the other chlorine is joined by dashes.
 */
export const ConectBondAndPartialBond: Story = {
  args: {
    molfile: { format: 'pdb', data: sn2 },
    defaultSettings: { partialBonds: 'on' },
  },
};
