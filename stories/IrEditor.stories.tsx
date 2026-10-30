import type { Meta, StoryObj } from '@storybook/react-vite';

import film from '../src/ir/core/__tests__/data/five-bands.jdx?raw';
import type { IrSpectrum } from '../src/ir/core/index.ts';
import { loadIrSpectra, toIrSpectra } from '../src/ir/core/index.ts';
import { IrEditor } from '../src/ir/ui/index.ts';

const meta = {
  title: 'Infrared/IrEditor',
  component: IrEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An infrared spectrum viewer: the bands are picked as the file is read, and each one is offered every functional group the correlation table allows.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={frameStyle}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof IrEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A synthetic film of five bands, with the bands panel open. */
export const Bands: Story = {
  loaders: [
    async () => {
      const { spectra } = await loadIrSpectra(film, {
        fileName: 'five-bands.jdx',
      });
      return { spectra: toIrSpectra(spectra) };
    },
  ],
  render: (_args, { loaded }) => (
    <IrEditor
      data={loaded.spectra as IrSpectrum[]}
      defaultPanelIds={['bands']}
    />
  ),
};

const frameStyle = {
  display: 'flex',
  height: '100vh',
  minHeight: 480,
} as const;
