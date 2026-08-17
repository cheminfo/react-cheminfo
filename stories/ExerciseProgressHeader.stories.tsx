import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

import { ExerciseProgressHeader } from '../src/pedagogy/ui/ExerciseProgressHeader.tsx';

import {
  COMPLETE_PROGRESS,
  FRESH_PROGRESS,
  PARTIAL_PROGRESS,
} from './pedagogyFixtures.ts';

/** Wiping is what this button does; a story has nothing to wipe. */
function noop(): void {
  // The dialog is the point, not what confirming it would throw away.
}

const inACard: Decorator = (Story) => (
  <div style={{ width: 'min(34rem, 90vw)' }}>
    <Story />
  </div>
);

const meta = {
  title: 'Pedagogy/ExerciseProgressHeader',
  component: ExerciseProgressHeader,
  decorators: [inACard],
  args: { summary: PARTIAL_PROGRESS, onClearAll: noop },
  argTypes: {
    clearLabel: { control: 'text' },
    clearDisabled: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'How much of a set is solved, its bar, and the one way to throw the work away — behind a real dialog, because the button costs somebody a week.',
      },
    },
  },
} satisfies Meta<typeof ExerciseProgressHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Four of twelve solved, with the wipe offered. */
export const Default: Story = {};

/** No `onClearAll`: the header reports, and the work cannot be lost from here. */
export const ReportOnly: Story = {
  render: (args) => <ExerciseProgressHeader summary={args.summary} />,
};

/**
 * The dialog the button opens, clicked open on load: a native `confirm()` is
 * unstyled and dismissed by reflex, which is why this one is a real alert.
 */
export const ConfirmationOpen: Story = {
  play: ({ canvasElement }) => {
    canvasElement.querySelector('button')?.click();
  },
};

/** Nothing stored yet, so the wipe is dead rather than merely useless. */
export const NothingSolvedYet: Story = {
  args: { summary: FRESH_PROGRESS, clearDisabled: true },
};

/** A finished set is the one thing that turns the bar green. */
export const Finished: Story = {
  args: { summary: COMPLETE_PROGRESS },
};

/** Both words belong to the course, not to the component. */
export const RenamedForTheCourse: Story = {
  args: {
    clearLabel: 'Start the series over',
    clearWarning:
      'Every answer, hint and solved exercise of this series is forgotten on this browser. There is no undo.',
  },
};
