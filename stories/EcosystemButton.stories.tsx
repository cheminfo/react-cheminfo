import type { Meta, StoryObj } from '@storybook/react-vite';

import { ECOSYSTEM_SITES } from '../src/ecosystem/core/sites.ts';
import { EcosystemButton } from '../src/ecosystem/ui/EcosystemButton.tsx';

import { HEADER_BUTTON_ARG_TYPES } from './headerButton.ts';

const SITE_IDS = ECOSYSTEM_SITES.map((site) => site.id);

const meta = {
  title: 'Ecosystem/EcosystemButton',
  component: EcosystemButton,
  argTypes: {
    ...HEADER_BUTTON_ARG_TYPES,
    currentSiteId: { control: 'select', options: SITE_IDS },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The Tools entry. Each tile lights up in the colour of the site it opens; the current site is shown but never linked.',
      },
    },
  },
} satisfies Meta<typeof EcosystemButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CurrentSite: Story = {
  args: { currentSiteId: 'vcl' },
};

export const Compact: Story = {
  args: { currentSiteId: 'chemcalc', compact: true },
};

/** The button where it actually lives: pushed to the right of a site's bar. */
export const InHeader: Story = {
  parameters: { layout: 'padded' },
  args: { currentSiteId: 'vcl' },
  render: (args) => (
    <div className="sb-header" style={{ width: 'min(60rem, 90vw)' }}>
      <EcosystemButton {...args} />
    </div>
  ),
};
