import type { Meta, StoryObj } from '@storybook/react-vite';

import { emptyAttempt } from '../src/pedagogy/core/attempts.ts';
import { QuestionCard } from '../src/pedagogy/ui/QuestionCard.tsx';

import type { Ion } from './seriesFixtures.tsx';
import { ELECTRONS, ionPrompt, storyStore } from './seriesFixtures.tsx';

import '../styles/chrome.css';

const IRON = ELECTRONS.pool[2] as Ion;
const KEY = 'electrons/42/Fe(3+)';

const meta = {
  title: 'Pedagogy/QuestionCard',
  component: QuestionCard<Ion>,
  args: {
    tool: ELECTRONS,
    question: IRON,
    store: storyStore(),
    storageKey: KEY,
    number: 3,
    total: 10,
    prompt: ionPrompt,
    onNext: () => undefined,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(40rem, 92vw)' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One question of a graded series: the statement, the boxes, the four actions, and — once checked — the verdict case by case.',
      },
    },
  },
} satisfies Meta<typeof QuestionCard<Ion>>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Nothing typed yet, so Check is dead. */
export const Default: Story = {};

/** A wrong answer, checked: the verdict says what came back. */
export const CheckedWrong: Story = {
  args: {
    store: storyStore({
      [KEY]: {
        ...emptyAttempt(),
        status: 'attempted',
        answers: { electrons: '26' },
        checked: JSON.stringify({ electrons: '26' }),
      },
    }),
  },
};

/** Right, after two hints: the hints stay open under the verdict. */
export const SolvedWithHints: Story = {
  args: {
    store: storyStore({
      [KEY]: {
        ...emptyAttempt(),
        status: 'solved',
        answers: { electrons: '23' },
        checked: JSON.stringify({ electrons: '23' }),
        hintsRevealed: 2,
      },
    }),
  },
};

/** The solution asked for, which is always one click away. */
export const SolutionShowing: Story = {
  args: {
    store: storyStore({ [KEY]: { ...emptyAttempt(), showSolution: true } }),
  },
};
