import type { Meta, StoryObj } from '@storybook/react-vite';

import benzene from '../src/molecule3d/core/__tests__/data/benzene.xyz?raw';
import dielsAlder from '../src/molecule3d/core/__tests__/data/diels-alder-ts.xyz?raw';
import sn2 from '../src/molecule3d/core/__tests__/data/sn2-ts.xyz?raw';
import { MoleculeViewer3D } from '../src/molecule3d/ui/MoleculeViewer3D.tsx';

const meta = {
  title: 'Molecule3D/PartialBonds',
  component: MoleculeViewer3D,
  args: { molfile: { format: 'xyz', data: dielsAlder } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'An XYZ file carries no bonds, so molstar bonds atoms by distance, and the stretched bonds of a transition state are not drawn. The viewer draws them dashed, with their lengths: by default for an XYZ file, and on request for a molfile, from the options popover. The geometries are illustrative, built by hand.',
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

/**
 * Butadiene and ethylene meeting: the two C–C bonds being formed, 2.27 Å
 * long, are dashed.
 */
export const DielsAlder: Story = {
  args: { frameNewMolecule: 'front' },
};

/** Cl⁻ + CH₃Cl: the C–Cl bond formed and the one broken, both 2.32 Å. */
export const Sn2: Story = {
  args: { molfile: { format: 'xyz', data: sn2 } },
};

/** The same transition state, its lengths left out. */
export const WithoutLengths: Story = {
  args: { defaultSettings: { partialBondLengths: false } },
};

/**
 * The SN2 reaction played: a bond while the chlorine is close, a dashed
 * partial bond while it comes or goes, nothing once it is away.
 */
export const Sn2Path: Story = {
  args: {
    molfile: { format: 'xyz', data: sn2Path(31) },
    playing: true,
    framesPerSecond: 15,
  },
};

/**
 * An ordinary molecule read from an XYZ file: no dash, though its 1,3 carbons
 * are 2.41 Å apart — as far as the forming bonds of a transition state.
 */
export const Benzene: Story = {
  args: { molfile: { format: 'xyz', data: benzene } },
};

/**
 * Cl⁻ attacking CH₃Cl and Cl⁻ leaving, there and back, as a multi-frame XYZ:
 * the incoming C–Cl from 3.2 Å to 1.8 Å, the leaving one the other way, the
 * three hydrogens turning inside out at the transition state.
 * @param steps - Frames from reactants to products.
 * @returns The XYZ text, one model per frame.
 */
function sn2Path(steps: number): string {
  const frames: string[] = [];
  for (let step = 0; step < steps; step++) {
    frames.push(sn2Frame(-Math.cos((Math.PI * step) / (steps - 1))));
  }
  for (let step = steps - 2; step > 0; step--) {
    frames.push(sn2Frame(-Math.cos((Math.PI * step) / (steps - 1))));
  }
  return frames.join('');
}

/**
 * One point of the path.
 * @param progress - From -1, the reactants, through 0, the transition state,
 * to 1, the products.
 * @returns One XYZ frame.
 */
function sn2Frame(progress: number): string {
  const incoming = chlorineDistance(progress);
  const leaving = chlorineDistance(-progress);
  const height = -0.36 * progress;
  const radius = Math.sqrt(1.09 * 1.09 - height * height);
  const lines = [
    '6',
    `SN2 path ${progress.toFixed(2)}`,
    atom('C', 0, 0, 0),
    atom('Cl', incoming, 0, 0),
    atom('Cl', -leaving, 0, 0),
  ];
  // Along x, so the camera, looking down z, sees the reaction side on.
  for (let hydrogen = 0; hydrogen < 3; hydrogen++) {
    const angle = (2 * Math.PI * hydrogen) / 3;
    lines.push(
      atom('H', height, radius * Math.cos(angle), radius * Math.sin(angle)),
    );
  }
  return `${lines.join('\n')}\n`;
}

/**
 * The distance of the incoming chlorine: 3.2 Å away, 2.32 Å at the transition
 * state, 1.8 Å bonded.
 * @param progress - See {@link sn2Frame}.
 * @returns Å.
 */
function chlorineDistance(progress: number): number {
  return 2.32 - (progress < 0 ? 0.88 : 0.52) * progress;
}

function atom(element: string, x: number, y: number, z: number): string {
  return `${element} ${x.toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)}`;
}
