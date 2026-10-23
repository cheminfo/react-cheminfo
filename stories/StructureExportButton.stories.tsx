import type { Meta, StoryObj } from '@storybook/react-vite';

import { OverlayLayer } from '../src/overlay/ui/OverlayLayer.tsx';
import { Structure } from '../src/structure/ui/Structure.tsx';
import { StructureExportButton } from '../src/structure/ui/StructureExportButton.tsx';

import { CAFFEINE } from './structureFixtures.ts';

const meta = {
  title: 'Structure/StructureExportButton',
  component: StructureExportButton,
  args: { smiles: CAFFEINE, name: 'caffeine' },
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The glyph beside a figure that hands its one structure over, opening the export dialog: the SMILES and the molfiles, each copied with a click, the canonical identifiers, and the picture. Drawn like the other glyphs of an overlay, so it sits in the `tools` of a `CardFigure`.',
      },
    },
  },
  render: (args) => (
    <div style={{ position: 'relative', paddingRight: 32 }}>
      <Structure smiles={CAFFEINE} width={240} height={160} />
      <OverlayLayer density="compact" awake>
        <div
          style={{
            position: 'absolute',
            top: 3,
            right: 3,
            pointerEvents: 'auto',
          }}
        >
          <StructureExportButton {...args} />
        </div>
      </OverlayLayer>
    </div>
  ),
} satisfies Meta<typeof StructureExportButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Press the glyph: the dialog opens on caffeine. */
export const Default: Story = {};
