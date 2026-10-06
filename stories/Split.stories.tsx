import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import { SplitColumn } from '../src/split/ui/SplitColumn.tsx';
import { SplitRow } from '../src/split/ui/SplitRow.tsx';

/**
 * One pane, drawn so the bar between two of them can be measured against what
 * it divides.
 * @param props - The pane.
 * @param props.title - What this half holds.
 * @param props.children - The figure.
 * @returns The pane.
 */
function Pane(props: { title: string; children: ReactNode }): ReactElement {
  return (
    <div style={PANE_STYLE}>
      <strong>{props.title}</strong>
      <span style={{ color: 'var(--text-muted)' }}>{props.children}</span>
    </div>
  );
}

/**
 * A row, divided across.
 * @returns The two panes and the bar between them.
 */
function RowDemo(): ReactElement {
  const [ratio, setRatio] = useState<number | null>(null);

  return (
    <div style={{ height: 320 }}>
      <SplitRow
        ratio={ratio}
        defaultRatio={40}
        onRatio={setRatio}
        start={<Pane title="The picker">541 compounds</Pane>}
        end={<Pane title="The figure">what the picker chose</Pane>}
      />
    </div>
  );
}

/**
 * A column, divided down.
 * @returns The two panes and the bar between them.
 */
function ColumnDemo(): ReactElement {
  const [ratio, setRatio] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', height: 560, flexDirection: 'column' }}>
      <SplitColumn
        ratio={ratio}
        defaultRatio={45}
        onRatio={setRatio}
        start={<Pane title="The query">four lines of it</Pane>}
        end={<Pane title="What it printed">three hundred rows</Pane>}
      />
    </div>
  );
}

const meta = {
  title: 'Split/SplitPanes',
  component: RowDemo,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Two figures with a bar between them, and the share each takes written into the address.',
      },
    },
  },
} satisfies Meta<typeof RowDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Divided across: the bar is a column of pixels between the two figures. */
export const Across: Story = {};

/**
 * Divided down: the same bar turned a quarter, so it runs the width of the
 * pane and it is its height that is seven pixels.
 */
export const Down: Story = { render: () => <ColumnDemo /> };

const PANE_STYLE = {
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
  minWidth: 0,
  minHeight: 0,
  padding: '0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  gap: '0.25rem',
} as const;
