import { InputGroup, Tag } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { useDebouncedValue } from '../src/hooks/ui/useDebouncedValue.ts';

/** What the harness lets the toolbar change about the hook. */
interface DebouncedValueDemoProps {
  /** Quiet period, in milliseconds, before the value settles. */
  delayMs: number;
}

function DebouncedValueDemo(props: DebouncedValueDemoProps): ReactElement {
  const { delayMs } = props;
  const [formula, setFormula] = useState('C8H10N4O2');
  const settled = useDebouncedValue(formula, delayMs);
  const isSettled = settled === formula;

  return (
    <div style={STACK_STYLE}>
      <InputGroup
        value={formula}
        placeholder="Type a molecular formula"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        onValueChange={setFormula}
      />
      <div style={ROW_STYLE}>
        <span style={NAME_STYLE}>Live value</span>
        <code style={VALUE_STYLE}>{formula === '' ? '—' : formula}</code>
      </div>
      <div style={ROW_STYLE}>
        <span style={NAME_STYLE}>{`After ${delayMs} ms of quiet`}</span>
        <code style={VALUE_STYLE}>{settled === '' ? '—' : settled}</code>
        <Tag minimal intent={isSettled ? 'success' : 'warning'}>
          {isSettled ? 'settled' : 'waiting'}
        </Tag>
      </div>
      <p style={NOTE_STYLE}>
        The search the site would fire runs on the second line, not on the
        first, so typing a formula costs one request instead of nine.
      </p>
    </div>
  );
}

const meta = {
  title: 'Hooks/useDebouncedValue',
  component: DebouncedValueDemo,
  args: { delayMs: 250 },
  argTypes: {
    delayMs: { control: { type: 'range', min: 0, max: 2000, step: 50 } },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A debounced echo of a fast-changing value: it only catches up once the source has been still, so the request or the redraw downstream runs when the user pauses.',
      },
    },
  },
} satisfies Meta<typeof DebouncedValueDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A long quiet period, as an expensive search over a database would want. */
export const Slow: Story = {
  args: { delayMs: 1500 },
};

/** No quiet period at all: the echo lands on the next tick, one render behind. */
export const NoDelay: Story = {
  args: { delayMs: 0 },
};

const STACK_STYLE = {
  display: 'flex',
  width: 'min(30rem, 92vw)',
  flexDirection: 'column',
  gap: 8,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
} as const satisfies CSSProperties;

const NAME_STYLE = {
  flex: '0 0 11rem',
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;

const VALUE_STYLE = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 13,
  overflowWrap: 'anywhere',
} as const satisfies CSSProperties;

const NOTE_STYLE = {
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;
