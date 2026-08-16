import type { Meta, StoryObj } from '@storybook/react-vite';

import { CitationMenu } from '../src/citation/ui/CitationMenu.tsx';

import { PAPER } from './paper.ts';

const meta = {
  title: 'Citation/CitationMenu',
  component: CitationMenu,
  args: { reference: PAPER },
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

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
