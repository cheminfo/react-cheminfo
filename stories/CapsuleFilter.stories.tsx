import type { Intent } from '@blueprintjs/core';
import { Tag } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type {
  CapsuleFilterProps,
  CapsuleOption,
} from '../src/capsule/ui/CapsuleFilter.tsx';
import { CapsuleFilter } from '../src/capsule/ui/CapsuleFilter.tsx';

/** One structure of the import, and how the check went for it. */
interface CheckedStructure {
  name: string;
  formula: string;
  outcome: 'valid' | 'warning' | 'failed';
  note: string;
}

// What the standardisation of an SDF import reported, and the first rows behind
// each outcome.
const SAMPLE: readonly CheckedStructure[] = [
  {
    name: 'Caffeine',
    formula: 'C8H10N4O2',
    outcome: 'valid',
    note: 'Standardised, InChIKey computed',
  },
  {
    name: 'Aspirin',
    formula: 'C9H8O4',
    outcome: 'valid',
    note: 'Standardised, InChIKey computed',
  },
  {
    name: 'Glucose',
    formula: 'C6H12O6',
    outcome: 'warning',
    note: 'Anomeric centre left undefined',
  },
  {
    name: 'Cholesterol',
    formula: 'C27H46O',
    outcome: 'warning',
    note: '2 stereocentres could not be assigned',
  },
  {
    name: 'Ferrocene',
    formula: 'C10H10Fe',
    outcome: 'failed',
    note: 'Sandwich bond not expressible as a valence bond',
  },
  {
    name: 'Entry 8 812',
    formula: '—',
    outcome: 'failed',
    note: 'Molfile counts line is malformed',
  },
];

const OPTIONS: readonly CapsuleOption[] = [
  { value: 'all', label: 'All', count: 12_480 },
  {
    value: 'valid',
    label: 'Valid',
    count: 11_204,
    intent: 'success',
    title: 'Standardised without a remark',
  },
  {
    value: 'warning',
    label: 'Warnings',
    count: 863,
    intent: 'warning',
    title: 'Imported, but something had to be guessed',
  },
  {
    value: 'failed',
    label: 'Failed',
    count: 413,
    intent: 'danger',
    title: 'Not imported at all',
  },
];

const UNCOUNTED_OPTIONS: readonly CapsuleOption[] = [
  { value: 'all', label: 'All' },
  { value: 'valid', label: 'Valid', intent: 'success' },
  { value: 'warning', label: 'Warnings', intent: 'warning' },
  { value: 'failed', label: 'Failed', intent: 'danger' },
];

const COMPACT = new Intl.NumberFormat('en', { notation: 'compact' });

const OUTCOME_INTENT: Record<CheckedStructure['outcome'], Intent> = {
  valid: 'success',
  warning: 'warning',
  failed: 'danger',
};

function CapsuleFilterDemo(props: CapsuleFilterProps): ReactElement {
  const [value, setValue] = useState(props.value);
  const rows =
    value === 'all' ? SAMPLE : SAMPLE.filter((row) => row.outcome === value);

  return (
    <div style={STACK_STYLE}>
      <CapsuleFilter
        {...props}
        value={value}
        onChange={(next) => {
          setValue(next);
          props.onChange(next);
        }}
      />
      <div style={TABLE_STYLE}>
        {rows.map((row) => (
          <div key={row.name} style={ROW_STYLE}>
            <Tag minimal intent={OUTCOME_INTENT[row.outcome]}>
              {row.outcome}
            </Tag>
            <span style={NAME_STYLE}>{row.name}</span>
            <code style={FORMULA_STYLE}>{row.formula}</code>
            <span style={NOTE_STYLE}>{row.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function noop(): void {
  // The row below the capsules is what a page would re-render; a story has
  // nothing else to tell.
}

const meta = {
  title: 'Capsule/CapsuleFilter',
  component: CapsuleFilter,
  args: { options: OPTIONS, value: 'all', onChange: noop, label: 'Outcome' },
  argTypes: {
    value: {
      control: 'select',
      options: OPTIONS.map((option) => option.value),
    },
    label: { control: 'text' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The row of capsules that narrows a table to one outcome, each keeping the colour of what it means whether or not it is the selected one.',
      },
    },
  },
  // The demo owns the selection, so the capsules actually move; the `value`
  // control names the one the story opens on.
  render: (args) => <CapsuleFilterDemo key={args.value} {...args} />,
} satisfies Meta<typeof CapsuleFilter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Opening on one outcome, which is what a link into a filtered table does. */
export const PreSelected: Story = {
  args: { value: 'failed' },
};

/** Counts left out, for a filter whose totals are not known up front. */
export const WithoutCounts: Story = {
  args: { options: UNCOUNTED_OPTIONS },
};

/** A count written compactly, for a row that has to survive a narrow panel. */
export const CompactCounts: Story = {
  args: { formatCount: (count) => COMPACT.format(count) },
};

const STACK_STYLE = {
  display: 'flex',
  width: 'min(46rem, 92vw)',
  flexDirection: 'column',
  gap: 12,
} as const satisfies CSSProperties;

const TABLE_STYLE = {
  display: 'flex',
  minHeight: 40,
  flexDirection: 'column',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  gap: 4,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
} as const satisfies CSSProperties;

const NAME_STYLE = {
  flex: '0 0 8rem',
  fontWeight: 600,
  fontSize: 13,
} as const satisfies CSSProperties;

const FORMULA_STYLE = {
  flex: '0 0 8rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 13,
} as const satisfies CSSProperties;

const NOTE_STYLE = {
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;
