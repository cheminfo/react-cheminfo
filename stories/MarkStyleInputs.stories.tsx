import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import {
  MarkOpacityInput,
  MarkSizeInput,
} from '../src/drawing/ui/MarkStyleInputs.tsx';

/**
 * An outline's width and its opacity, as every panel of a drawing writes
 * them: the size in pixels of the image, the opacity typed as a percentage
 * while the drawing keeps the fraction.
 * @returns The two boxes, with the values the drawing would store.
 */
function MarkStyleDemo(): ReactElement {
  const [width, setWidth] = useState(1.5);
  const [opacity, setOpacity] = useState(0.6);

  return (
    <div style={STACK_STYLE}>
      <MarkSizeInput
        value={width}
        ariaLabel="Width"
        testId="width"
        onChange={setWidth}
      />
      <MarkOpacityInput
        value={opacity}
        ariaLabel="Opacity"
        testId="opacity"
        onChange={setOpacity}
      />
      <code style={{ fontSize: 12 }} data-testid="stored">
        {`width ${width}, opacity ${opacity}`}
      </code>
    </div>
  );
}

const meta = {
  title: 'Drawing/MarkStyleInputs',
  component: MarkStyleDemo,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "A mark's size and opacity, typed the one way every panel of a drawing types them.",
      },
    },
  },
} satisfies Meta<typeof MarkStyleDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A stroke 1.5 px wide at 60 %: the drawing stores 1.5 and 0.6. */
export const Default: Story = {};

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: 160,
} as const satisfies CSSProperties;
