import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { emptyAttempt } from '../src/pedagogy/core/attempts.ts';
import { ExerciseSeries } from '../src/pedagogy/ui/ExerciseSeries.tsx';

import type { Ion } from './seriesFixtures.tsx';
import {
  ELECTRONS,
  ionLabel,
  ionPrompt,
  storyStore,
} from './seriesFixtures.tsx';

import '../styles/chrome.css';

const STORE = storyStore({
  'electrons/42/Cl-': { ...emptyAttempt(), status: 'solved' },
  'electrons/42/Mg(2+)': { ...emptyAttempt(), status: 'attempted' },
});

/**
 * The series with the address it reads kept in the story's own state, as a
 * page keeps it in its router.
 * @param props - The width the series is shown at, and the narrowest row split.
 * @param props.width - The width of the box the series is drawn in.
 * @param props.stackBelow - The narrowest row still divided.
 * @returns The series.
 */
function SeriesOnAPage(props: { width: string; stackBelow?: number }) {
  const { width, stackBelow } = props;
  const [seed, setSeed] = useState<number | null>(42);
  const [count, setCount] = useState(5);
  const [split, setSplit] = useState<number | null>(null);
  return (
    <div style={{ width }}>
      <ExerciseSeries<Ion>
        tool={ELECTRONS}
        store={STORE}
        label={ionLabel}
        prompt={ionPrompt}
        seed={seed}
        onSeed={setSeed}
        count={count}
        onCount={setCount}
        split={split}
        onSplit={setSplit}
        stackBelow={stackBelow}
      />
    </div>
  );
}

const meta = {
  title: 'Pedagogy/ExerciseSeries',
  component: SeriesOnAPage,
  args: { width: 'min(64rem, 96vw)' },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A graded series drawn by a seed: the list of its questions beside the open one, and the progress over the series. The page hands it the seed, the length and the share of the row, all from its address.',
      },
    },
  },
} satisfies Meta<typeof SeriesOnAPage>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A laptop row: the list narrow, the card holding the room. */
export const Default: Story = {};

/** A phone held upright: under 700 px the list stacks over the card. */
export const Narrow: Story = {
  args: { width: '390px', stackBelow: 700 },
};
