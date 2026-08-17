import type { Meta, StoryObj } from '@storybook/react-vite';

import { CodeBlock } from '../src/clipboard/ui/CodeBlock.tsx';

const INSTALL_COMMAND = 'npm install react-cheminfo @blueprintjs/core';

const CAFFEINE_SMILES = 'CN1C=NC2=C1C(=O)N(C)C(=O)N2C';

// What a share dialog hands a teacher to paste into a course page.
const EMBED_SNIPPET = `<iframe
  src="https://surge.cheminfo.org/exercises?mf=C5H12,C6H14&embed=1"
  width="100%"
  height="700"
  style="border: 1px solid #ddd; border-radius: 8px"
  title="Surge — Exercises"
></iframe>`;

// Caffeine, written by OpenChemLib, so the scrolling block holds a real file
// rather than a made-up one.
const CAFFEINE_MOLFILE = `caffeine
OCL MolfileCreator  2D

 14 15  0  0  0  0  0  0  0  0999 V2000
    0.8660    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.0000   -0.5000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
   -0.9135   -0.0933    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -1.5827   -0.8364    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
   -1.0827   -1.7024    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.1045   -1.4945    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.5646   -2.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.5427   -2.0298    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    0.2556   -3.1887    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    0.9247   -3.9319    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.7226   -3.3966    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -1.0316   -4.3477    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
   -1.3917   -2.6535    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
   -2.3698   -2.8614    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  2  0  0  0  0
  4  5  1  0  0  0  0
  5  6  2  0  0  0  0
  2  6  1  0  0  0  0
  6  7  1  0  0  0  0
  7  8  2  0  0  0  0
  7  9  1  0  0  0  0
  9 10  1  0  0  0  0
  9 11  1  0  0  0  0
 11 12  2  0  0  0  0
 11 13  1  0  0  0  0
  5 13  1  0  0  0  0
 13 14  1  0  0  0  0
M  END`;

// The same SMILES, cut where its ring closures are, so the drawn text can
// colour them while the copy still hands over the string itself.
const SMILES_PARTS = [
  { id: 'head', text: 'CN', ring: false },
  { id: 'imidazole-open', text: '1', ring: true },
  { id: 'imidazole', text: 'C=NC', ring: false },
  { id: 'pyrimidine-open', text: '2', ring: true },
  { id: 'fusion', text: '=C', ring: false },
  { id: 'imidazole-close', text: '1', ring: true },
  { id: 'carbonyls', text: 'C(=O)N(C)C(=O)N', ring: false },
  { id: 'pyrimidine-close', text: '2', ring: true },
  { id: 'tail', text: 'C', ring: false },
];

const meta = {
  title: 'Clipboard/CodeBlock',
  component: CodeBlock,
  args: { code: INSTALL_COMMAND },
  argTypes: {
    code: { control: 'text' },
    tone: { control: 'inline-radio', options: ['default', 'muted', 'dark'] },
    copyable: { control: 'boolean' },
    maxHeight: { control: 'number' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A block of text to hand over — an address, the iframe that frames it, a structure file — with a copy button in its corner when the visitor is meant to take it.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 'min(44rem, 92vw)' }}>
      <CodeBlock {...args} />
    </div>
  ),
} satisfies Meta<typeof CodeBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The grey panel, which is how a block reads inside a white card. */
export const Muted: Story = {
  args: { code: CAFFEINE_SMILES, tone: 'muted' },
};

/** The dark plate, for a block sitting in a tooltip or on a dark surface. */
export const Dark: Story = {
  args: { code: EMBED_SNIPPET, tone: 'dark' },
};

/** What a share dialog shows: the snippet, and the button that takes it. */
export const Copyable: Story = {
  args: { code: EMBED_SNIPPET, tone: 'muted', copyable: true },
};

/** A whole molfile held to 180 px, so it scrolls instead of taking the page. */
export const Scrolling: Story = {
  args: {
    code: CAFFEINE_MOLFILE,
    tone: 'muted',
    copyable: true,
    maxHeight: 180,
  },
};

/** `children` colours the ring closures; `code` is still what gets copied. */
export const Highlighted: Story = {
  args: { code: CAFFEINE_SMILES, tone: 'dark', copyable: true },
  render: (args) => (
    <div style={{ width: 'min(44rem, 92vw)' }}>
      <CodeBlock {...args}>
        {SMILES_PARTS.map((part) => (
          <span
            key={part.id}
            style={
              part.ring ? { color: '#fbbf24', fontWeight: 700 } : undefined
            }
          >
            {part.text}
          </span>
        ))}
      </CodeBlock>
    </div>
  ),
};
