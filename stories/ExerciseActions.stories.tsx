import { Button } from '@blueprintjs/core';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { ExerciseActionsProps } from '../src/pedagogy/ui/ExerciseActions.tsx';
import { ExerciseActions } from '../src/pedagogy/ui/ExerciseActions.tsx';

import { ALANINE_HINTS } from './pedagogyFixtures.ts';

const SOLUTION = 'N[C@@H](C)C(=O)O';

/**
 * The row as a page owns it: the hint count and the solution are state, so
 * every button changes something visible.
 * @param props - Whatever the story is passing.
 * @returns The row, plus what the last click did.
 */
function ExerciseActionsDemo(props: ExerciseActionsProps): ReactElement {
  const [hintsRevealed, setHintsRevealed] = useState(props.hintsRevealed ?? 0);
  const [showSolution, setShowSolution] = useState(props.showSolution ?? false);
  const [checked, setChecked] = useState(false);

  return (
    <div style={COLUMN_STYLE}>
      <ExerciseActions
        {...props}
        hintsRevealed={hintsRevealed}
        showSolution={showSolution}
        onCheck={() => {
          setChecked(true);
        }}
        onRevealHint={() => {
          setHintsRevealed((open) => open + 1);
        }}
        onToggleSolution={() => {
          setShowSolution((shown) => !shown);
        }}
        onReset={() => {
          setChecked(false);
          setHintsRevealed(0);
          setShowSolution(false);
        }}
      />
      {checked && <span style={NOTE_STYLE}>Attempt recorded.</span>}
      {showSolution && <code style={SOLUTION_STYLE}>{SOLUTION}</code>}
    </div>
  );
}

/** A story that shows an omitted action has nothing to record. */
function noop(): void {
  // The point of the story is which buttons are drawn, not what they do.
}

const inARow: Decorator = (Story) => (
  <div style={{ width: 'min(38rem, 90vw)' }}>
    <Story />
  </div>
);

const meta = {
  title: 'Pedagogy/ExerciseActions',
  component: ExerciseActions,
  decorators: [inARow],
  args: { hintsRevealed: 0, hintCount: ALANINE_HINTS.length },
  argTypes: {
    checkLabel: { control: 'text' },
    checkDisabled: { control: 'boolean' },
    showSolution: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The row under an exercise — Check, Reveal hint, the solution, Reset — always in that order, so a student moving between two of our tools does not have to look for them.',
      },
    },
  },
  // Keyed on the two controls that seed the demo's state, so moving either one
  // is reflected instead of being swallowed by the last click.
  render: (args) => (
    <ExerciseActionsDemo
      key={`${args.hintsRevealed}-${String(args.showSolution)}`}
      {...args}
    />
  ),
} satisfies Meta<typeof ExerciseActions>;

export default meta;

type Story = StoryObj<typeof meta>;

/** All four, wired: the hint count climbs and the sample answer appears. */
export const Default: Story = {};

/**
 * Leaving a callback out removes its button: a tool that grades on every
 * keystroke has no Check, and a one-field answer has nothing to reset.
 */
export const TwoActions: Story = {
  render: () => (
    <ExerciseActions
      onRevealHint={noop}
      hintsRevealed={1}
      hintCount={ALANINE_HINTS.length}
      onToggleSolution={noop}
    />
  ),
};

/** Nothing typed yet, so there is nothing to check. */
export const NothingToCheckYet: Story = {
  args: { checkDisabled: true },
};

/** Every hint read: the button stays, dead, rather than vanishing mid-exercise. */
export const HintsExhausted: Story = {
  args: { hintsRevealed: ALANINE_HINTS.length },
};

/** With the answer on screen, the button offers to put it away again. */
export const SolutionShowing: Story = {
  args: { showSolution: true },
};

/** A tool adds its own buttons after the four standard ones, never before. */
export const WithToolButtons: Story = {
  args: {
    children: (
      <>
        <Button icon="diagram-tree" text="Show diagram" onClick={noop} />
        <Button icon="cube" text="3D view" onClick={noop} />
      </>
    ),
  },
};

const COLUMN_STYLE: CSSProperties = {
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const NOTE_STYLE: CSSProperties = { color: '#5b6875', fontSize: 12 };

const SOLUTION_STYLE: CSSProperties = {
  background: '#f5f7fa',
  border: '1px solid #dfe3e8',
  borderRadius: 4,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  padding: '4px 8px',
};
