import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { AccountButton } from '../src/chrome/ui/AccountButton.tsx';
import { NavLink } from '../src/chrome/ui/NavLink.tsx';

import '../styles/chrome.css';

import { noop } from './chromeFixtures.ts';

const ACTIONS_STYLE: CSSProperties = {
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

const meta = {
  title: 'Chrome/AccountButton',
  component: AccountButton,
  args: {
    identity: { name: 'Ada Lovelace', detail: 'ada.lovelace@epfl.ch' },
    onSignIn: noop,
    onSignOut: noop,
    signInHref: '/login',
  },
  argTypes: {
    signInLabel: { control: 'text' },
    loading: { control: 'boolean' },
    identity: { control: false },
    items: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The utility that says who the site is answering to. The two states are told apart by whether an identity is on screen, never by the direction of an arrow: the invitation is written out in words, and being signed in is the person's own initials.",
      },
    },
  },
} satisfies Meta<typeof AccountButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Somebody is signed in: their initials, and their name on hover. */
export const SignedIn: Story = {};

/** The menu the mark opens: who it belongs to, and the way out. */
export const MenuOpened: Story = {
  parameters: { layout: 'padded' },
  play: openMenu,
};

/** Nobody is signed in, and the bar says so in words no mark can impersonate. */
export const SignedOut: Story = {
  args: { identity: null },
};

/** A site whose accounts are for one kind of person says so in the invitation. */
export const NamesWhoSignsIn: Story = {
  args: { identity: null, signInLabel: 'Teacher sign in' },
};

/** The account's own pages, listed above Sign out. */
export const WithAccountPages: Story = {
  parameters: { layout: 'padded' },
  args: {
    items: [
      { id: 'settings', label: 'Settings', href: '/settings', icon: 'cog' },
    ],
  },
  play: openMenu,
};

/**
 * The two states in the bar they belong to, one under the other: what the
 * arrow through a door could not say, and the reason this component exists.
 */
export const BothStatesInTheBar: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={ACTIONS_STYLE} className="app-header-actions">
        <NavLink item={ABOUT} />
        <AccountButton {...args} identity={null} />
      </div>
      <div style={ACTIONS_STYLE} className="app-header-actions">
        <NavLink item={ABOUT} />
        <AccountButton {...args} />
      </div>
    </div>
  ),
};

/** Still asking: neither state, at the width the mark will take. */
export const StillAsking: Story = {
  args: { loading: true },
};

const ABOUT = {
  id: 'about',
  label: 'About',
  icon: 'info-sign',
  href: '/about',
} as const;

interface PlayContext {
  /** What the story was rendered into. */
  canvasElement: HTMLElement;
}

/**
 * Opens the menu, then drops the focus the popover traps on its own sentinel:
 * a story that opens itself was reached by no keyboard, so the ring the family
 * paints for one would otherwise sit around the whole canvas.
 * @param context - The story being played, which carries its canvas.
 */
async function openMenu(context: PlayContext): Promise<void> {
  context.canvasElement.querySelector('button')?.click();
  await new Promise((resolve) => {
    setTimeout(resolve, 50);
  });

  const focused = document.activeElement;
  if (focused instanceof HTMLElement) focused.blur();
}
