import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import type {
  ExerciseLevel,
  ExerciseStatus,
} from '../src/pedagogy/core/types.ts';
import {
  ExerciseLevelTag,
  ExerciseStatusIcon,
} from '../src/pedagogy/ui/ExerciseTags.tsx';

const STATUSES: ExerciseStatus[] = ['idle', 'attempted', 'solved'];

// One exercise per level and status, so the nine rows are a list a SMILES
// course would really show rather than a colour swatch.
const LIST: Array<{
  title: string;
  level: ExerciseLevel;
  status: ExerciseStatus;
}> = [
  { title: 'Ethanol', level: 'beginner', status: 'solved' },
  { title: 'Propan-2-ol', level: 'beginner', status: 'attempted' },
  { title: 'Methane', level: 'beginner', status: 'idle' },
  { title: 'Acetic acid', level: 'intermediate', status: 'solved' },
  { title: 'Benzene', level: 'intermediate', status: 'attempted' },
  { title: 'Cyclohexane', level: 'intermediate', status: 'idle' },
  { title: 'L-alanine', level: 'advanced', status: 'solved' },
  { title: 'Paracetamol', level: 'advanced', status: 'attempted' },
  { title: 'Naphthalene', level: 'advanced', status: 'idle' },
];

const meta = {
  title: 'Pedagogy/ExerciseStatusIcon',
  component: ExerciseStatusIcon,
  args: { status: 'solved' },
  argTypes: {
    status: { control: 'select', options: STATUSES },
    title: { control: 'text' },
    size: { control: { type: 'range', min: 12, max: 48, step: 2 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The glyph in front of an exercise title: an empty circle, a warning sign, a tick. `idle` is the one uncoloured value in the package — a list nobody has opened must not read as a list of mistakes.',
      },
    },
  },
} satisfies Meta<typeof ExerciseStatusIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The three, with the words they stand for. */
export const EveryStatus: Story = {
  render: (args) => (
    <div style={ROW_STYLE}>
      {STATUSES.map((status) => (
        <span key={status} style={PAIR_STYLE}>
          <ExerciseStatusIcon status={status} size={args.size} />
          {status}
        </span>
      ))}
    </div>
  ),
};

/** Every level against every status, as the exercise list of a set draws them. */
export const TheExerciseList: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <ul style={LIST_STYLE}>
      {LIST.map((entry) => (
        <li key={entry.title} style={ITEM_STYLE}>
          <ExerciseStatusIcon status={entry.status} />
          <span style={{ flex: '1 1 auto' }}>{entry.title}</span>
          <ExerciseLevelTag level={entry.level} />
        </li>
      ))}
    </ul>
  ),
};

/** Big enough for a summary card, rather than for a line of a list. */
export const Large: Story = {
  args: { size: 32 },
};

/** What the pointer and a screen reader are told, in the course's words. */
export const Announced: Story = {
  args: { status: 'attempted', title: 'Handed in, not right yet' },
};

const ROW_STYLE: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: 16,
};

const PAIR_STYLE: CSSProperties = {
  alignItems: 'center',
  color: '#5b6875',
  display: 'flex',
  fontSize: 13,
  gap: 6,
};

const LIST_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  listStyle: 'none',
  margin: 0,
  padding: 0,
  width: 'min(28rem, 92vw)',
};

const ITEM_STYLE: CSSProperties = {
  alignItems: 'center',
  borderTop: '1px solid var(--border, #dfe3e8)',
  display: 'flex',
  gap: 8,
  padding: '5px 2px',
};
