import { Button } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { DataDropZone } from '../src/dropzone/ui/DataDropZone.tsx';

const VIEW: CSSProperties = { height: 360, background: 'var(--surface)' };

const nothing = () => undefined;

const meta = {
  title: 'Chrome/DataDropZone',
  component: DataDropZone,
  decorators: [
    (Story) => (
      <div style={VIEW}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'What a page shows while it waits for data: drop a file on it, paste anywhere on the page, or choose a file with Open. It holds every way in, so a page needs no other button for them.',
      },
    },
  },
  args: {
    title: 'Drop, paste or open a mass spectrum',
    description:
      'As JCAMP-DX, or as columns of m/z and intensity. Its peaks are picked and labelled.',
    accept: '.jdx,.dx,.txt,.csv,.tsv',
    onFiles: nothing,
    onText: nothing,
    onPasteClick: nothing,
  },
} satisfies Meta<typeof DataDropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every way in. */
export const Default: Story = {};

/** A page that reads only files has no Paste button and leaves text alone. */
export const FilesOnly: Story = {
  args: {
    title: 'Drop or open a CIF file',
    description: 'The crystal is built from it, in your browser.',
    accept: '.cif',
    multiple: false,
    onText: undefined,
    onPasteClick: undefined,
  },
};

/** Whatever else starts the page sits after Open and Paste. */
export const WithAnExampleMenu: Story = {
  args: {
    actions: (
      <Button icon="chart" variant="minimal" endIcon="caret-down">
        Example
      </Button>
    ),
  },
};
