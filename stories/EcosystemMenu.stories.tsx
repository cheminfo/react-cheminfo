import type { Meta, StoryObj } from '@storybook/react-vite';

import { ECOSYSTEM_SITES } from '../src/ecosystem/core/sites.ts';
import { EcosystemMenu } from '../src/ecosystem/ui/EcosystemMenu.tsx';

const meta = {
  title: 'Ecosystem/EcosystemMenu',
  component: EcosystemMenu,
  argTypes: {
    currentSiteId: {
      control: 'select',
      options: ECOSYSTEM_SITES.map((site) => site.id),
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'What the Tools button opens, shown on its own: every site of the family gathered under its topic, each behind its own little logo and the two colours it owns. The panel lays the topics out in CSS columns, so the same markup gives three columns on a laptop and one on a phone — resize the browser to see it fold.',
      },
    },
  },
} satisfies Meta<typeof EcosystemMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The current site keeps its tile, marked, and is the one that is not a link. */
export const CurrentSite: Story = {
  args: { currentSiteId: 'vcl' },
};
