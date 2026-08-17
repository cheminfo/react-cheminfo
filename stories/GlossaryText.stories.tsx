import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

import { GlossaryProvider } from '../src/pedagogy/ui/GlossaryProvider.tsx';
import { GlossaryText } from '../src/pedagogy/ui/GlossaryText.tsx';

import {
  SMILES_GLOSSARY,
  SMILES_PARAGRAPH,
  SMILES_SENTENCE,
} from './pedagogyFixtures.ts';

// The sides a definition is ever opened on.
const PLACEMENTS = ['bottom', 'top', 'right', 'left'];

// Prose sits deep inside a card or a callout and reads its terms from the
// provider above it, which is how a site links jargon without threading a prop
// through five components.
const withGlossary: Decorator = (Story) => (
  <GlossaryProvider glossary={SMILES_GLOSSARY}>
    <p style={{ maxWidth: '42rem', margin: 0, lineHeight: 1.55 }}>
      <Story />
    </p>
  </GlossaryProvider>
);

const meta = {
  title: 'Pedagogy/GlossaryText',
  component: GlossaryText,
  decorators: [withGlossary],
  args: { text: SMILES_PARAGRAPH },
  argTypes: {
    text: { control: 'text' },
    placement: { control: 'select', options: PLACEMENTS },
    className: { control: 'text' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Authored prose whose `[[term]]` markers become hoverable definitions — the cheapest contextual help there is, and the one most tools forget.',
      },
    },
  },
} satisfies Meta<typeof GlossaryText>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Four terms are linked and hoverable; `canonicalisation` is deliberately not
 * in the glossary and renders as its plain word, never as the brackets — prose
 * may link a term months before anybody writes its definition.
 */
export const Default: Story = {};

/** `[[term|displayed text]]` keeps the sentence readable while the lookup stays the glossary key. */
export const RenamedInTheSentence: Story = {
  args: { text: SMILES_SENTENCE },
};

/** A page showing a second vocabulary passes its own terms instead of the provider's. */
export const OwnGlossary: Story = {
  args: {
    text: 'A [[smarts|SMARTS]] pattern is a query, not a molecule: [[branch]] means the same thing in both, but this page defines only the query words.',
    glossary: {
      smarts: {
        title: 'SMARTS',
        summary:
          'The query dialect of SMILES: the same syntax, plus the atom and bond properties a substructure search asks about.',
        examples: [
          { code: '[CX3](=O)[OX2H1]', note: 'a carboxylic acid, and no ester' },
          { code: '[#6]', note: 'any carbon, aromatic or not' },
        ],
      },
    },
  },
};

/** Nothing defined at all: every marker falls back to plain prose. */
export const NoGlossary: Story = {
  args: { glossary: {} },
};

/** A definition that would fall off the bottom of a card opens to the right. */
export const OpensToTheRight: Story = {
  args: { placement: 'right' },
};
