import type { Meta, StoryObj } from '@storybook/react-vite';

import { CiteButton } from '../src/citation/ui/CiteButton.tsx';

import { HEADER_BUTTON_ARG_TYPES } from './headerButton.ts';
import { PAPER } from './paper.ts';

const meta = {
  title: 'Citation/CiteButton',
  component: CiteButton,
  args: { reference: PAPER },
  argTypes: HEADER_BUTTON_ARG_TYPES,
  parameters: {
    docs: {
      description: {
        component:
          'The Cite entry of a site header. Open it, hover an entry for the preview, and the styles sit in the submenu.',
      },
    },
  },
} satisfies Meta<typeof CiteButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLabel: Story = {
  args: { label: 'Cite this work' },
};

export const BottomStart: Story = {
  args: { placement: 'bottom-start' },
};

export const Compact: Story = {
  args: { compact: true },
};

/** The button where it actually lives: pushed to the right of a site's bar. */
export const InHeader: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div className="sb-header" style={{ width: 'min(60rem, 90vw)' }}>
      <CiteButton {...args} />
    </div>
  ),
};
