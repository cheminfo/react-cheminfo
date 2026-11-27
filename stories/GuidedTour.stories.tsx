import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { GuidedTour } from '../src/tour/ui/GuidedTour.tsx';

const BENCH: CSSProperties = {
  display: 'flex',
  height: 360,
  alignItems: 'center',
  justifyContent: 'space-around',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
};

const PIECE: CSSProperties = {
  padding: '10px 16px',
  border: '1px solid var(--border-strong)',
  borderRadius: 8,
  background: 'var(--surface-sunken)',
  cursor: 'pointer',
};

/**
 * A bench of two controls and the tour over it: close the switch, then run
 * the clock, then read the plates.
 * @param props - Whether the plates are drawn.
 * @param props.plates - Whether the last step's target is on the page.
 * @returns The bench and its tour.
 */
function Bench(props: { plates: boolean }): ReactElement {
  const [closed, setClosed] = useState(false);
  const [hours, setHours] = useState(0);
  const [open, setOpen] = useState(true);
  return (
    <div style={BENCH}>
      <button
        type="button"
        style={PIECE}
        data-piece="switch"
        onClick={() => setClosed((before) => !before)}
      >
        Switch: {closed ? 'closed' : 'open'}
      </button>
      <button
        type="button"
        style={PIECE}
        data-piece="clock"
        onClick={() => setHours((before) => before + 100)}
      >
        Run +100 h ({hours} h)
      </button>
      {props.plates ? (
        <span style={PIECE} data-piece="plates">
          Zn −0.35 g · Cu +0.34 g
        </span>
      ) : null}
      {open ? (
        <GuidedTour
          steps={[
            {
              id: 'switch',
              target: '[data-piece="switch"]',
              title: 'Close the switch',
              body: 'A current flows, and the electrons appear in the wires.',
              done: closed,
            },
            {
              id: 'clock',
              target: '[data-piece="clock"]',
              title: 'Run the clock for 100 h',
              body: 'Deposits are micrometres thin: they need time to show.',
              placement: 'top',
              done: hours >= 100,
            },
            {
              id: 'plates',
              target: '[data-piece="plates"]',
              title: 'Compare the plates',
              body: 'The zinc lost mass, the copper gained it.',
              placement: 'right',
            },
          ]}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

const meta = {
  title: 'Tour/GuidedTour',
  component: Bench,
  parameters: {
    docs: {
      description: {
        component:
          'A card beside what to do next, and a ring round it. Nothing is dimmed or blocked: the visitor does the step on the page, and the tour moves on when it is done.',
      },
    },
  },
} satisfies Meta<typeof Bench>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { plates: true } };

/** The last step's target is not drawn, so its card waits in the corner. */
export const Waiting: Story = { args: { plates: false } };
