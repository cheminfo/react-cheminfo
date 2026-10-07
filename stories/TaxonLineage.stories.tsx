import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { Taxon } from '../src/taxonomy/core/lineage.ts';
import { OrganismName } from '../src/taxonomy/ui/OrganismName.tsx';
import type { TaxonLineageProps } from '../src/taxonomy/ui/TaxonLineage.tsx';
import { TaxonLineage } from '../src/taxonomy/ui/TaxonLineage.tsx';
import { TOKEN } from '../src/tokens/core/familyTokens.ts';

// Penicillium chrysogenum as the NCBI Taxonomy of 2025 files it, root included.
const PENICILLIUM: Taxon[] = [
  { rank: 'no rank', name: 'root', taxId: 1 },
  { rank: 'cellular root', name: 'cellular organisms', taxId: 131_567 },
  { rank: 'domain', name: 'Eukaryota', taxId: 2759 },
  { rank: 'clade', name: 'Opisthokonta', taxId: 33_154 },
  { rank: 'kingdom', name: 'Fungi', taxId: 4751 },
  { rank: 'subkingdom', name: 'Dikarya', taxId: 451_864 },
  { rank: 'phylum', name: 'Ascomycota', taxId: 4890 },
  { rank: 'class', name: 'Eurotiomycetes', taxId: 147_545 },
  { rank: 'order', name: 'Eurotiales', taxId: 5042 },
  { rank: 'family', name: 'Aspergillaceae', taxId: 1_131_492 },
  { rank: 'genus', name: 'Penicillium', taxId: 5073 },
  { rank: 'species', name: 'Penicillium chrysogenum', taxId: 5076 },
  {
    rank: 'strain',
    name: 'Penicillium chrysogenum Wisconsin 54-1255',
    taxId: 500_485,
  },
];

function LineageDemo(props: TaxonLineageProps): ReactElement {
  const [followed, setFollowed] = useState('nothing yet');
  return (
    <div style={STACK_STYLE}>
      <TaxonLineage
        {...props}
        onTaxonSelect={(taxon) => {
          setFollowed(`${taxon.name} (${taxon.taxId ?? 'no id'})`);
        }}
      />
      <code style={CAPTION_STYLE} data-testid="followed">
        Followed: {followed}
      </code>
    </div>
  );
}

const meta = {
  title: 'Taxonomy/TaxonLineage',
  component: TaxonLineage,
  args: {
    lineage: PENICILLIUM,
    taxonHref: (taxon) => `#taxon-${taxon.taxId ?? taxon.name}`,
  },
  argTypes: {
    principal: { control: 'boolean' },
    showRanks: { control: 'boolean' },
    ncbiLink: { control: 'boolean' },
    current: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A lineage as a breadcrumb: the principal ranks from the top down, the leaf emphasised, the names under the genus in italics.',
      },
    },
  },
  render: (args) => (
    <div style={{ maxWidth: 640 }}>
      <LineageDemo {...args} />
    </div>
  ),
} satisfies Meta<typeof TaxonLineage>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The principal ranks of a strain, each a link to the site's taxon page. */
export const Default: Story = {};

/** Every taxon of the lineage with its rank over it, as a tree walker shows it. */
export const EveryRank: Story = {
  args: { principal: false, showRanks: true, current: true },
};

/** Plain text, with the way out to NCBI, as a table cell shows it. */
export const PlainWithNcbi: Story = {
  args: { taxonHref: undefined, ncbiLink: true },
};

// Names as natural-product databases write them, authority and strain included.
const NAMES = [
  'Catharanthus roseus (L.) G. Don',
  'Streptomyces sp. CHQ-64',
  'Astilbe odontophylla Miq. var. congesta',
  'Salmonella enterica subsp. enterica serovar anatum',
  'Isodon Shikokiana Var. Occidentalis',
  'Verbena × hybrida',
  '[Clostridium] scindens',
  'Candidatus Liberibacter asiaticus',
  'Taxus chinensis var. mairei + Papulaspora sp. symbiont',
  'Unknown-fungus sp. BY1',
];

/** `OrganismName` on names as their sources wrote them. */
export const OrganismNames: Story = {
  render: () => (
    <ul style={LIST_STYLE}>
      {NAMES.map((name) => (
        <li key={name}>
          <OrganismName name={name} />
        </li>
      ))}
    </ul>
  ),
};

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} as const satisfies CSSProperties;

const CAPTION_STYLE = {
  color: TOKEN.textMuted,
  fontSize: 12,
} as const satisfies CSSProperties;

const LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  margin: 0,
  gap: 4,
} as const satisfies CSSProperties;
