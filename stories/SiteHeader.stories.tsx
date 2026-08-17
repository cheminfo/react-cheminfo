import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useRef } from 'react';

import { NavLink } from '../src/chrome/ui/NavLink.tsx';
import { NavMenuButton } from '../src/chrome/ui/NavMenuButton.tsx';
import { SiteFooter } from '../src/chrome/ui/SiteFooter.tsx';
import type { SiteHeaderProps } from '../src/chrome/ui/SiteHeader.tsx';
import { SiteHeader } from '../src/chrome/ui/SiteHeader.tsx';
import type { NavItem } from '../src/chrome/ui/navItem.ts';
import { useCompactHeader } from '../src/chrome/ui/useCompactHeader.ts';
import { CiteButton } from '../src/citation/ui/CiteButton.tsx';
import { siteById } from '../src/ecosystem/core/lookup.ts';
import type { SiteId } from '../src/ecosystem/core/sites.ts';
import { ECOSYSTEM_SITES } from '../src/ecosystem/core/sites.ts';
import { EcosystemButton } from '../src/ecosystem/ui/EcosystemButton.tsx';
import { ShareButton } from '../src/share/ui/ShareButton.tsx';

import '../src/chrome/chrome.css';

import { CAFFEINE, SITE_BARS, SMILES_PAGES, noop } from './chromeFixtures.ts';
import { PAPER } from './paper.ts';

const SITE_IDS = ECOSYSTEM_SITES.map((site) => site.id);

// chrome.css writes this on `:hover`. A story has no pointer to hold there, so
// the same declarations are put on a class one page carries.
const HOVER_RULE = `
.sb-hovered {
  background: var(--surface-sunken);
  color: var(--text);
}`;

const CAPTION_STYLE: CSSProperties = {
  padding: '0.75rem 1.25rem 0',
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: '0.8125rem',
};

const meta = {
  title: 'Chrome/SiteHeader',
  component: SiteHeader,
  args: {
    siteId: 'smiles',
    nav: SMILES_PAGES,
    activeId: 'draw',
    markSize: 28,
    homeHref: '/',
    embedded: false,
  },
  argTypes: {
    siteId: { control: 'select', options: SITE_IDS },
    activeId: {
      control: 'select',
      options: SMILES_PAGES.map((page) => page.id),
    },
    markSize: { control: { type: 'range', min: 16, max: 48, step: 2 } },
    homeHref: { control: 'text' },
    embedded: { control: 'boolean' },
    nav: { control: false },
    actions: { control: false },
    renderNavItem: { control: false },
    onHome: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The bar every site of the family carries: the brand linking home at the left, the pages next to it, and the utilities pushed to the right edge.',
      },
    },
  },
  render: (args) => (
    <SiteTokens siteId={args.siteId}>
      <SiteHeader {...args} actions={<Utilities siteId={args.siteId} />} />
    </SiteTokens>
  ),
} satisfies Meta<typeof SiteHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * The same bar on four sites, one under the other: the geometry, the type and
 * the neutrals never move — only the two colours and the pages do.
 */
export const EverySite: Story = {
  render: () => (
    <div style={STACK_STYLE}>
      {SITE_BARS.map((bar) => (
        <SiteTokens key={bar.siteId} siteId={bar.siteId}>
          <SiteHeader
            siteId={bar.siteId}
            nav={bar.nav}
            activeId={bar.activeId}
            actions={<Utilities siteId={bar.siteId} />}
          />
        </SiteTokens>
      ))}
    </div>
  ),
};

/**
 * The page on show, in the brand tint, beside a page under the pointer: the
 * hover is the neutral wash, so it never impersonates where you are.
 */
export const ActiveAndHovered: Story = {
  render: (args) => (
    <SiteTokens siteId={args.siteId}>
      <style>{HOVER_RULE}</style>
      <SiteHeader
        {...args}
        actions={<Utilities siteId={args.siteId} />}
        renderNavItem={(item, isActive) => (
          <NavLink
            item={item}
            active={isActive}
            className={item.id === 'tutorial' ? 'sb-hovered' : undefined}
          />
        )}
      />
      <p style={CAPTION_STYLE}>
        Draw is the page on show; Tutorial is drawn as the pointer leaves it.
      </p>
    </SiteTokens>
  ),
};

/**
 * A bar with no room left: `useCompactHeader` measures the bar itself, so the
 * utilities give up their labels and the pages fold into one menu rather than
 * being pushed off the edge. Drag the right edge to widen it.
 */
export const Narrow: Story = {
  render: (args) => <NarrowBar {...args} />,
};

/** Header, page and footer together — the whole chrome a site imports. */
export const WholePage: Story = {
  render: (args) => (
    <SiteTokens siteId={args.siteId}>
      <div style={PAGE_STYLE}>
        <SiteHeader {...args} actions={<Utilities siteId={args.siteId} />} />
        <main style={MAIN_STYLE}>
          <div style={CARD_STYLE}>
            <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{CAFFEINE.name}</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Monoisotopic mass {CAFFEINE.monoisotopicMass}
            </p>
            <code style={CODE_STYLE}>{CAFFEINE.smiles}</code>
            <code style={CODE_STYLE}>{CAFFEINE.inchiKey}</code>
          </div>
        </main>
        <SiteFooter siteId={args.siteId} layout="row" />
      </div>
    </SiteTokens>
  ),
};

/** A framed page is given no bar at all: what frames it carries its own. */
export const Embedded: Story = {
  render: (args) => (
    <SiteTokens siteId={args.siteId}>
      <SiteHeader {...args} actions={<Utilities siteId={args.siteId} />} />
      <p style={CAPTION_STYLE}>
        Above, the bar. Below, the same bar with <code>embedded</code>, which
        draws nothing.
      </p>
      <SiteHeader {...args} embedded />
    </SiteTokens>
  ),
};

// Each bar on the sunken page it would sit on, so four of them still read as
// four sites rather than as one long menu.
const STACK_STYLE: CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  padding: '1.5rem',
  background: 'var(--surface-sunken)',
  gap: '1.5rem',
};

const PAGE_STYLE: CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  background: 'var(--surface-sunken)',
};
const MAIN_STYLE: CSSProperties = {
  width: '100%',
  maxWidth: 'var(--page-max)',
  flex: '1 1 auto',
  padding: '1.5rem 1.25rem',
  margin: '0 auto',
};
const CARD_STYLE: CSSProperties = {
  display: 'flex',
  maxWidth: '32rem',
  flexDirection: 'column',
  padding: '1rem 1.25rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  boxShadow: 'var(--shadow-sm)',
  gap: '0.5rem',
};
const CODE_STYLE: CSSProperties = {
  overflowWrap: 'anywhere',
  fontSize: '0.8125rem',
};

const HOLDER_STYLE: CSSProperties = {
  overflow: 'auto',
  width: 520,
  minWidth: 320,
  maxWidth: '100%',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  resize: 'horizontal',
};

// The single entry a compact bar keeps, which opens every page behind it.
const PAGES_ITEM: NavItem = { id: 'pages', label: 'Pages' };

/**
 * The bar in a column narrow enough to trigger the compact form, in a holder
 * the reader can drag so the fold can be watched happening.
 * @param props - Whatever the story's controls currently hold.
 * @returns The holder, the bar in it, and what the hook currently answers.
 */
function NarrowBar(props: SiteHeaderProps): ReactElement {
  const holder = useRef<HTMLDivElement>(null);
  const compact = useCompactHeader(holder, { maxWidth: 640 });
  const { nav, activeId, siteId } = props;

  return (
    <SiteTokens siteId={siteId}>
      <div style={{ padding: '1.25rem' }}>
        <div ref={holder} style={HOLDER_STYLE}>
          <SiteHeader
            {...props}
            nav={compact ? [PAGES_ITEM] : nav}
            actions={<Utilities siteId={siteId} compact={compact} />}
            renderNavItem={
              compact
                ? () => (
                    <NavMenuButton
                      label="Pages"
                      icon="menu"
                      items={nav}
                      activeId={activeId}
                    />
                  )
                : undefined
            }
          />
        </div>
        <p style={{ ...CAPTION_STYLE, padding: '0.75rem 0 0' }}>
          useCompactHeader: <code>{String(compact)}</code> — drag the right edge
          of the bar past 640 px.
        </p>
      </div>
    </SiteTokens>
  );
}

/**
 * The utilities of a site bar: the work it asks to be cited, the family, and
 * the link that frames the page elsewhere.
 * @param props - The site they sit on, and whether the bar has run out of room.
 * @param props.siteId - The site the bar belongs to, so the ecosystem menu
 * knows which entry of the family is the current one.
 * @param props.compact - Whether the bar is too narrow for labels, in which
 * case the buttons keep only their icons.
 * @returns The three buttons, dressed as bar items.
 */
function Utilities(props: { siteId: SiteId; compact?: boolean }): ReactElement {
  const { siteId, compact = false } = props;

  return (
    <>
      <CiteButton reference={PAPER} compact={compact} />
      <EcosystemButton currentSiteId={siteId} compact={compact} />
      <ShareButton onClick={noop} compact={compact} />
    </>
  );
}

/**
 * The two colours a site owns, scoped to one subtree so several bars can be
 * read side by side. A real page takes them from `SiteTheme`, which writes the
 * same three properties on `:root` — which is why the Brand toolbar has
 * nothing to change in these stories.
 * @param props - The site whose pair is used, and what reads it.
 * @param props.siteId - The site whose brand pair the subtree is drawn in.
 * @param props.children - The bar, or anything else that reads those three
 * custom properties.
 * @returns The subtree, under that site's colours.
 */
function SiteTokens(props: {
  siteId: SiteId;
  children: ReactNode;
}): ReactElement {
  const site = siteById(props.siteId);
  const style = {
    '--brand': site.brand,
    '--brand-alt': site.brandAlt,
    '--accent': site.brand,
  } as CSSProperties;

  return <div style={style}>{props.children}</div>;
}
