import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { EmptyGuide, EmptyGuideSection } from '../src/guide/ui/EmptyGuide.tsx';
import { ShortcutList } from '../src/guide/ui/ShortcutList.tsx';

const VIEW: CSSProperties = {
  position: 'relative',
  height: 420,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
};

const FLASK = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="26" r="12" fill="#2f8fd6"/><rect x="17" y="2" width="6" height="14" fill="#2f8fd6"/></svg>',
)}`;

const meta = {
  title: 'Guide/EmptyGuide',
  component: EmptyGuide,
  decorators: [
    (Story) => (
      <div style={VIEW}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'What a tool shows while it holds nothing: help that stays, a hint that changes, and faint pictures of what the tool can make. The pointer goes through it, and the site stops rendering it at the first stroke.',
      },
    },
  },
} satisfies Meta<typeof EmptyGuide>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    help: (
      <>
        <EmptyGuideSection title="Draw">
          <ShortcutList
            rows={[
              { keys: ['Click'], label: 'Draw a bond' },
              { keys: ['Drag'], label: 'Aim it' },
            ]}
          />
        </EmptyGuideSection>
        <EmptyGuideSection title="Point at an atom and press">
          <ShortcutList
            rows={[
              { keys: ['c', 'n', 'o'], label: 'Set the element' },
              { keys: ['+', '-'], label: 'Change the charge' },
            ]}
          />
        </EmptyGuideSection>
      </>
    ),
    linksTitle: 'Learn',
    links: [{ label: 'From a blank page to a figure', href: '#talk' }],
    hints: [
      'Paste a SMILES to add it to the drawing.',
      'Drop a molfile on the page to open it.',
    ],
    hintInterval: 3000,
    figures: [
      { src: FLASK, alt: 'A flask', share: 2 },
      {
        src: `${FLASK}#clicked`,
        alt: 'Another flask',
        title: 'Copy it to the page',
        onSelect: () => undefined,
      },
    ],
  },
};

/** Help alone: a tool with nothing to show off and nothing that changes. */
export const HelpOnly: Story = {
  args: {
    help: (
      <EmptyGuideSection title="Start">
        Type a formula, and its isotopic distribution appears here.
      </EmptyGuideSection>
    ),
  },
};

/** A hint alone, at the bottom of the empty space. */
export const HintOnly: Story = {
  args: {
    hints: ['Type a formula such as C6H12O6 to see its isotopic distribution.'],
  },
};
