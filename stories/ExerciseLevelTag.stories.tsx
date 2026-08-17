import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { ExerciseLevel } from '../src/pedagogy/core/types.ts';
import { ExerciseLevelTag } from '../src/pedagogy/ui/ExerciseTags.tsx';
import { LEVEL_ORDER } from '../src/pedagogy/ui/exerciseMeta.ts';

const meta = {
  title: 'Pedagogy/ExerciseLevelTag',
  component: ExerciseLevelTag,
  args: { level: 'beginner' },
  argTypes: {
    level: { control: 'select', options: LEVEL_ORDER },
    label: { control: 'text' },
    active: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'How hard an exercise or a tutorial step is: green, amber, pink — the same three colours the tutorial strips are painted in.',
      },
    },
  },
} satisfies Meta<typeof ExerciseLevelTag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The three, in teaching order. */
export const EveryLevel: Story = {
  render: (args) => (
    <div style={ROW_STYLE}>
      {LEVEL_ORDER.map((level) => (
        <ExerciseLevelTag key={level} level={level} active={args.active} />
      ))}
    </div>
  ),
};

/** The selected filter is filled in rather than minimal. */
export const Selected: Story = {
  args: { active: true },
};

/**
 * As the filter row of an exercise list: a level that is switched off keeps its
 * own colour, because it is still that level — dropping it to grey would say
 * the difficulty had changed.
 */
export const AsFilters: Story = {
  render: () => <LevelFilters />,
};

/** A course that names its levels rather than numbering them. */
export const RenamedForTheCourse: Story = {
  render: () => (
    <div style={ROW_STYLE}>
      <ExerciseLevelTag level="beginner" label="First year" />
      <ExerciseLevelTag level="intermediate" label="Second year" />
      <ExerciseLevelTag level="advanced" label="Master" />
    </div>
  ),
};

/**
 * The row as a list owns it: one level is selected, and clicking another moves
 * the selection.
 * @returns The three tags, clickable.
 */
function LevelFilters(): ReactElement {
  const [selected, setSelected] = useState<ExerciseLevel>('intermediate');

  return (
    <div style={ROW_STYLE}>
      {LEVEL_ORDER.map((level) => (
        <ExerciseLevelTag
          key={level}
          level={level}
          active={level === selected}
          onClick={() => {
            setSelected(level);
          }}
        />
      ))}
    </div>
  );
}

const ROW_STYLE: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: 6,
};
