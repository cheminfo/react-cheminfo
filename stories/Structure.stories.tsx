import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import type { StructureProps } from '../src/structure/ui/Structure.tsx';
import { Structure } from '../src/structure/ui/Structure.tsx';
import { TOKEN } from '../src/tokens/core/familyTokens.ts';

import {
  ASPIRIN,
  ASPIRIN_ACETYL,
  CAFFEINE,
  DEMO_MOLECULES,
} from './structureFixtures.ts';

// A row of a table, a card, and the panel of a page.
const SIZES = [
  { width: 110, height: 80 },
  { width: 200, height: 150 },
  { width: 320, height: 240 },
];

/** What a molfile whose atom block is empty looks like coming out of a tool. */
const EMPTY_MOLFILE = `
OCL MolfileCreator  2D

  0  0  0  0  0  0  0  0  0  0999 V2000
M  END
`;

interface UnreadableCase {
  caption: string;
  smiles?: string;
  molfile?: string;
}

// Everything a page is handed that holds no structure it can draw.
const UNREADABLE: readonly UnreadableCase[] = [
  { caption: 'a name, not a notation', smiles: 'benzene' },
  { caption: 'a ring that never closes', smiles: 'C1CCCCC' },
  { caption: 'a molfile with no atoms', molfile: EMPTY_MOLFILE },
  { caption: 'nothing at all' },
];

const meta = {
  title: 'Structure/Structure',
  component: Structure,
  args: { smiles: CAFFEINE, width: 220, height: 160 },
  argTypes: {
    width: { control: { type: 'range', min: 80, max: 480, step: 10 } },
    height: { control: { type: 'range', min: 60, max: 360, step: 10 } },
    autoCrop: { control: 'boolean' },
    autoCropMargin: { control: { type: 'range', min: 0, max: 40, step: 2 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A read-only depiction, drawn from whichever notation the caller has — an idCode, a molfile or a SMILES — and never a broken box when there is none.',
      },
    },
  },
} satisfies Meta<typeof Structure>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Three molecules the sites show, each named inside its own picture. */
export const RealMolecules: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={ROW_STYLE}>
      {DEMO_MOLECULES.map((molecule) => (
        <Structure
          key={molecule.name}
          {...args}
          autoCrop={false}
          smiles={molecule.smiles}
          labels={{ caption: molecule.name }}
        />
      ))}
    </div>
  ),
};

/**
 * The same molecule from a table row up to a panel of its own. Cropping is off
 * here, because a cropped picture keeps the atoms at the size the notation
 * lays them out and so barely follows the box it is given.
 */
export const EverySize: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={ROW_STYLE}>
      {SIZES.map((size) => (
        <Structure
          key={size.width}
          {...args}
          autoCrop={false}
          width={size.width}
          height={size.height}
        />
      ))}
    </div>
  ),
};

/**
 * What a page gets when the notation is wrong, empty, or simply absent: the
 * same quiet placeholder at the size of the picture that would have been
 * drawn, so a list of structures keeps its rhythm instead of gaining a red box.
 */
export const Unreadable: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={ROW_STYLE}>
      {UNREADABLE.map((entry) => (
        <Figure key={entry.caption} caption={entry.caption}>
          <Structure
            {...args}
            smiles={entry.smiles}
            molfile={entry.molfile}
            fallback="no structure"
          />
        </Figure>
      ))}
    </div>
  ),
};

/**
 * Atom and bond indices written on the picture, which is what turns a
 * depiction into something an assignment or a highlight can point at.
 */
export const Labels: Story = {
  args: {
    width: 260,
    height: 200,
    autoCrop: false,
    labels: { atoms: true, bonds: true, caption: 'caffeine' },
  },
};

/** The acetyl of aspirin painted, which is how a substructure hit is shown. */
export const Highlighted: Story = {
  args: {
    smiles: ASPIRIN,
    width: 280,
    height: 200,
    autoCrop: false,
    atomHighlight: ASPIRIN_ACETYL,
    labels: { caption: 'acetyl' },
  },
};

/**
 * Text of the caller's own beside every atom — here each heavy atom numbered
 * from one, the way a guide or a ring count points at atoms.
 */
export const AtomLabels: Story = {
  args: {
    width: 260,
    height: 200,
    autoCrop: false,
    atomLabels: numberedAtoms(14),
  },
};

/** Clicking an atom paints it, which is how an attachment point is picked. */
export const ClickableAtoms: Story = {
  args: { smiles: ASPIRIN, width: 280, height: 200, autoCrop: false },
  render: (args) => <ClickToHighlight {...args} />,
};

/**
 * Number atoms from one, keyed by the index openchemlib gives them.
 * @param count - How many atoms to number.
 * @returns The labels.
 */
function numberedAtoms(count: number): Map<number, string> {
  const labels = new Map<number, string>();
  for (let atom = 0; atom < count; atom++) labels.set(atom, String(atom + 1));
  return labels;
}

/**
 * A structure whose clicked atom is highlighted, with a caption naming it.
 * @param props - The structure to draw.
 * @returns The figure.
 */
function ClickToHighlight(props: StructureProps): ReactElement {
  const [atom, setAtom] = useState<number | null>(null);
  return (
    <Figure caption={atom === null ? 'click an atom' : `atom ${atom}`}>
      <Structure
        {...props}
        atomHighlight={atom === null ? undefined : [atom]}
        onAtomClick={setAtom}
      />
    </Figure>
  );
}

/**
 * A caption under a picture, for the cases the depiction itself cannot name.
 * @param props - What the caption says, and the picture it sits under.
 * @param props.caption - The one line naming what the drawing is showing, such
 * as the option a story is comparing.
 * @param props.children - The depiction the caption belongs to.
 * @returns The figure.
 */
function Figure(props: { caption: string; children: ReactNode }): ReactElement {
  return (
    <figure style={FIGURE_STYLE}>
      {props.children}
      <figcaption style={CAPTION_STYLE}>{props.caption}</figcaption>
    </figure>
  );
}

const ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  gap: 16,
};

const FIGURE_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 0,
  border: `1px dashed ${TOKEN.borderStrong}`,
  borderRadius: TOKEN.radius,
  margin: 0,
  gap: 4,
};

const CAPTION_STYLE: CSSProperties = {
  padding: '0 8px 6px',
  color: TOKEN.textMuted,
  fontSize: '0.75rem',
};
