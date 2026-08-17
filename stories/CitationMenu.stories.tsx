import type { Meta, StoryObj } from '@storybook/react-vite';

import type { CitationMenuProps } from '../src/citation/ui/CitationMenu.tsx';
import { CitationMenu } from '../src/citation/ui/CitationMenu.tsx';

import { PAPER, PAPERS } from './paper.ts';

const meta = {
  title: 'Citation/CitationMenu',
  component: CitationMenu,
  parameters: {
    docs: {
      description: {
        component:
          'What the Cite button opens, shown on its own: the article at its DOI, the reference copied in the style a journal asks for, and the files a reference manager imports.',
      },
    },
  },
} satisfies Meta<typeof CitationMenu>;

export default meta;

// The props are a union — one work, or several — so a story names its own.
type Story = StoryObj<CitationMenuProps>;

export const Default: Story = {
  args: { reference: PAPER },
};

/**
 * A site built on two works: each is named with what citing it credits, and the
 * copy and download entries below carry both references at once.
 */
export const SeveralWorks: Story = {
  args: { works: PAPERS },
};
