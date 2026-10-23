import type { Meta, StoryObj } from '@storybook/react-vite';

import type { AboutContent } from '../src/about/core/about.ts';
import type { NavItem } from '../src/chrome/ui/navItem.ts';
import { PLATFORM_WORK } from '../src/citation/core/platformPaper.ts';
import { SiteShell } from '../src/shell/ui/SiteShell.tsx';

import '../styles/chrome.css';

const PAGES: readonly NavItem[] = [
  { id: 'electrons', label: 'Electrons', href: '#electrons' },
  { id: 'neutrons', label: 'Neutrons', href: '#neutrons' },
  { id: 'lewis', label: 'Lewis', href: '#lewis' },
  { id: 'oxidation', label: 'Oxidation states', href: '#oxidation' },
];

const ABOUT: AboutContent = {
  siteId: 'atoms',
  what: 'Count electrons and neutrons, draw Lewis structures and find oxidation states.',
  can: [
    'Count the electrons of an atom or an ion.',
    'Check a Lewis structure atom by atom.',
  ],
  credits: ['react', 'blueprint'],
  cite: [PLATFORM_WORK],
};

const meta = {
  title: 'Shell/SiteShell',
  component: SiteShell,
  args: {
    siteId: 'atoms',
    nav: PAGES,
    activeId: 'electrons',
    about: { content: ABOUT, href: '#about' },
    share: {
      vocabulary: { parts: [] },
      title: 'Electrons',
      preview: false,
    },
    footer: {
      heading: 'The rest of the cheminfo family',
      note: 'Every series of questions is a link you can hand out or frame in a course page.',
    },
    children: (
      <section>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.375rem' }}>
          Count the electrons
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Type a formula, with its charge, and read the electron count.
        </p>
      </section>
    ),
  },
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The chrome of a site around its page: theme, bar with About · Cite · Tools · Contact · Share, the page, and the footer. A framed page gets the page alone.',
      },
    },
  },
} satisfies Meta<typeof SiteShell>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A site of the family, opened on one of its pages. */
export const Default: Story = {};

/** The About tab on show: the shared About page, the entry tinted. */
export const AboutOnShow: Story = {
  args: {
    about: { content: ABOUT, href: '#about', active: true },
  },
};

/** Framed by a course with `?embed`: no bar, no footer. */
export const Embedded: Story = {
  args: { embedded: true },
};

/** A workbench that fills the window: bar, page and footer run full width. */
export const FullWidth: Story = {
  args: { width: 'full' },
};
