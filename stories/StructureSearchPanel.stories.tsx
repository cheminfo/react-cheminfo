import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { StructureSearchQuery } from '../src/structure/core/structureSearch.ts';
import type { StructureSearchPanelProps } from '../src/structure/ui/StructureSearchPanel.tsx';
import { StructureSearchPanel } from '../src/structure/ui/StructureSearchPanel.tsx';
import { TOKEN } from '../src/tokens/core/familyTokens.ts';

import { BENZENE_QUERY } from './structureFixtures.ts';

const meta = {
  title: 'Structure/StructureSearchPanel',
  component: StructureSearchPanel,
  args: {
    value: { idCode: '', mode: 'substructure', threshold: 0.8 },
    onSearch: () => {
      // Replaced by the demo below, which writes what was searched.
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The body of the structure search dialog, for a page that holds it inline: the canvas with fragments to start from under it, and one large button per mode beside it, which searches. Under 38rem of room the modes go under the canvas.',
      },
    },
  },
  render: (args) => <PanelDemo {...args} />,
} satisfies Meta<typeof StructureSearchPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

/** An empty canvas, which a search page refuses to search. */
export const Default: Story = {
  args: { requireDrawing: true },
};

/**
 * A similarity search reopened on its benzene, with a site's own steps of
 * similarity.
 */
export const SiteThresholds: Story = {
  args: {
    value: { idCode: BENZENE_QUERY, mode: 'similarity', threshold: 0.8 },
    thresholds: [0.7, 0.8, 0.9, 1],
    requireDrawing: true,
  },
};

/**
 * The panel as a page holds it, with what the last mode pressed searched
 * written under it.
 * @param props - The panel's props.
 * @returns The demo.
 */
function PanelDemo(props: StructureSearchPanelProps): ReactElement {
  const [searched, setSearched] = useState<StructureSearchQuery | null>(null);
  return (
    <div style={DEMO_STYLE}>
      <StructureSearchPanel {...props} onSearch={setSearched} />
      <output data-testid="structure-search-result" style={RESULT_STYLE}>
        {searched === null
          ? 'nothing searched'
          : `${searched.mode} ≥ ${searched.threshold} ${searched.idCode.split(' ', 1)[0]}`}
      </output>
    </div>
  );
}

const DEMO_STYLE: CSSProperties = {
  display: 'grid',
  gap: 12,
  maxWidth: '60rem',
};

const RESULT_STYLE: CSSProperties = {
  color: TOKEN.textMuted,
  fontFamily: 'monospace',
};
