import type { Meta, StoryObj } from '@storybook/react-vite';
import type {
  CSSProperties,
  ReactElement,
  ReactNode,
  SyntheticEvent,
} from 'react';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

import type { SiteId } from '../src/ecosystem/core/sites.ts';
import { ECOSYSTEM_SITES } from '../src/ecosystem/core/sites.ts';
import { SiteTheme } from '../src/ecosystem/ui/SiteTheme.tsx';

// What SiteTheme writes is a `:root` rule, so it only reaches a document root:
// two of them on one page would be one page, and the Brand toolbar's pair —
// set inline on this document's root, which outranks any stylesheet — would
// win over both. Each pane is therefore a page of its own, which is also what
// lets two sites be looked at at the same time.
const PAGE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
body { margin: 0; padding: 16px; background: #f5f7fa; color: #16202c;
  font: 15px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
button { font: inherit; }
</style></head><body></body></html>`;

const meta = {
  title: 'Ecosystem/SiteTheme',
  component: SiteTheme,
  args: { siteId: 'surge' },
  argTypes: {
    siteId: {
      control: 'select',
      options: ECOSYSTEM_SITES.map((site) => site.id),
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The two colours a site owns, put on the page as the custom properties every component of the family reads. Each pane below is a page of its own, because the rule it writes is a `:root` one.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 'min(26rem, 92vw)' }}>
      <ThemedPage siteId={args.siteId} height={CARD_FRAME_HEIGHT}>
        <ResultCard />
      </ThemedPage>
    </div>
  ),
} satisfies Meta<typeof SiteTheme>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * The same card under two sites: not one colour is written on it, so what
 * separates the two panes is the pair of tokens and nothing else.
 */
export const SideBySide: Story = {
  render: () => (
    <div style={PANES_STYLE}>
      {(['surge', 'pt'] as const).map((siteId) => (
        <ThemedPage key={siteId} siteId={siteId} height={CARD_FRAME_HEIGHT}>
          <ResultCard />
        </ThemedPage>
      ))}
    </div>
  ),
};

/**
 * The declarations themselves. `--brand-alt-text` only appears for a site
 * whose answering colour is a yellow or an amber that would be unreadable as
 * text, so on the others the swatch falls back to the answering colour it
 * would have darkened.
 */
export const Tokens: Story = {
  render: (args) => (
    <div style={{ width: 'min(26rem, 92vw)' }}>
      <ThemedPage siteId={args.siteId} height={SWATCH_FRAME_HEIGHT}>
        <TokenSwatches />
      </ThemedPage>
    </div>
  ),
};

/**
 * A page of its own, holding the rule and whatever reads it.
 *
 * The portal waits for the frame's own document, so nothing is rendered into a
 * body that the srcdoc load is about to replace.
 * @param props - The site whose palette the page takes, and what goes on it.
 * @param props.siteId - The site whose theme the frame's own document is
 * written under, so each page carries one palette and one only.
 * @param props.height - How tall the frame is drawn, in pixels; the frame does
 * not grow with its content.
 * @param props.children - What is portalled into the frame's body once the
 * srcdoc load has produced one.
 * @returns The frame, with the children rendered inside it.
 */
function ThemedPage(props: {
  siteId: SiteId;
  height: number;
  children: ReactNode;
}): ReactElement {
  const { siteId, height, children } = props;
  const [body, setBody] = useState<HTMLElement | null>(null);

  const handleLoad = useCallback((event: SyntheticEvent<HTMLIFrameElement>) => {
    setBody(event.currentTarget.contentDocument?.body ?? null);
  }, []);

  return (
    <>
      <iframe
        title={`${siteId}, on a page of its own`}
        srcDoc={PAGE_HTML}
        onLoad={handleLoad}
        style={{ ...FRAME_STYLE, height }}
      />
      {body === null
        ? null
        : createPortal(
            <>
              <SiteTheme siteId={siteId} />
              {children}
            </>,
            body,
          )}
    </>
  );
}

/**
 * A card that names no colour of its own: its heading, its tag, its link and
 * its button are all painted by whatever `SiteTheme` put on the page.
 * @returns The card.
 */
function ResultCard(): ReactElement {
  return (
    <div style={CARD_STYLE}>
      <div style={CARD_HEAD_STYLE}>
        <span style={CARD_TITLE_STYLE}>Caffeine</span>
        <span style={CARD_TAG_STYLE}>alkaloid</span>
      </div>
      <div style={CARD_FORMULA_STYLE}>C₈H₁₀N₄O₂ · 194.0804 Da</div>
      <div style={CARD_ACTIONS_STYLE}>
        <button type="button" style={CARD_BUTTON_STYLE}>
          Isotopic distribution
        </button>
        <span style={CARD_LINK_STYLE}>Open in ChemCalc</span>
      </div>
    </div>
  );
}

/**
 * Every custom property the rule declares, painted with itself.
 * @returns The swatches.
 */
function TokenSwatches(): ReactElement {
  return (
    <div style={CARD_STYLE}>
      {SWATCHES.map((swatch) => (
        <div key={swatch.name} style={SWATCH_ROW_STYLE}>
          <span style={{ ...SWATCH_CHIP_STYLE, background: swatch.paint }} />
          <code style={SWATCH_NAME_STYLE}>{swatch.name}</code>
        </div>
      ))}
    </div>
  );
}

const SWATCHES = [
  { name: '--brand', paint: 'var(--brand)' },
  { name: '--brand-alt', paint: 'var(--brand-alt)' },
  {
    name: '--brand-alt-text',
    paint: 'var(--brand-alt-text, var(--brand-alt))',
  },
  { name: '--accent', paint: 'var(--accent)' },
] as const;

const PANES_STYLE: CSSProperties = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
};

// Tall enough for what each pane holds, and no taller: an iframe never sizes
// itself to its content.
const CARD_FRAME_HEIGHT = 155;
const SWATCH_FRAME_HEIGHT = 195;

const FRAME_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  border: '1px solid var(--border, #dfe3e8)',
  borderRadius: 'var(--radius, 10px)',
  background: '#f5f7fa',
};

const CARD_STYLE: CSSProperties = {
  padding: 14,
  border: '1px solid #dfe3e8',
  borderRadius: 10,
  background: '#fff',
  boxShadow: '0 1px 2px rgb(16 32 48 / 8%)',
};

const CARD_HEAD_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
};

const CARD_TITLE_STYLE: CSSProperties = {
  color: 'var(--brand)',
  fontSize: '1.0625rem',
  fontWeight: 700,
  letterSpacing: '-0.01em',
};

const CARD_TAG_STYLE: CSSProperties = {
  padding: '1px 7px',
  borderRadius: 999,
  background: 'color-mix(in oklab, var(--brand-alt) 16%, white)',
  color: 'var(--brand-alt-text, var(--brand-alt))',
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
};

const CARD_FORMULA_STYLE: CSSProperties = {
  color: '#5b6875',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.8125rem',
};

const CARD_ACTIONS_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginTop: 14,
  gap: 12,
};

const CARD_BUTTON_STYLE: CSSProperties = {
  padding: '6px 12px',
  border: 0,
  borderRadius: 8,
  background: 'var(--accent)',
  color: '#fff',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const CARD_LINK_STYLE: CSSProperties = {
  color: 'var(--accent)',
  fontSize: '0.8125rem',
  fontWeight: 600,
  textDecoration: 'underline',
};

const SWATCH_ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '4px 0',
  gap: 10,
};

const SWATCH_CHIP_STYLE: CSSProperties = {
  display: 'inline-block',
  width: 40,
  height: 20,
  borderRadius: 6,
  boxShadow: 'inset 0 0 0 1px rgb(16 32 48 / 12%)',
};

const SWATCH_NAME_STYLE: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.8125rem',
};
