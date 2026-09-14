import type { Meta, StoryObj } from '@storybook/react-vite';

import { MoleculeViewer3D } from '../src/molecule3d/ui/MoleculeViewer3D.tsx';

/** One butane conformer, as OpenChemLib's conformer generator wrote it. */
const BUTANE = `#1
OCL MolfileCreator  3D

 14 13  0  0  0  0  0  0  0  0999 V2000
    4.4226   -0.5543    0.4435 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0169    0.0827    0.6138 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.5065   -0.1174    2.0683 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.1008    0.5195    2.2385 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.3647   -1.6198    0.5445 H   0  0  0  0  0  0  0  0  0  0  0  0
    4.8209   -0.3327   -0.5231 H   0  0  0  0  0  0  0  0  0  0  0  0
    5.0966   -0.1900    1.1895 H   0  0  0  0  0  0  0  0  0  0  0  0
    2.3348   -0.3621   -0.0760 H   0  0  0  0  0  0  0  0  0  0  0  0
    3.0686    1.1316    0.3896 H   0  0  0  0  0  0  0  0  0  0  0  0
    2.4595   -1.1586    2.2977 H   0  0  0  0  0  0  0  0  0  0  0  0
    3.1924    0.3370    2.7582 H   0  0  0  0  0  0  0  0  0  0  0  0
    0.3786   -0.0048    1.6450 H   0  0  0  0  0  0  0  0  0  0  0  0
    0.7888    0.4738    3.2596 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.1067    1.5409    1.9218 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  1  5  1  0  0  0  0
  1  6  1  0  0  0  0
  1  7  1  0  0  0  0
  2  8  1  1  0  0  0
  2  9  1  0  0  0  0
  3 10  1  1  0  0  0
  3 11  1  0  0  0  0
  4 12  1  0  0  0  0
  4 13  1  0  0  0  0
  4 14  1  0  0  0  0
M  END
`;

const meta = {
  title: 'Molecule3D/MoleculeViewer3D',
  component: MoleculeViewer3D,
  args: { molfile: { format: 'mol', data: BUTANE } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A molecule in 3D with molstar, and a react-science toolbar over the canvas: distance, angle and dihedral measurements, spin, the molecular surface, a view reset and a popover of display options. Each tool can be switched off, and settings, spin and measurements can be owned by the site or left to the component.',
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

/** Every tool on. */
export const Default: Story = {};

/** Only the view tools: no measuring, no options popover. */
export const ViewOnly: Story = {
  args: { tools: { measure: false, options: false } },
};

/** A dihedral already drawn, down the C1–C2–C3–C4 backbone. */
export const WithMeasurement: Story = {
  args: {
    defaultSettings: { representation: 'stick' },
    measurements: [
      {
        kind: 'dihedral',
        atoms: [
          { unit: 0, element: 0 },
          { unit: 0, element: 1 },
          { unit: 0, element: 2 },
          { unit: 0, element: 3 },
        ],
      },
    ],
  },
};

/** The surface on, and the model turning. */
export const SurfaceAndSpin: Story = {
  args: { defaultSettings: { showSurface: true }, defaultSpinning: true },
};

/** One ethanol conformer, as OpenChemLib's conformer generator wrote it. */
const ETHANOL = `ethanol
OCL MolfileCreator  3D

  9  8  0  0  0  0  0  0  0  0999 V2000
    0.0834   -0.2326    0.0236 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.8608    0.5737   -0.8316 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.6677    1.9569   -0.5769 O   0  0  0  0  0  0  0  0  0  0  0  0
   -0.0455   -1.1877   -0.1496 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.0931   -0.0508    0.9693 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.0084    0.0115   -0.1879 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.6827    0.3747   -1.7867 H   0  0  0  0  0  0  0  0  0  0  0  0
   -1.7938    0.3223   -0.6150 H   0  0  0  0  0  0  0  0  0  0  0  0
   -1.1293    2.4241   -1.1004 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  1  4  1  0  0  0  0
  1  5  1  0  0  0  0
  1  6  1  0  0  0  0
  2  7  1  0  0  0  0
  2  8  1  0  0  0  0
  3  9  1  0  0  0  0
M  END
`;

/** The surface of ethanol, its hydroxyl coloured as the polar part. */
export const PolarSurface: Story = {
  args: {
    molfile: { format: 'mol', data: ETHANOL },
    defaultSettings: { showSurface: true, surfaceColoring: 'polarity' },
  },
};
