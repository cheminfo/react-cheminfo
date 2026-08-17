import { FormGroup, H6, NumericInput } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import type { ShareConfig } from '../src/share/core/index.ts';
import {
  buildEmbedCode,
  buildShareUrl,
  parseShareConfig,
  suggestedShareConfig,
} from '../src/share/core/index.ts';
import { ShareButton } from '../src/share/ui/ShareButton.tsx';
import type { ShareDialogProps } from '../src/share/ui/ShareDialog.tsx';
import { ShareDialog } from '../src/share/ui/ShareDialog.tsx';

import type { ShareParams } from './shareFixtures.ts';
import {
  MAX_RESULTS,
  SHARE_BASE,
  SHARE_FRAME_TITLE,
  SHARE_PAGE_TITLE,
  SHARE_SEARCH,
  SHARE_VOCABULARY,
} from './shareFixtures.ts';
import { SearchPage } from './sharePanels.tsx';

import '../styles/chrome.css';

// The dialog is generic in the tool's own parameters, and a generic component
// reads as its default — a vocabulary carrying nothing. Naming the fixture's
// codecs once types every story below against the vocabulary it actually shows.
const SearchShareDialog: (
  props: ShareDialogProps<ShareParams>,
) => ReactElement = ShareDialog;

const FRAME_STYLE: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: 'min(52rem, 100vh)',
  overflow: 'auto',
  background: 'var(--surface-sunken)',
};

const BEHIND_STYLE: CSSProperties = {
  display: 'grid',
  padding: '1rem',
  gap: '1rem',
  justifyItems: 'stretch',
};

const HEADER_STYLE: CSSProperties = { justifyContent: 'space-between' };

const BRAND_STYLE: CSSProperties = { fontWeight: 700 };

const COLUMN_STYLE: CSSProperties = {
  display: 'grid',
  width: 'min(56rem, 92vw)',
  gap: 18,
};

const PRE_STYLE: CSSProperties = {
  padding: '8px 10px',
  border: '1px solid var(--border-strong)',
  borderRadius: 4,
  margin: '6px 0 0',
  background: '#f6f7f9',
  fontSize: 12,
  overflowWrap: 'anywhere',
  whiteSpace: 'pre-wrap',
};

const NOTE_STYLE: CSSProperties = {
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 12,
};

// The two states of the dialog, written out as the strings they hand over.
const CONFIGURATIONS: ReadonlyArray<{
  name: string;
  note: string;
  config: ShareConfig<ShareParams>;
}> = [
  {
    name: 'The link the dialog opens on',
    note: 'Framed, with the hints and the result limit already switched off.',
    config: suggestedShareConfig(SHARE_VOCABULARY),
  },
  {
    name: 'The whole site, at the 60 hits the link asks for',
    note: 'Nothing switched off, so nothing but the cap is written.',
    config: parseShareConfig('limit=60', SHARE_VOCABULARY),
  },
];

interface PageFrameProps {
  /** What sits at the right of the mock site's bar. */
  action?: ReactNode;
  /** The dialog, drawn over the page. */
  children: ReactNode;
}

/**
 * The page the dialog is opened from, so it is judged over a real surface.
 * @param props - The bar's right-hand action, and the dialog laid over the page.
 * @returns A mock site bar and search page, with the dialog drawn on top.
 */
function PageFrame(props: PageFrameProps): ReactElement {
  const { action, children } = props;

  return (
    <div style={FRAME_STYLE}>
      <div style={BEHIND_STYLE}>
        <div className="sb-header" style={HEADER_STYLE}>
          <span style={BRAND_STYLE}>smiles.cheminfo.org</span>
          {action}
        </div>
        <SearchPage />
      </div>
      {children}
    </div>
  );
}

/**
 * The dialog as a site wires it: one button, one piece of state.
 * @param props - The dialog's own props, forwarded untouched except for the
 * open state this demo keeps for itself.
 * @returns The page, its Share button, and the dialog that button opens.
 */
function ShareFromHeader(props: ShareDialogProps<ShareParams>): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PageFrame
      action={
        <ShareButton
          onClick={() => {
            setIsOpen(true);
          }}
        />
      }
    >
      <SearchShareDialog
        {...props}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      />
    </PageFrame>
  );
}

const meta = {
  title: 'Share/ShareDialog',
  component: SearchShareDialog,
  args: {
    isOpen: true,
    onClose: () => undefined,
    // Drawn in the story rather than through a portal, so the dialog stays
    // inside its own frame instead of covering the book.
    usePortal: false,
    vocabulary: SHARE_VOCABULARY,
    title: SHARE_PAGE_TITLE,
    baseUrl: SHARE_BASE,
    search: SHARE_SEARCH,
    frameTitle: SHARE_FRAME_TITLE,
  },
  argTypes: {
    title: { control: 'text' },
    search: { control: 'text' },
    frameHeight: { control: { type: 'range', min: 200, max: 1200, step: 20 } },
    vocabulary: { control: false },
    children: { control: false },
    onClose: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Hands the open page out as a link, or as the iframe that frames it in someone else’s site.',
      },
    },
  },
  render: (args) => (
    <PageFrame>
      <SearchShareDialog {...args} />
    </PageFrame>
  ),
} satisfies Meta<typeof SearchShareDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The link one actually hands out: framed, and with the parts a host page has
 * no use for already switched off.
 */
export const Default: Story = {};

/**
 * A page already running a configuration opens on that one — here nothing
 * switched off, at the 60 hits the address carries.
 */
export const EverythingShown: Story = {
  args: { search: `${SHARE_SEARCH}&limit=60` },
};

/**
 * The section only this tool can offer: the result cap is written into the link
 * as it is changed, through the draft the dialog hands over.
 */
export const WithToolSection: Story = {
  args: {
    children: (draft) => (
      <>
        <H6>Results</H6>
        <FormGroup label="How many hits the page comes back with">
          <NumericInput
            min={1}
            max={MAX_RESULTS}
            value={draft.config.params.limit}
            onValueChange={(value) => {
              if (Number.isFinite(value)) draft.setParam('limit', value);
            }}
          />
        </FormGroup>
      </>
    ),
  },
};

/**
 * Opened from a real Share button: closing it and opening it again starts the
 * draft over, so a page never hands out the boxes ticked half an hour ago.
 */
export const FromTheHeader: Story = {
  args: { isOpen: false },
  render: (args) => <ShareFromHeader {...args} />,
};

/** What a teacher copies out of the dialog, for both states of the link. */
export const TheLinkAndTheFrame: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={COLUMN_STYLE}>
      {CONFIGURATIONS.map(({ name, note, config }) => {
        const url = buildShareUrl({
          base: args.baseUrl ?? SHARE_BASE,
          search: args.search,
          config,
          vocabulary: SHARE_VOCABULARY,
        });

        return (
          <section key={name}>
            <H6>{name}</H6>
            <p style={NOTE_STYLE}>{note}</p>
            <pre style={PRE_STYLE}>{url}</pre>
            <pre style={PRE_STYLE}>
              {buildEmbedCode({
                url,
                title: args.frameTitle ?? args.title,
                height: args.frameHeight,
              })}
            </pre>
          </section>
        );
      })}
    </div>
  ),
};
