import { FifoLogger } from 'fifo-logger';
import { expect, test } from 'vitest';

import { groupLogEntries, logIntent, worstLogLevel } from '../logGroups.ts';

test('a message said twice is shown once with its count, the worst first', () => {
  const logger = new FifoLogger();
  logger.info('The sweep ran on 7 GFN2 instances.');
  logger.warn('The geometry did not converge in 200 cycles.');
  logger.info('The sweep ran on 7 GFN2 instances.');
  logger.error({ record: 4 }, 'Record 4 has no atom block, so it was skipped.');

  expect(groupLogEntries(logger.getLogs())).toStrictEqual([
    {
      key: 'error\u0000\u0000\u0000Record 4 has no atom block, so it was skipped.',
      level: 'error',
      text: 'Record 4 has no atom block, so it was skipped.',
      count: 1,
    },
    {
      key: 'warn\u0000\u0000\u0000The geometry did not converge in 200 cycles.',
      level: 'warn',
      text: 'The geometry did not converge in 200 cycles.',
      count: 1,
    },
    {
      key: 'info\u0000\u0000\u0000The sweep ran on 7 GFN2 instances.',
      level: 'info',
      text: 'The sweep ran on 7 GFN2 instances.',
      count: 2,
    },
  ]);
});

test('within one level the messages keep the order they were first said in', () => {
  const logger = new FifoLogger();
  logger.warn('first');
  logger.info('context');
  logger.warn('second');
  logger.warn('first');

  expect(
    groupLogEntries(logger.getLogs()).map((group) => [group.text, group.count]),
  ).toStrictEqual([
    ['first', 2],
    ['second', 1],
    ['context', 1],
  ]);
});

test('a string title in the meta heads the message, and tells it apart', () => {
  const logger = new FifoLogger();
  logger.info(
    { title: 'Raman intensities come from an empirical model' },
    'Activities are the Placzek quantity over a bond-polarizability model.',
  );
  logger.info(
    'Activities are the Placzek quantity over a bond-polarizability model.',
  );
  logger.info({ title: 42 }, 'A title that is not a string is ignored.');

  expect(groupLogEntries(logger.getLogs())).toStrictEqual([
    {
      key: 'info\u0000\u0000Raman intensities come from an empirical model\u0000Activities are the Placzek quantity over a bond-polarizability model.',
      level: 'info',
      title: 'Raman intensities come from an empirical model',
      text: 'Activities are the Placzek quantity over a bond-polarizability model.',
      count: 1,
    },
    {
      key: 'info\u0000\u0000\u0000Activities are the Placzek quantity over a bond-polarizability model.',
      level: 'info',
      text: 'Activities are the Placzek quantity over a bond-polarizability model.',
      count: 1,
    },
    {
      key: 'info\u0000\u0000\u0000A title that is not a string is ignored.',
      level: 'info',
      text: 'A title that is not a string is ignored.',
      count: 1,
    },
  ]);
});

test('a logged error reads as its own message, without the `Error:` prefix', () => {
  const logger = new FifoLogger();
  logger.error(new Error('The file holds no spectrum.'));

  expect(logger.getLogs()[0]?.message).toBe(
    'Error: The file holds no spectrum.',
  );
  expect(groupLogEntries(logger.getLogs())).toStrictEqual([
    {
      key: 'error\u0000\u0000\u0000The file holds no spectrum.',
      level: 'error',
      text: 'The file holds no spectrum.',
      count: 1,
    },
  ]);
});

test('debug and trace stay out unless asked for, and minLevel hides the rest', () => {
  const logger = new FifoLogger({ level: 'trace' });
  logger.trace('a trace');
  logger.debug('a debug');
  logger.info('an info');
  logger.warn('a warning');
  logger.fatal('a fatal');
  const entries = logger.getLogs();

  expect(groupLogEntries(entries).map((group) => group.level)).toStrictEqual([
    'fatal',
    'warn',
    'info',
  ]);
  expect(
    groupLogEntries(entries, { minLevel: 'trace' }).map((group) => group.level),
  ).toStrictEqual(['fatal', 'warn', 'info', 'debug', 'trace']);
  expect(
    groupLogEntries(entries, { minLevel: 'warn' }).map((group) => group.level),
  ).toStrictEqual(['fatal', 'warn']);
});

test('the entries of two loggers read as one list', () => {
  const run = new FifoLogger();
  const model = new FifoLogger();
  run.warn('The Hessian has one imaginary frequency.');
  model.info('Intensities are indicative.');
  model.warn('The Hessian has one imaginary frequency.');

  expect(
    groupLogEntries([...run.getLogs(), ...model.getLogs()]).map((group) => [
      group.level,
      group.count,
    ]),
  ).toStrictEqual([
    ['warn', 2],
    ['info', 1],
  ]);
});

test('the worst level stands for all the messages', () => {
  const logger = new FifoLogger();

  expect(worstLogLevel(groupLogEntries(logger.getLogs()))).toBeNull();

  logger.info('context');

  expect(worstLogLevel(groupLogEntries(logger.getLogs()))).toBe('info');

  logger.error('dropped');
  logger.warn('qualified');

  expect(worstLogLevel(groupLogEntries(logger.getLogs()))).toBe('error');
});

test('each level is drawn in its intent', () => {
  expect(
    (['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const).map(
      logIntent,
    ),
  ).toStrictEqual(['danger', 'danger', 'warning', 'primary', 'none', 'none']);
});
