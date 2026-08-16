import type { Meta, StoryObj } from '@storybook/react-vite';

import { ECOSYSTEM_SITES } from '../src/ecosystem/core/sites.ts';
import { SiteMark } from '../src/ecosystem/ui/marks.tsx';

// The sizes a mark has to survive: a favicon, a menu tile, and a header.
const SIZES = [16, 24, 32, 64];

const meta = {
  title: 'Ecosystem/SiteMark',
  component: SiteMark,
  args: { site: ECOSYSTEM_SITES[0], size: 28 },
  argTypes: {
    site: {
      control: 'select',
      options: ECOSYSTEM_SITES.map((site) => site.id),
      mapping: Object.fromEntries(
        ECOSYSTEM_SITES.map((site) => [site.id, site]),
      ),
    },
    size: { control: { type: 'range', min: 12, max: 128, step: 4 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The little logo of one site of the family, as an inline SVG.',
      },
    },
  },
} satisfies Meta<typeof SiteMark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every mark of the family, so the ten of them can be read as one row. */
export const EverySite: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {ECOSYSTEM_SITES.map((site) => (
        <SiteMark key={site.id} site={site} size={args.size} />
      ))}
    </div>
  ),
};

/** The sizes a mark has to survive, down to the 16 px of a favicon. */
export const EverySize: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {SIZES.map((size) => (
        <SiteMark key={size} site={args.site} size={size} />
      ))}
    </div>
  ),
};
