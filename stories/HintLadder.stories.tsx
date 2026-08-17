import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { GlossaryProvider } from '../src/pedagogy/ui/GlossaryProvider.tsx';
import type { HintLadderProps } from '../src/pedagogy/ui/HintLadder.tsx';
import { HintLadder } from '../src/pedagogy/ui/HintLadder.tsx';

import { ALANINE_HINTS, SMILES_GLOSSARY } from './pedagogyFixtures.ts';

/**
 * The ladder as a page owns it: how many rungs are open is state, and the
 * button moves it by one.
 * @param props - Whatever the story is passing, `revealed` being the rung the
 * ladder opens on.
 * @returns The ladder, clickable.
 */
function HintLadderDemo(props: HintLadderProps): ReactElement | null {
  const [revealed, setRevealed] = useState(props.revealed);

  return (
    <HintLadder
      {...props}
      revealed={revealed}
      onReveal={() => {
        setRevealed((open) => open + 1);
      }}
    />
  );
}

// A hint links its jargon exactly like the statement above it, so the ladder is
// looked at under a glossary.
const inAColumn: Decorator = (Story) => (
  <GlossaryProvider glossary={SMILES_GLOSSARY}>
    <div style={{ width: 'min(36rem, 90vw)' }}>
      <Story />
    </div>
  </GlossaryProvider>
);

const meta = {
  title: 'Pedagogy/HintLadder',
  component: HintLadder,
  decorators: [inAColumn],
  args: { hints: ALANINE_HINTS, revealed: 0 },
  argTypes: {
    revealLabel: { control: 'text' },
    title: { control: 'text' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The hints a student has asked for, and the button that opens the next one — the L-alanine exercise of a SMILES course.',
      },
    },
  },
  // Keyed on the control, so changing how many rungs are open reopens the
  // ladder there instead of leaving the demo's own state in place.
  render: (args) => <HintLadderDemo key={args.revealed} {...args} />,
} satisfies Meta<typeof HintLadder>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Click through the three rungs: a nudge, then the construct, then almost the
 * answer. Opening all three at once would just be the solution.
 */
export const Default: Story = {};

/** Coming back to an exercise reopens the rungs that were already read. */
export const PartlyOpen: Story = {
  args: { revealed: 1 },
};

/** Nothing left to give: the button goes dead rather than disappearing. */
export const Exhausted: Story = {
  args: { revealed: ALANINE_HINTS.length },
};

/** No `onReveal`: the ladder only reports, because the button lives in `ExerciseActions`. */
export const WithoutTheButton: Story = {
  args: { revealed: 2 },
  render: (args) => <HintLadder {...args} />,
};

/** Both words are the tool's: a course may nudge rather than hint. */
export const RenamedForTheTool: Story = {
  args: { revealed: 1, title: 'Nudges', revealLabel: 'Nudge me' },
};
