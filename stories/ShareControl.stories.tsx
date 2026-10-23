import type { Meta, StoryObj } from '@storybook/react-vite';

import type { ShareVocabulary } from '../src/share/core/index.ts';
import { ShareControl } from '../src/shell/ui/ShareControl.tsx';

import '../styles/chrome.css';

const VOCABULARY: ShareVocabulary = {
  parts: [
    {
      key: 'playground',
      label: 'Calculator',
      description: 'Hiding it leaves the graded series alone on the page.',
    },
    {
      key: 'solutions',
      label: 'Solutions',
      description: 'Hiding it takes the solution button off every question.',
      hiddenByDefault: true,
    },
  ],
};

const meta = {
  title: 'Shell/ShareControl',
  component: ShareControl,
  args: {
    siteId: 'atoms',
    vocabulary: VOCABULARY,
    title: 'Electrons',
    frameHeight: 720,
    preview: false,
  },
  decorators: [
    (Story) => (
      <div className="app-header-actions">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The Share entry of a header and the dialog it opens, in one piece: what a header’s `share` prop takes. The frame is named after the site and the page.',
      },
    },
  },
} satisfies Meta<typeof ShareControl>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The entry as the bar shows it. */
export const Default: Story = {};

/** Reduced to its icon, in a bar out of room. */
export const Compact: Story = {
  args: { compact: true },
};

/** Opened, on the link a course page would frame. */
export const Open: Story = {
  play: ({ canvasElement }) => {
    canvasElement.querySelector('button')?.click();
  },
};
