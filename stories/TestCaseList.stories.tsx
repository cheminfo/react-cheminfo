import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { TestCaseList } from '../src/pedagogy/ui/TestCaseList.tsx';

import { QUERY_TEST_CASES, SOLVED_TEST_CASES } from './pedagogyFixtures.ts';

const inAColumn: Decorator = (Story) => (
  <div style={{ width: 'min(40rem, 92vw)' }}>
    <Story />
  </div>
);

const meta = {
  title: 'Pedagogy/TestCaseList',
  component: TestCaseList,
  decorators: [inAColumn],
  args: { results: QUERY_TEST_CASES },
  argTypes: { pending: { control: 'boolean' } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One row per graded case, each carrying the validator’s own sentence. The sentence is the teaching — `matched, but an ester is not an acid` is what a student can act on, where `assertion failed` is not — so it is never paraphrased here.',
      },
    },
  },
} satisfies Meta<typeof TestCaseList>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * `C(=O)O` typed for "every carboxylic acid and nothing else": four cases pass,
 * and the two that fail say exactly what to change.
 */
export const Default: Story = {};

/** Naming the molecule turns the list into the chemistry problem it is. */
export const WithTheMoleculeNamed: Story = {
  render: (args) => (
    <TestCaseList
      results={QUERY_TEST_CASES}
      pending={args.pending}
      label={(result) => (
        <>
          {result.name}
          <code style={SMILES_STYLE}>{result.smiles}</code>
        </>
      )}
    />
  ),
};

/** The same six once the query reads `[CX3](=O)[OX2H1]` — green all the way down. */
export const AllPassing: Story = {
  args: { results: SOLVED_TEST_CASES },
};

/**
 * The answer did not compile, so nothing actually failed: every case is drawn
 * neutral rather than red, and a student is not told they got six wrong.
 */
export const NotGradedYet: Story = {
  args: { pending: true },
};

const SMILES_STYLE: CSSProperties = {
  color: '#5b6875',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontWeight: 400,
  marginLeft: 8,
};
