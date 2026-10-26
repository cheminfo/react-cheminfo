import type { Meta, StoryObj } from '@storybook/react-vite';

import aflatoxin from '../src/mass/core/__tests__/data/aflatoxin-peaks.jdx?raw';
import caffeine from '../src/mass/core/__tests__/data/caffeine-peaks.txt?raw';
import ntuples from '../src/mass/core/__tests__/data/gcms-ntuples.jdx?raw';
import taxine from '../src/mass/core/__tests__/data/taxine-b-ms2.jdx?raw';
import type { MassSpectrum } from '../src/mass/core/index.ts';
import { loadMassSpectra, toMassSpectra } from '../src/mass/core/index.ts';
import { MassChart, MassEditor } from '../src/mass/ui/index.ts';

/**
 * Read files the way a drop reads them, so a story shows what a dropped file
 * produces rather than a hand-built spectrum.
 * @param files - Each file's text and name.
 * @returns The spectra, peaks picked, coloured in order.
 */
async function readFixtures(
  files: ReadonlyArray<{ text: string; name: string }>,
): Promise<MassSpectrum[]> {
  const spectra: MassSpectrum[] = [];
  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop -- one file at a time, so the colours follow the order the files are listed in
    const loaded = await loadMassSpectra(file.text, { fileName: file.name });
    spectra.push(
      ...toMassSpectra(loaded.spectra, {
        taken: spectra.map((spectrum) => spectrum.color),
      }),
    );
  }
  return spectra;
}

const meta = {
  title: 'Mass/MassEditor',
  component: MassEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A mass spectrum viewer: drop JCAMP-DX or two-column text files on the chart. A profile is peak picked, each spectrum is judged high or low resolution, and the peaks of the selected one are labelled as the chart is zoomed.',
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
} satisfies Meta<typeof MassEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A high-resolution Orbitrap profile, peak picked as it is read. */
export const Profile: Story = {
  loaders: [
    async () => ({
      spectra: await readFixtures([{ text: taxine, name: 'taxine-b-ms2.jdx' }]),
    }),
  ],
  render: (_args, { loaded }) => (
    <MassEditor data={loaded.spectra as MassSpectrum[]} />
  ),
};

/** Nominal-mass peak tables, a GC/MS run of three pages among them. */
export const PeakTables: Story = {
  loaders: [
    async () => ({
      spectra: await readFixtures([
        { text: aflatoxin, name: 'aflatoxin-peaks.jdx' },
        { text: ntuples, name: 'gcms-ntuples.jdx' },
        { text: caffeine, name: 'caffeine-peaks.txt' },
      ]),
    }),
  ],
  render: (_args, { loaded }) => (
    <MassEditor
      data={loaded.spectra as MassSpectrum[]}
      defaultPanelIds={['spectra', 'peaks', 'metadata']}
    />
  ),
};

/** Nothing open: drop a file on the chart, or open one from the toolbar. */
export const Empty: Story = {};

/** The chart alone, as a report page would mount it. */
export const ChartOnly: Story = {
  loaders: Profile.loaders,
  render: (_args, { loaded }) => (
    <MassChart spectra={loaded.spectra as MassSpectrum[]} />
  ),
};

const frameStyle = {
  display: 'flex',
  height: '100vh',
  minHeight: 480,
} as const;
