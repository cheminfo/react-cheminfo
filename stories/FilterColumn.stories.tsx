import { Checkbox } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { useState } from 'react';

import type { FilterColumnProps } from '../src/filter/ui/FilterColumn.tsx';
import { FilterColumn } from '../src/filter/ui/FilterColumn.tsx';

import '../styles/chrome.css';

const SOURCES = ['ChEBI', 'COCONUT', 'LOTUS', 'PubChem'] as const;

/**
 * A column of two sections whose checkboxes Clear takes away.
 * @param props - The props the story sets.
 * @returns The column.
 */
function FilterColumnDemo(
  props: Omit<FilterColumnProps, 'canClear' | 'onClear' | 'children'>,
): ReactElement {
  const [ticked, setTicked] = useState<readonly string[]>(['LOTUS']);
  return (
    <div style={{ width: 280 }}>
      <FilterColumn
        {...props}
        canClear={ticked.length > 0}
        onClear={() => setTicked([])}
      >
        <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
          <legend className="filter-column__legend">Sources</legend>
          {SOURCES.map((source) => (
            <Checkbox
              key={source}
              label={source}
              checked={ticked.includes(source)}
              onChange={() =>
                setTicked(
                  ticked.includes(source)
                    ? ticked.filter((name) => name !== source)
                    : [...ticked, source],
                )
              }
            />
          ))}
        </fieldset>
        <div className="filter-column__ranges">
          <span className="filter-column__legend">Molecular weight</span>
          <span>100–500 g/mol</span>
        </div>
      </FilterColumn>
    </div>
  );
}

const meta = {
  title: 'Filter/FilterColumn',
  component: FilterColumnDemo,
  args: {},
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Every filter of a search in one column beside the results: a heading, Clear, and the fold a narrow window hides the filters behind.',
      },
    },
  },
} satisfies Meta<typeof FilterColumnDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The count of the filters in force, said after the title. */
export const WithCount: Story = {
  args: { count: 2 },
};

/** Newer counts on their way: what they will change is dimmed. */
export const Loading: Story = {
  args: { loading: true },
};
