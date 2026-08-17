import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';

import { HiddenPartsProvider } from '../src/share/ui/HiddenPartsProvider.tsx';
import { PagePart } from '../src/share/ui/PagePart.tsx';

import { SHARE_PART_KEYS } from './shareFixtures.ts';
import { SearchPage, SearchPanel } from './sharePanels.tsx';

const NOTHING_HIDDEN: readonly string[] = [];
const HINTS_HIDDEN: readonly string[] = ['hints'];

const ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'start',
  gap: 24,
};

const COLUMN_STYLE: CSSProperties = { display: 'grid', gap: 8 };

const ADDRESS_STYLE: CSSProperties = {
  color: 'var(--text-muted)',
  fontSize: 12,
};

// The part draws nothing at all, so the outline is what shows there is a hole.
const HOLE_STYLE: CSSProperties = {
  width: 'min(24rem, 92vw)',
  minHeight: 54,
  border: '1px dashed var(--border-strong)',
  borderRadius: 'var(--radius)',
};

const NOTE_STYLE: CSSProperties = {
  maxWidth: '32rem',
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 12,
};

interface UnderLinkProps {
  /** The address the column is read under. */
  address: string;
  /** The parts that address switches off. */
  hidden: readonly string[];
}

/**
 * The whole page under one link, so two links can be read side by side.
 * @param props - The address being read, and the parts it switches off.
 * @returns A column showing that address above the page it produces.
 */
function UnderLink(props: UnderLinkProps): ReactElement {
  const { address, hidden } = props;

  return (
    <div style={COLUMN_STYLE}>
      <code style={ADDRESS_STYLE}>{address}</code>
      <HiddenPartsProvider hidden={hidden}>
        <SearchPage />
      </HiddenPartsProvider>
    </div>
  );
}

const meta = {
  title: 'Share/PagePart',
  component: PagePart,
  args: {
    part: 'hints',
    children: (
      <SearchPanel title="Hints">
        Aromatic carbons are written lowercase, so benzene is c1ccccc1.
      </SearchPanel>
    ),
  },
  argTypes: {
    part: { control: 'select', options: SHARE_PART_KEYS },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A region of the page a shared link may leave out. A switched-off part is dropped from the tree rather than hidden with CSS, so an embedded figure never mounts a canvas nobody will see.',
      },
    },
  },
} satisfies Meta<typeof PagePart>;

export default meta;

type Story = StoryObj<typeof meta>;

/** With no link switching anything off, a part simply draws what it holds. */
export const Default: Story = {};

/** Under `hide=hints`, the very same part returns nothing to render at all. */
export const Hidden: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={COLUMN_STYLE}>
      <code style={ADDRESS_STYLE}>?smiles=c1ccc2ccccc2c1&amp;hide=hints</code>
      <div style={HOLE_STYLE}>
        <HiddenPartsProvider hidden={HINTS_HIDDEN}>
          <PagePart {...args} />
        </HiddenPartsProvider>
      </div>
      <p style={NOTE_STYLE}>
        The outline is all that is left: no panel, and nothing mounted inside
        it.
      </p>
    </div>
  ),
};

/** The same page under two links, so what `hide=` costs is the missing panel. */
export const SideBySide: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={ROW_STYLE}>
      <UnderLink address="?smiles=c1ccc2ccccc2c1" hidden={NOTHING_HIDDEN} />
      <UnderLink
        address="?smiles=c1ccc2ccccc2c1&hide=hints"
        hidden={HINTS_HIDDEN}
      />
    </div>
  ),
};
