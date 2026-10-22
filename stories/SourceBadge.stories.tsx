import type { Meta, StoryObj } from '@storybook/react-vite';

import { SiteTheme } from '../src/ecosystem/ui/SiteTheme.tsx';
import { SourceBadge } from '../src/moleculesSources/ui/SourceBadge.tsx';

import '../styles/chrome.css';

// The looks molecules.cheminfo.org publishes; a real site reads them with
// `MoleculesSourceBadge`, which this story spares the network.
const LOGO = 'https://molecules.cheminfo.org/v1/sources';

const meta = {
  title: 'Sources/SourceBadge',
  component: SourceBadge,
  args: {
    name: 'ChEBI',
    color: '#18974c',
    logo: `${LOGO}/chebi/logo.svg`,
    identifier: 'CHEBI:15377',
    href: 'https://www.ebi.ac.uk/chebi/CHEBI:15377',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Where a molecule comes from, drawn the same way on every site of the family: the colour and the logo come from molecules.cheminfo.org.',
      },
    },
  },
  render: (args) => (
    <>
      <SiteTheme siteId="smiles" />
      <SourceBadge {...args} />
    </>
  ),
} satisfies Meta<typeof SourceBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A row of them, as a molecule's card lists its sources. */
export const Row: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      <SiteTheme siteId="smiles" />
      <SourceBadge
        name="PubChem"
        color="#0071bc"
        logo={`${LOGO}/pubchem/logo.svg`}
        identifier="962"
      />
      <SourceBadge
        name="COCONUT"
        color="#a07050"
        logo={`${LOGO}/coconut/logo.svg`}
        count={3}
      />
      <SourceBadge name="KEGG" identifier="C00001" />
      <SourceBadge name="web" label="added here" color={null} />
    </div>
  ),
};

/** The smaller badge of a dense grid cell. */
export const Compact: Story = { args: { compact: true } };
