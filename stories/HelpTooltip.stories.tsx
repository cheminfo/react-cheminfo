import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { HelpIcon } from '../src/help/ui/HelpIcon.tsx';
import { HelpToolbarButton } from '../src/help/ui/HelpToolbarButton.tsx';
import { HelpTooltip } from '../src/help/ui/HelpTooltip.tsx';

import {
  ADDUCT_HELP,
  MONOISOTOPIC_MASS_HELP,
  SMILES_HELP,
} from './helpContent.ts';

// The phrase a tooltip is hung on, marked the way running text marks one.
const TARGET_STYLE = {
  borderBottom: '1px dotted var(--text-faint)',
  cursor: 'help',
} as const satisfies CSSProperties;

const meta = {
  title: 'Help/HelpTooltip',
  component: HelpTooltip,
  args: {
    content: MONOISOTOPIC_MASS_HELP,
    children: <span style={TARGET_STYLE}>monoisotopic mass</span>,
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
    width: { control: { type: 'range', min: 180, max: 480, step: 20 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A piece of help attached to whatever it explains. Rest the pointer on the target — it opens after a quarter of a second, so sweeping across a row of controls opens nothing.',
      },
    },
  },
} satisfies Meta<typeof HelpTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Help carrying no link closes as soon as the pointer leaves its target. */
export const WithoutExampleOrLink: Story = {
  args: {
    content: SMILES_HELP,
    children: <span style={TARGET_STYLE}>SMILES</span>,
  },
};

/** A wide body, for help whose example is a line that must not wrap. */
export const Wide: Story = {
  args: { content: ADDUCT_HELP, width: 420 },
};

/**
 * One payload, three triggers: the tooltip on a phrase, the glyph beside a
 * field label, and the help entry of a toolbar all draw the same body, so a
 * construct documented once cannot drift between two of its mentions.
 */
export const EveryTrigger: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={ROW_STYLE}>
      <HelpTooltip content={args.content}>
        <span style={TARGET_STYLE}>monoisotopic mass</span>
      </HelpTooltip>
      <span style={FIELD_STYLE}>
        Monoisotopic mass
        <HelpIcon content={args.content} />
      </span>
      <HelpToolbarButton content={args.content} label="Mass" />
    </div>
  ),
};

const ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 24,
} as const satisfies CSSProperties;

const FIELD_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  color: 'var(--text-muted)',
  fontSize: 13,
  fontWeight: 600,
  gap: 4,
} as const satisfies CSSProperties;
