import type { Meta, StoryObj } from '@storybook/react-vite';

import { ECOSYSTEM_SITES } from '../src/ecosystem/core/sites.ts';
import { Wordmark } from '../src/ecosystem/ui/Wordmark.tsx';

// The sizes a name is actually set at: a footer under a mark, a header bar, a
// page heading, and the hero of a landing page.
const SIZES = [13, 17, 28, 44];

const meta = {
  title: 'Ecosystem/Wordmark',
  component: Wordmark,
  args: { siteId: 'chemcalc', size: 17 },
  argTypes: {
    siteId: {
      control: 'select',
      options: ECOSYSTEM_SITES.map((site) => site.id),
    },
    size: { control: { type: 'range', min: 12, max: 64, step: 1 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The name of one site of the family, written in the two colours it owns.',
      },
    },
  },
} satisfies Meta<typeof Wordmark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Every name of the family in one column, so the two naming rules can be read
 * against the addresses beside them: a name that splits on itself — ChemCalc,
 * EquiLibrium, PolyCarp — carries no domain and no dot, a one-word name takes
 * `.cheminfo` after a faint dot, and the `.org` of the address is never
 * written, because the name is the site rather than where it lives.
 */
export const EverySite: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={COLUMN_STYLE}>
      {ECOSYSTEM_SITES.map((site) => (
        <div key={site.id} style={ROW_STYLE}>
          <Wordmark siteId={site.id} size={args.size} />
          <span style={HOST_STYLE}>{site.host}</span>
        </div>
      ))}
    </div>
  ),
};

/** The sizes a name is set at, from a footer line up to a landing heading. */
export const EverySize: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
      {SIZES.map((size) => (
        <Wordmark key={size} siteId={args.siteId} size={size} />
      ))}
    </div>
  ),
};

const COLUMN_STYLE = {
  display: 'grid',
  gap: 6,
  justifyItems: 'start',
} as const;

const ROW_STYLE = {
  display: 'grid',
  width: 'min(30rem, 90vw)',
  alignItems: 'baseline',
  gap: 12,
  gridTemplateColumns: '13.5rem 1fr',
} as const;

const HOST_STYLE = {
  color: 'var(--text-faint, #8a96a3)',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.75rem',
} as const;
