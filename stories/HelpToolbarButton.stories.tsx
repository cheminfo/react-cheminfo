import { Button, Divider } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { HelpToolbarButton } from '../src/help/ui/HelpToolbarButton.tsx';

import { ADDUCT_HELP, MONOISOTOPIC_MASS_HELP } from './helpContent.ts';

function openTheGuide(): void {
  // A site opens its full guide here; a story has nowhere to send the reader.
}

const meta = {
  title: 'Help/HelpToolbarButton',
  component: HelpToolbarButton,
  args: {
    content: MONOISOTOPIC_MASS_HELP,
    label: 'Mass',
    onClick: openTheGuide,
  },
  argTypes: {
    label: { control: 'text' },
    small: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The help entry of a toolbar: a glyph that explains itself on hover, and opens the full guide when pressed.',
      },
    },
  },
} satisfies Meta<typeof HelpToolbarButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** No label, for a toolbar that has run out of room. */
export const IconOnly: Story = {
  args: { label: undefined },
};

/** The small size a dense toolbar needs, under a glyph of its own choosing. */
export const Small: Story = {
  args: { small: true, icon: 'info-sign', label: 'About the mass' },
};

/** The entry where it sits: last in a toolbar, after the tools it explains. */
export const InToolbar: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={TOOLBAR_STYLE}>
      <Button variant="minimal" icon="zoom-in" text="Zoom" />
      <Button variant="minimal" icon="pulse" text="Peaks" />
      <Button variant="minimal" icon="download" text="Export" />
      <Divider />
      <HelpToolbarButton {...args} content={ADDUCT_HELP} label="Adducts" />
      <HelpToolbarButton {...args} />
    </div>
  ),
};

const TOOLBAR_STYLE = {
  display: 'flex',
  width: 'min(36rem, 92vw)',
  alignItems: 'center',
  padding: '0.35rem 0.5rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  boxShadow: 'var(--shadow-sm)',
  gap: 4,
} as const satisfies CSSProperties;
