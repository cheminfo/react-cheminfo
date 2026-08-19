import type { Meta, StoryObj } from '@storybook/react-vite';

import type { AboutContent } from '../src/about/core/about.ts';
import { AboutPage } from '../src/about/ui/AboutPage.tsx';
import { PLATFORM_WORK } from '../src/citation/core/platformPaper.ts';
import { SiteTheme } from '../src/ecosystem/ui/SiteTheme.tsx';

import '../styles/chrome.css';

// What a site writes about itself: one sentence, a handful of one-line
// affordances, the works it stands on. Everything else the page shows is
// looked up from the site's record.
const SMILES: AboutContent = {
  siteId: 'smiles',
  what: 'Draw a structure and read its SMILES, or write SMILES and see the structure.',
  can: [
    'Convert in both directions, in the browser.',
    'Search a library by substructure.',
    'Learn the notation from the tutorial and its exercises.',
    'Share a structure as a link, or embed it in a course.',
  ],
  credits: ['openchemlib', 'react-ocl', 'blueprint', 'react', 'vite'],
};

const CITED: AboutContent = {
  ...SMILES,
  cite: [PLATFORM_WORK],
  version: '1.4.0',
};

const meta = {
  title: 'About/AboutPage',
  component: AboutPage,
  args: { content: SMILES },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The About every site of the family shows at /about: the same sections, in the same order, from a record the site writes and a registry it does not.',
      },
    },
  },
  render: (args) => (
    <div style={{ background: 'var(--surface-sunken)', padding: 24 }}>
      <SiteTheme siteId={args.content.siteId} />
      <AboutPage {...args} />
    </div>
  ),
} satisfies Meta<typeof AboutPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A site with a paper of its own, and a version it knows. */
export const WithCitation: Story = { args: { content: CITED } };

/** Another site, to show that only the two colours and the words change. */
export const AnotherSite: Story = {
  args: {
    content: {
      ...SMILES,
      siteId: 'regexp',
      what: 'Learn regular expressions by writing them against live text.',
      can: [
        'Test a pattern against your own text, as you type.',
        'Walk the tutorial, then solve the exercises.',
        'Look a construct up on the cheatsheet.',
      ],
      credits: ['blueprint', 'react', 'vite'],
    },
  },
};
