import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

import type { Glossary } from '../src/pedagogy/core/glossary.ts';
import { GlossaryProvider } from '../src/pedagogy/ui/GlossaryProvider.tsx';
import { GlossaryText } from '../src/pedagogy/ui/GlossaryText.tsx';

import { SMILES_GLOSSARY, SMILES_PARAGRAPH } from './pedagogyFixtures.ts';

// A second vocabulary, so the story showing two of them side by side has
// something genuinely different to define.
const NMR_GLOSSARY: Glossary = {
  'chemical shift': {
    title: 'Chemical shift',
    summary:
      'Where a signal sits, in ppm of the spectrometer frequency, so the value does not change with the magnet.',
    examples: [
      {
        code: '7.26 ppm',
        note: 'residual CHCl₃, the usual internal reference',
      },
      { code: '0 ppm', note: 'tetramethylsilane, by definition' },
    ],
  },
  multiplicity: {
    title: 'Multiplicity',
    summary:
      'How many lines a signal is split into by its neighbours: n equivalent ones give n + 1 lines.',
    examples: [
      { code: 't', input: 'the CH₃ of ethanol', note: 'split by two protons' },
      { code: 'q', input: 'its CH₂', note: 'split by three' },
    ],
  },
};

const inAColumn: Decorator = (Story) => (
  <div style={{ maxWidth: '42rem', lineHeight: 1.55 }}>
    <Story />
  </div>
);

const meta = {
  title: 'Pedagogy/GlossaryProvider',
  component: GlossaryProvider,
  decorators: [inAColumn],
  args: {
    glossary: SMILES_GLOSSARY,
    children: <GlossaryText text={SMILES_PARAGRAPH} />,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Hands one glossary to every piece of prose below it, so a tutorial step, an exercise statement and a revealed hint all define a term the same way.',
      },
    },
  },
} satisfies Meta<typeof GlossaryProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Two vocabularies on one page: each column resolves against its own provider. */
export const TwoVocabularies: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <GlossaryProvider glossary={SMILES_GLOSSARY}>
        <p style={{ margin: 0 }}>
          <GlossaryText text="Benzene is six [[aromatic atom|aromatic atoms]], and a [[ring closure]] digit is what joins the ends." />
        </p>
      </GlossaryProvider>
      <GlossaryProvider glossary={NMR_GLOSSARY}>
        <p style={{ margin: 0 }}>
          <GlossaryText text="Ethanol shows a [[multiplicity|triplet]] and a quartet, at a [[chemical shift]] of 1.2 and 3.7 ppm." />
        </p>
      </GlossaryProvider>
    </div>
  ),
};

/** No terms written yet: the same prose reads plainly, with no brackets shown. */
export const NoTermsYet: Story = {
  args: { glossary: {} },
};
