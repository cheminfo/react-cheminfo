import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { useState } from 'react';

import type { ResultPagerProps } from '../src/pager/ui/ResultPager.tsx';
import { ResultPager } from '../src/pager/ui/ResultPager.tsx';

import '../styles/chrome.css';

/**
 * A pager that moves through its own pages.
 * @param props - The props the story sets.
 * @returns The pager.
 */
function ResultPagerDemo(
  props: Omit<ResultPagerProps, 'offset' | 'onOffsetChange'>,
): ReactElement {
  const [offset, setOffset] = useState(0);
  return (
    <div style={{ width: 'min(40rem, 92vw)' }}>
      <ResultPager {...props} offset={offset} onOffsetChange={setOffset} />
    </div>
  );
}

const meta = {
  title: 'Pager/ResultPager',
  component: ResultPagerDemo,
  args: { total: 1234, limit: 50, noun: 'ligands' },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The pager under a table of results: which of them are on screen, and the steps to the first, previous, next and last page.',
      },
    },
  },
} satisfies Meta<typeof ResultPagerDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The narrow form, previous and next around the page number. */
export const Compact: Story = {
  args: { compact: true, total: 120, limit: 10 },
};

/** Nothing matched. */
export const Empty: Story = {
  args: { total: 0 },
};
