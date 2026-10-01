import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { NumberInputProps } from '../src/number/ui/NumberInput.tsx';
import { NumberInput } from '../src/number/ui/NumberInput.tsx';

function NumberInputDemo(props: NumberInputProps): ReactElement {
  const [value, setValue] = useState<number | undefined>(props.value);

  return (
    <div style={STACK_STYLE}>
      <NumberInput
        {...props}
        allowEmpty
        value={value}
        onChange={(next) => setValue(next)}
      />
      <code style={TEXT_STYLE} data-testid="held">
        {value === undefined ? 'nothing' : String(value)}
      </code>
    </div>
  );
}

function noop(): void {
  // The line under the box is what a page would do with the number.
}

const meta = {
  title: 'Number/NumberInput',
  component: NumberInput,
  args: {
    value: 0.1,
    step: 0.01,
    min: 0,
    ariaLabel: 'Concentration',
    onChange: noop,
  },
  argTypes: {
    value: { control: 'number' },
    step: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    integer: { control: 'boolean' },
    buttons: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A number typed a keystroke at a time: the box keeps the text, the page keeps the number, and the bounds wait until the box is left.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 200 }}>
      <NumberInputDemo {...args} />
    </div>
  ),
} satisfies Meta<typeof NumberInput>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A concentration in mol/L, where `0.2` has to survive being typed. */
export const Default: Story = {};

/** A count of points, where a typed decimal is rounded when the box is left. */
export const WholeNumbers: Story = {
  args: { value: 200, min: 10, max: 2000, step: 50, integer: true },
};

/** A box in a table, where the buttons would not fit. */
export const NoButtons: Story = {
  args: { value: -1.5, min: -5, max: 5, step: 0.1, buttons: false },
};

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} as const satisfies CSSProperties;

const TEXT_STYLE = {
  fontSize: 12,
} as const satisfies CSSProperties;
