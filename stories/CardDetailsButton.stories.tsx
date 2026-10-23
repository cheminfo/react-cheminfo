import type { Meta, StoryObj } from '@storybook/react-vite';

import { CardDetailsButton } from '../src/card/ui/CardDetailsButton.tsx';

import { ChatFrame } from './cardFixtures.tsx';

const meta = {
  title: 'Card/CardDetailsButton',
  component: CardDetailsButton,
  args: {
    // The book is not framed, so a press would replace it with the page.
    page: () => globalThis.location.href,
  },
  argTypes: {
    tooltip: { control: 'text' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The way from a card to the site’s own page it stands for: framed by a chat, in a new tab; opened on its own, in place. The page is the card’s address without `card`, `embed`, `hide` and what only the card reads.',
      },
    },
  },
  render: (args) => (
    <ChatFrame width={360}>
      <div className="card">
        <div className="card__end">
          <p className="card__note">The last row of a card.</p>
          <CardDetailsButton {...args} />
        </div>
      </div>
    </ChatFrame>
  ),
} satisfies Meta<typeof CardDetailsButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Hover it: the tooltip says where the page opens. */
export const Default: Story = {};
