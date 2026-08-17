import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { SiteFooter } from '../src/chrome/ui/SiteFooter.tsx';
import { ECOSYSTEM_SITES } from '../src/ecosystem/core/sites.ts';

import '../styles/chrome.css';

const SITE_IDS = ECOSYSTEM_SITES.map((site) => site.id);

const PAGE_STYLE: CSSProperties = {
  display: 'flex',
  minHeight: '22rem',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  background: 'var(--surface-sunken)',
};

const CAPTION_STYLE: CSSProperties = {
  padding: '1.25rem',
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: '0.8125rem',
};

const SITE_LINE_STYLE: CSSProperties = {
  paddingTop: '0.75rem',
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: '0.75rem',
};

const meta = {
  title: 'Chrome/SiteFooter',
  component: SiteFooter,
  args: { siteId: 'smiles', layout: 'grid', embedded: false },
  argTypes: {
    siteId: { control: 'select', options: SITE_IDS },
    layout: { control: 'inline-radio', options: ['grid', 'row'] },
    heading: { control: 'text' },
    embedded: { control: 'boolean' },
    children: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The strip under every page of the family: each sibling site as a plain link, so a crawler and a reader walk from one of our tools to the next.',
      },
    },
  },
  render: (args) => (
    <div style={PAGE_STYLE}>
      <SiteFooter {...args} />
    </div>
  ),
} satisfies Meta<typeof SiteFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The names only, for a footer with no room for fifteen taglines. */
export const Row: Story = {
  args: { layout: 'row' },
};

/** What introduces the family is the site's to write. */
export const CustomHeading: Story = {
  args: { heading: 'The rest of the cheminfo toolbox' },
};

/** Whatever the site adds under the family: a licence, a version, the sources. */
export const WithSiteLine: Story = {
  args: {
    layout: 'row',
    children: (
      <p style={SITE_LINE_STYLE}>
        MIT licensed · v2.4.0 ·{' '}
        <a href="https://github.com/cheminfo/smiles.cheminfo.org">Source</a>
      </p>
    ),
  },
};

/** A framed page is given no footer at all, exactly as it is given no bar. */
export const Embedded: Story = {
  render: (args) => (
    <div style={PAGE_STYLE}>
      <p style={CAPTION_STYLE}>
        With <code>embedded</code>, nothing is drawn below this line.
      </p>
      <SiteFooter {...args} embedded />
    </div>
  ),
};
