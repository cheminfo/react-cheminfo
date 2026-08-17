import { MenuDivider, MenuItem } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { NavLink } from '../src/chrome/ui/NavLink.tsx';
import { NavMenuButton } from '../src/chrome/ui/NavMenuButton.tsx';

import '../src/chrome/chrome.css';

import { DRAW_PAGE, LEARN_PAGES, noop } from './chromeFixtures.ts';
import { PLACEMENTS } from './headerButton.ts';

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

const meta = {
  title: 'Chrome/NavMenuButton',
  component: NavMenuButton,
  args: { label: 'Learn', items: LEARN_PAGES, icon: 'learning' },
  argTypes: {
    label: { control: 'text' },
    activeId: {
      control: 'select',
      options: LEARN_PAGES.map((page) => page.id),
    },
    placement: { control: 'select', options: PLACEMENTS },
    items: { control: false },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The pages that do not need a place of their own in the bar, folded into one menu whose trigger is dressed as a bar item.',
      },
    },
  },
} satisfies Meta<typeof NavMenuButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The menu as a reader needs to see it: opened on the pages it holds. */
export const Opened: Story = {
  parameters: { layout: 'padded' },
  play: openMenu,
};

/**
 * The trigger takes the brand tint when the page on show is one of its own, so
 * a folded page still says where you are.
 */
export const HoldsThePageOnShow: Story = {
  args: { activeId: 'exercises' },
};

/** What the menu adds under the pages: a divider and an action of the site's. */
export const WithAction: Story = {
  args: {
    children: (
      <>
        <MenuDivider />
        <MenuItem icon="reset" text="Clear all answers" onClick={noop} />
      </>
    ),
  },
  parameters: { layout: 'padded' },
  play: openMenu,
};

/** In the bar it belongs to, beside the pages that kept a place of their own. */
export const InBar: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={BAR_STYLE}>
      <NavLink item={DRAW_PAGE} active />
      <NavMenuButton {...args} />
    </div>
  ),
};

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
