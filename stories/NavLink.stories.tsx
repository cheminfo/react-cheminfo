import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { NavLink } from '../src/chrome/ui/NavLink.tsx';

import '../styles/chrome.css';

import { noop } from './chromeFixtures.ts';

const BAR_STYLE: CSSProperties = {
  display: 'flex',
  height: 'var(--header-height)',
  alignItems: 'center',
  padding: '0 1.25rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  boxShadow: 'var(--shadow-sm)',
  gap: '0.15rem',
};

const CAPTION_STYLE: CSSProperties = {
  margin: '0.75rem 0 0',
  color: 'var(--text-muted)',
  fontSize: '0.8125rem',
};

const COUNT_STYLE: CSSProperties = {
  padding: '0 0.35rem',
  borderRadius: 999,
  background: 'var(--surface-sunken)',
  color: 'var(--text-muted)',
  fontSize: '0.75rem',
};

const meta = {
  title: 'Chrome/NavLink',
  component: NavLink,
  args: {
    item: { id: 'tutorial', label: 'Tutorial', href: '/tutorial' },
    active: false,
  },
  argTypes: {
    item: { control: false },
    active: { control: 'boolean' },
    className: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'One entry of a site bar, drawn as a link when it has an address and as a button when it has none.',
      },
    },
  },
} satisfies Meta<typeof NavLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The one entry of a bar the brand tint is ever spent on. */
export const Active: Story = {
  args: { active: true },
};

export const WithIcon: Story = {
  args: {
    item: {
      id: 'exercises',
      label: 'Exercises',
      href: '/exercises',
      icon: 'lab-test',
    },
  },
};

/** An entry with no address is a button, and carries `nav-link` all the same. */
export const AsButton: Story = {
  args: {
    item: {
      id: 'clear',
      label: 'Clear answers',
      icon: 'eraser',
      onSelect: noop,
    },
  },
};

/**
 * A link and a button beside each other: the row has to read as one menu, so
 * nothing in either says which is which.
 */
export const LinkAndButton: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div>
      <div style={BAR_STYLE}>
        <NavLink item={{ id: 'draw', label: 'Draw', href: '/' }} active />
        <NavLink
          item={{ id: 'tutorial', label: 'Tutorial', href: '/tutorial' }}
        />
        <NavLink
          item={{ id: 'clear', label: 'Clear answers', onSelect: noop }}
        />
      </div>
      <p style={CAPTION_STYLE}>
        Draw and Tutorial are links. Clear answers is a button.
      </p>
    </div>
  ),
};

/** An address that leaves the site opens in a tab of its own. */
export const External: Story = {
  args: {
    item: {
      id: 'specification',
      label: 'OpenSMILES',
      href: 'https://opensmiles.org/opensmiles.html',
      icon: 'document-open',
      external: true,
      title: 'The OpenSMILES specification',
    },
  },
};

/** What follows the label — a count, a tag, anything the page reports. */
export const WithCount: Story = {
  args: {
    item: {
      id: 'exercises',
      label: 'Exercises',
      href: '/exercises',
      icon: 'lab-test',
      after: <span style={COUNT_STYLE}>7/20</span>,
    },
  },
};
