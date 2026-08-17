import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { parseShareConfig } from '../src/share/core/index.ts';
import { HiddenPartsProvider } from '../src/share/ui/HiddenPartsProvider.tsx';

import {
  SHARE_PART_KEYS,
  SHARE_VOCABULARY,
  SUGGESTED_HIDDEN,
} from './shareFixtures.ts';
import { SearchPage } from './sharePanels.tsx';

// A link written before `substructure` was renamed, and asking for more hits
// than the tool serves: neither may stop the page from opening.
const LINK_SEARCH = '?smiles=c1ccc2ccccc2c1&hide=examples,diagram&limit=4000';

const LINK_CONFIG = parseShareConfig(LINK_SEARCH, SHARE_VOCABULARY);

const COLUMN_STYLE: CSSProperties = { display: 'grid', gap: 8 };

const ADDRESS_STYLE: CSSProperties = {
  color: 'var(--text-muted)',
  fontSize: 12,
};

const NOTE_STYLE: CSSProperties = {
  maxWidth: '32rem',
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 12,
};

const meta = {
  title: 'Share/HiddenPartsProvider',
  component: HiddenPartsProvider,
  args: { hidden: SUGGESTED_HIDDEN, children: <SearchPage /> },
  argTypes: {
    hidden: { control: 'check', options: SHARE_PART_KEYS },
    children: { control: false },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Puts the configuration of the current link where every part of the page can read it, so nothing has to be threaded through props. Tick the parts in the controls to watch the page change.',
      },
    },
  },
} satisfies Meta<typeof HiddenPartsProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The page inside a course tile: the hints and the limit are switched off. */
export const Default: Story = {};

/** The same page on our own site, where a link switches nothing off. */
export const NothingHidden: Story = {
  args: { hidden: [] },
};

/**
 * Read straight off an address: `diagram` names no part of this version and is
 * ignored, and the 4000 hits it asks for come back clamped to 200.
 */
export const FromTheLink: Story = {
  render: (args) => (
    <div style={COLUMN_STYLE}>
      <code style={ADDRESS_STYLE}>{LINK_SEARCH}</code>
      <p style={NOTE_STYLE}>
        {`hidden: [${LINK_CONFIG.hidden.join(', ')}] · limit: ${String(LINK_CONFIG.params.limit)}`}
      </p>
      <HiddenPartsProvider hidden={LINK_CONFIG.hidden}>
        {args.children}
      </HiddenPartsProvider>
    </div>
  ),
};
