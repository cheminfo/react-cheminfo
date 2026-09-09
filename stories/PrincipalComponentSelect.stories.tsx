import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type {
  PrincipalComponentSelection,
  PrincipalComponentSettings,
} from '../src/spectra/core/principalComponents.ts';
import type { PrincipalComponentSelectProps } from '../src/spectra/ui/PrincipalComponentSelect.tsx';
import { PrincipalComponentSelect } from '../src/spectra/ui/PrincipalComponentSelect.tsx';

import { EXPLAINED_VARIANCE } from './spectraFixtures.ts';

function PrincipalComponentSelectDemo(
  props: PrincipalComponentSelectProps,
): ReactElement {
  const [selection, setSelection] = useState<PrincipalComponentSelection>(
    props.value,
  );
  const [reported, setReported] = useState<
    PrincipalComponentSelection | undefined
  >(undefined);
  const [settings, setSettings] = useState<PrincipalComponentSettings>(
    props.settings ?? {},
  );

  return (
    <div style={STACK_STYLE}>
      <PrincipalComponentSelect
        {...props}
        value={selection}
        settings={props.onSettingsChange === undefined ? undefined : settings}
        onChange={(next) => {
          setSelection(next);
          setReported(next);
          props.onChange(next);
        }}
        onSettingsChange={
          props.onSettingsChange === undefined ? undefined : setSettings
        }
      />
      <code style={CALLBACK_STYLE}>
        {reported === undefined
          ? 'Pick an axis to see what the callback receives.'
          : `onChange({ x: ${String(reported.x)}, y: ${String(reported.y)} })`}
      </code>
    </div>
  );
}

function noop(): void {
  // The line under the picker is what a page would read; the story has nothing
  // else to tell.
}

const meta = {
  title: 'Spectra/PrincipalComponentSelect',
  component: PrincipalComponentSelect,
  args: {
    value: { x: 0, y: 1 },
    count: 6,
    explainedVariance: EXPLAINED_VARIANCE,
    onChange: noop,
  },
  argTypes: { count: { control: { type: 'range', min: 1, max: 8, step: 1 } } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Which two components a score plot is drawn against. The labels read PC1 because that is what a chemist writes; the numbers handed back are zero-based columns of the score matrix, because that is what indexes it — the line below is exactly what the callback receives.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 'min(32rem, 92vw)' }}>
      <PrincipalComponentSelectDemo key={String(args.count)} {...args} />
    </div>
  ),
} satisfies Meta<typeof PrincipalComponentSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Six components, each named with the share of the variance it carries. */
export const Default: Story = {};

/** No decomposition to read from, so the components are named and nothing more. */
export const WithoutVariance: Story = {
  args: { explainedVariance: undefined },
};

/** The decomposition's own options, offered under the two axes. */
export const WithTheDecomposition: Story = {
  args: { settings: { method: 'SVD', center: true }, onSettingsChange: noop },
};

/**
 * Two spectra give two components, and the picker cannot be made to ask for a
 * third. Drag the count down to one and both axes fall onto it.
 */
export const OnlyTwoComponents: Story = {
  args: { count: 2, value: { x: 3, y: 5 } },
};

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
} as const satisfies CSSProperties;

const CALLBACK_STYLE = {
  fontSize: 12,
  color: 'var(--text-muted, #5b6875)',
} as const satisfies CSSProperties;
