import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { ShareButton } from '../src/share/ui/ShareButton.tsx';

import '../src/chrome/chrome.css';

const COLUMN_STYLE: CSSProperties = {
  display: 'grid',
  width: 'min(60rem, 90vw)',
  gap: 8,
};

const CAPTION_STYLE: CSSProperties = {
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 12,
  textAlign: 'right',
};

const meta = {
  title: 'Share/ShareButton',
  component: ShareButton,
  args: { onClick: () => undefined },
  argTypes: {
    variant: { control: 'radio', options: ['nav-link', 'blueprint'] },
    label: { control: 'text' },
    title: { control: 'text' },
    compact: { control: 'boolean' },
    onClick: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The Share entry of a site header, in the dress the surrounding bar asks for. What it opens is the site’s business.',
      },
    },
  },
} satisfies Meta<typeof ShareButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A plain entry of a site's own bar, carrying `nav-link` like the pages do. */
export const Default: Story = {};

/** The Blueprint dress, for a toolbar already made of Blueprint buttons. */
export const AsBlueprintButton: Story = {
  args: { variant: 'blueprint' },
};

/** Reduced to its icon for a bar out of room; still named to a screen reader. */
export const Compact: Story = {
  args: { compact: true },
};

/** Renamed, for a site that hands out course tiles rather than links. */
export const CustomLabel: Story = {
  args: { label: 'Embed this page' },
};

/** The two dresses side by side, where the button lives: the right of a bar. */
export const InHeader: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={COLUMN_STYLE}>
      <div className="sb-header">
        <ShareButton {...args} variant="nav-link" />
        <ShareButton {...args} variant="blueprint" />
      </div>
      <p style={CAPTION_STYLE}>
        nav-link on the left, blueprint on the right — the bar reads as one menu
        either way.
      </p>
    </div>
  ),
};
