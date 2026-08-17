import { Tag } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { useListKeyboardNavigation } from '../src/hooks/ui/useListKeyboardNavigation.ts';

import { MOLECULES } from './moleculeFixtures.ts';

// What the list answers to, spelled out so the story can be tried without
// reading the source.
const KEYS = [
  { key: '↑ ↓', does: 'one entry' },
  { key: 'PageUp / PageDown', does: 'a page' },
  { key: 'Home / End', does: 'the ends' },
];

/** What the harness lets the toolbar change about the hook. */
interface ListNavigationDemoProps {
  /**
   * How many entries `PageUp` and `PageDown` move by. Left out, a page is ten
   * entries — the whole of this list.
   */
  pageStep?: number;
}

function ListNavigationDemo(props: ListNavigationDemoProps): ReactElement {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const onKeyDown = useListKeyboardNavigation({
    length: MOLECULES.length,
    selectedIndex,
    onSelect: setSelectedIndex,
    pageStep: props.pageStep,
  });
  const selected = MOLECULES[selectedIndex];

  return (
    <div style={STACK_STYLE}>
      <div style={LEGEND_STYLE}>
        {KEYS.map((entry) => (
          <span key={entry.key} style={LEGEND_ENTRY_STYLE}>
            <Tag minimal>{entry.key}</Tag>
            {entry.does}
          </span>
        ))}
      </div>
      <div
        role="listbox"
        tabIndex={0}
        aria-label="Molecules"
        aria-activedescendant={`molecule-${selectedIndex}`}
        style={LIST_STYLE}
        onKeyDown={onKeyDown}
      >
        {MOLECULES.map((molecule, index) => (
          <div
            key={molecule.name}
            id={`molecule-${index}`}
            role="option"
            aria-selected={index === selectedIndex}
            style={index === selectedIndex ? SELECTED_ROW_STYLE : ROW_STYLE}
          >
            <span style={NAME_STYLE}>{molecule.name}</span>
            <code style={FORMULA_STYLE}>{molecule.formula}</code>
            <span style={MASS_STYLE}>{molecule.mass.toFixed(4)}</span>
          </div>
        ))}
      </div>
      <p style={NOTE_STYLE}>
        {selected === undefined
          ? 'Nothing is selected.'
          : `Click the list to focus it, then walk it: ${selected.name} is entry ${selectedIndex + 1} of ${MOLECULES.length}.`}
      </p>
    </div>
  );
}

const meta = {
  title: 'Hooks/useListKeyboardNavigation',
  component: ListNavigationDemo,
  args: { pageStep: 4 },
  argTypes: {
    pageStep: { control: { type: 'range', min: 1, max: 10, step: 1 } },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Keyboard navigation for a list whose selection lives outside it: the handler goes on the focusable container, and the selection stays wherever the page already keeps it.',
      },
    },
  },
} satisfies Meta<typeof ListNavigationDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A page of four entries, so `PageDown` and `End` are visibly different. */
export const Default: Story = {};

/** The default page of ten, which on a ten-row list is the whole of it. */
export const DefaultPageStep: Story = {
  args: { pageStep: undefined },
};

const STACK_STYLE = {
  display: 'flex',
  width: 'min(32rem, 92vw)',
  flexDirection: 'column',
  gap: 8,
} as const satisfies CSSProperties;

const LEGEND_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12,
} as const satisfies CSSProperties;

const LEGEND_ENTRY_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  color: 'var(--text-muted)',
  fontSize: 13,
  gap: 4,
} as const satisfies CSSProperties;

const LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  padding: 4,
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  gap: 2,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  alignItems: 'baseline',
  padding: '4px 8px',
  borderRadius: 6,
  gap: 8,
} as const satisfies CSSProperties;

const SELECTED_ROW_STYLE = {
  ...ROW_STYLE,
  background: 'color-mix(in oklab, var(--accent) 12%, white)',
  color: 'var(--accent)',
  fontWeight: 600,
} as const satisfies CSSProperties;

const NAME_STYLE = { flex: '0 0 9rem' } as const satisfies CSSProperties;

const FORMULA_STYLE = {
  flex: '0 0 7rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 13,
} as const satisfies CSSProperties;

const MASS_STYLE = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 13,
} as const satisfies CSSProperties;

const NOTE_STYLE = {
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;
