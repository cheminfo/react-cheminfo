import type { Meta, StoryObj } from '@storybook/react-vite';
import type { LogEntry } from 'fifo-logger';
import { FifoLogger } from 'fifo-logger';

import { LogBadge } from '../src/log/ui/LogBadge.tsx';
import { LogCallouts } from '../src/log/ui/LogCallouts.tsx';

/**
 * What a vibrational calculation and the Raman model said about one result:
 * a run message twice, a warning, and the model's standing caveat.
 * @returns The entries, in the order they were logged.
 */
function vibrationEntries(): LogEntry[] {
  const run = new FifoLogger();
  run.info('The displacement sweep ran on 7 GFN2 instances.');
  run.warn(
    'The Hessian has one imaginary frequency, so the geometry is a saddle point.',
  );
  run.info('The displacement sweep ran on 7 GFN2 instances.');
  const model = new FifoLogger();
  model.info(
    { title: 'Raman intensities come from an empirical model' },
    'Activities are the Placzek quantity over the Lippincott–Stutman bond-polarizability model. A linear symmetric stretch such as the one in {{CO2}} comes out at exactly 1/3.',
  );
  return [...run.getLogs(), ...model.getLogs()];
}

/**
 * What a file reader said about a batch it read, one record dropped.
 * @returns The entries.
 */
function importEntries(): LogEntry[] {
  const logger = new FifoLogger();
  logger.error({ record: 4 }, 'Record 4 has no atom block, so it was skipped.');
  logger.warn(
    '`ethanol.sdf`: the element of atom 3 was guessed from its name.',
  );
  return logger.getLogs();
}

const meta = {
  title: 'Log/LogBadge',
  component: LogBadge,
  args: { entries: vibrationEntries() },
  argTypes: {
    minLevel: {
      control: 'select',
      options: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'One button for every message a logger collected about what sits beside it, in the colour of the worst, opening them on hover.',
      },
    },
  },
} satisfies Meta<typeof LogBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnAChart: Story = {};

export const AnImport: Story = { args: { entries: importEntries() } };

export const WarningsOnly: Story = { args: { minLevel: 'warn' } };

export const Inline: Story = {
  render: (args) => <LogCallouts entries={args.entries} />,
};
