import { Tag } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import type { ExerciseListEntry } from '../src/pedagogy/ui/ExerciseList.tsx';
import { ExerciseList } from '../src/pedagogy/ui/ExerciseList.tsx';

import '../styles/chrome.css';

interface DbeExercise extends ExerciseListEntry {
  kind: 'Formula' | 'Structure';
}

const EXERCISES: readonly DbeExercise[] = [
  {
    id: 'mf-ethanol',
    title: 'Ethanol, from its formula',
    level: 'beginner',
    kind: 'Formula',
  },
  {
    id: 'st-benzene',
    title: 'Benzene, from its drawing',
    level: 'beginner',
    kind: 'Structure',
  },
  {
    id: 'mf-pyridine',
    title: 'Pyridine, nitrogen in the ring',
    level: 'intermediate',
    kind: 'Formula',
  },
  {
    id: 'mf-chloro',
    title: 'Chlorobenzene, a halogen counted like hydrogen',
    level: 'intermediate',
    kind: 'Formula',
  },
  {
    id: 'mf-dmso',
    title: 'Dimethyl sulfoxide, sulfur at valence IV',
    level: 'advanced',
    kind: 'Formula',
  },
];

const PROGRESS = {
  'mf-ethanol': { status: 'solved' as const, hintsRevealed: 0 },
  'st-benzene': { status: 'solved' as const, hintsRevealed: 2 },
  'mf-pyridine': { status: 'attempted' as const, hintsRevealed: 1 },
};

/**
 * The list with the open exercise kept in the story's state.
 * @returns The list.
 */
function ListOnAPage() {
  const [activeId, setActiveId] = useState<string | null>('mf-pyridine');
  return (
    <div style={{ width: 'min(26rem, 92vw)' }}>
      <ExerciseList
        exercises={EXERCISES}
        progress={PROGRESS}
        activeId={activeId}
        onSelect={setActiveId}
        onClearAll={() => undefined}
        tags={(exercise) => (
          <Tag minimal round>
            {exercise.kind}
          </Tag>
        )}
      />
    </div>
  );
}

const meta = {
  title: 'Pedagogy/ExerciseList',
  component: ListOnAPage,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The exercises of a set under the bar of how many are solved, each with its status, level and the hints a solved one took. The arrow keys walk it from anywhere on the page.',
      },
    },
  },
} satisfies Meta<typeof ListOnAPage>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Two solved, one handed in, the open one tinted. */
export const Default: Story = {};
