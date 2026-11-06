import type { Meta, StoryObj } from '@storybook/react-vite';

import type { AboutContent } from '../src/about/core/about.ts';
import { AboutPage } from '../src/about/ui/AboutPage.tsx';
import type { BundledPackage } from '../src/build/core/bundledPackages.ts';
import { BUNDLED_PACKAGES_FILE } from '../src/build/core/bundledPackages.ts';
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
  build: {
    version: '1.4.0',
    builtAt: '2026-09-16T09:41:07Z',
    commit: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
  },
};

// What the build writes next to the page, which a story has no build to write.
const PACKAGES: BundledPackage[] = [
  { name: 'mf-parser', version: '3.4.0', license: 'MIT', own: true },
  { name: 'react-cheminfo', version: '0.94.0', license: 'MIT', own: true },
  { name: 'react', version: '19.3.0', license: 'MIT', own: false },
  { name: 'tslib', version: '2.8.1', license: '0BSD', own: false },
];

const meta = {
  title: 'About/AboutPage',
  component: AboutPage,
  args: { content: SMILES },
  beforeEach: () => {
    const { fetch: realFetch } = globalThis;
    globalThis.fetch = (input, init) =>
      typeof input === 'string' && input.endsWith(`/${BUNDLED_PACKAGES_FILE}`)
        ? Promise.resolve(Response.json(PACKAGES))
        : realFetch(input, init);
    return () => {
      globalThis.fetch = realFetch;
    };
  },
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
      <SiteTheme siteId="smiles" />
      <AboutPage {...args} />
    </div>
  ),
} satisfies Meta<typeof AboutPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A site with a paper of its own, and a version it knows. */
export const WithCitation: Story = { args: { content: CITED } };

/** A site with accounts: signing in starts under the version, never in the bar. */
export const WithSignIn: Story = {
  args: { content: CITED, signIn: { href: '/admin' } },
};

/** A site with no release yet is named by the commit it was built from. */
export const NeverReleased: Story = {
  args: {
    content: {
      ...CITED,
      build: {
        version: '0.0.0',
        builtAt: '2026-09-16T09:41:07Z',
        commit: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
      },
    },
  },
};

/**
 * A site provided by Luc Patiny at EPFL. The list under the names is the
 * family's: Luc Patiny first, then Michaël Zasso, who maintains OpenChemLib —
 * credited here — and the tooling, at Zakodium.
 */
export const ProvidedBy: Story = {
  args: {
    content: {
      ...CITED,
      people: [{ name: 'Luc Patiny' }],
      providedBy: ['epfl'],
    },
  },
};

/**
 * A site whose design is react-science: Daniel Kostro, who maintains it at
 * Zakodium, comes second.
 */
export const ProvidedWithReactScience: Story = {
  args: {
    content: {
      ...CITED,
      credits: ['openchemlib', 'react-science', 'blueprint', 'react', 'vite'],
      people: [{ name: 'Luc Patiny' }],
      providedBy: ['epfl'],
    },
  },
};

/** A site some others worked on: they follow the family, each with one line. */
export const ProvidedByATeam: Story = {
  args: {
    content: {
      ...CITED,
      people: [{ name: 'Luc Patiny' }],
      contributors: [
        {
          name: 'Daniel Kostro',
          role: 'wrote chem-equilibrium, the solver every page runs on.',
        },
        {
          name: 'Régis Turin',
          role: 'wrote the exercises and the worked examples.',
        },
      ],
      providedBy: ['epfl'],
    },
  },
};

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
