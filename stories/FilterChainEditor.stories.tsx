import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { useState } from 'react';

import type { SpectrumFilter } from '../src/spectra/core/settings.ts';
import type { FilterChainEditorProps } from '../src/spectra/ui/FilterChainEditor.tsx';
import { FilterChainEditor } from '../src/spectra/ui/FilterChainEditor.tsx';

import { IR_CHAIN, MUDDLED_CHAIN, SNV_CHAIN } from './spectraFixtures.ts';

function FilterChainEditorDemo(props: FilterChainEditorProps): ReactElement {
  const [chain, setChain] = useState<readonly SpectrumFilter[]>(props.value);

  return (
    <FilterChainEditor
      {...props}
      value={chain}
      onChange={(next) => {
        setChain(next);
        props.onChange(next);
      }}
    />
  );
}

function noop(): void {
  // The chain is the story; a page would send it to setNormalization.
}

const meta = {
  title: 'Spectra/FilterChainEditor',
  component: FilterChainEditor,
  args: { value: IR_CHAIN, onChange: noop },
  argTypes: { resampleFirst: { control: 'boolean' } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The ordered pipeline every spectrum goes through, one step at a time. The order is the meaning: scaling measured before a baseline is levelled measures an offset that is about to change, and the editor says so.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 'min(46rem, 94vw)' }}>
      <FilterChainEditorDemo key={String(args.resampleFirst)} {...args} />
    </div>
  ),
} satisfies Meta<typeof FilterChainEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A worked-up infrared run: level the baseline, smooth, normalize to 100. */
export const Default: Story = {};

/** Standard normal variate, the two steps that carry most near-infrared work. */
export const StandardNormalVariate: Story = { args: { value: SNV_CHAIN } };

/** Nothing yet — the spectra are only put on a common grid. */
export const Empty: Story = { args: { value: [] } };

/**
 * The same three steps in the wrong order. Scaling runs before the baseline it
 * depends on, and a step that does nothing sits at the end; move the first one
 * down with its arrow and the advice goes away.
 */
export const AdviceOnTheOrder: Story = { args: { value: MUDDLED_CHAIN } };

/**
 * Resampling first. Every range in the chain is then read on the new grid, and
 * a crop here would leave the spectra on grids that no longer line up.
 */
export const ResampleFirst: Story = {
  args: { value: IR_CHAIN, resampleFirst: true },
};
