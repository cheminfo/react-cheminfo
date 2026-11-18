import { FifoLogger } from 'fifo-logger';
import { expect, test } from 'vitest';

import type { LogLine } from '../logGroups.ts';
import { groupLogEntries } from '../logGroups.ts';
import { logMessages, plainLogLines } from '../logLines.ts';

test('a source labels the message, and the same text from two sources stays two', () => {
  const logger = new FifoLogger();
  logger
    .child({ source: 'ethanol.sdf' })
    .warn('Atom 3 had its element guessed.');
  logger.child({ source: 'water.xyz' }).warn('Atom 3 had its element guessed.');

  expect(
    groupLogEntries(logger.getLogs({ includeChildren: true })).map((group) => [
      group.source,
      group.text,
    ]),
  ).toStrictEqual([
    ['ethanol.sdf', 'Atom 3 had its element guessed.'],
    ['water.xyz', 'Atom 3 had its element guessed.'],
  ]);
});

test('plain lines a site writes read like logged ones', () => {
  const caveats: LogLine[] = [
    {
      levelLabel: 'info',
      message: 'Intensities are indicative.',
      meta: { title: 'An empirical model' },
    },
    { levelLabel: 'silent', message: 'never shown' },
  ];

  expect(groupLogEntries(caveats)).toStrictEqual([
    {
      key: 'info\u0000\u0000An empirical model\u0000Intensities are indicative.',
      level: 'info',
      title: 'An empirical model',
      text: 'Intensities are indicative.',
      count: 1,
    },
  ]);
});

test('plain lines keep the level, the meta and an error as its message', () => {
  const logger = new FifoLogger();
  logger.warn({ source: 'line 4' }, 'Unknown token.');
  logger.error(new Error('The file is empty.'));
  const plain = plainLogLines(logger.getLogs());

  expect(plain).toStrictEqual([
    {
      levelLabel: 'warn',
      message: 'Unknown token.',
      meta: { source: 'line 4' },
    },
    { levelLabel: 'error', message: 'The file is empty.', meta: {} },
  ]);
  expect(JSON.stringify(plain)).toBe(
    '[{"levelLabel":"warn","message":"Unknown token.","meta":{"source":"line 4"}},{"levelLabel":"error","message":"The file is empty.","meta":{}}]',
  );
});

test('the messages as sentences: once each, worst first, with source and title', () => {
  const logger = new FifoLogger();
  logger.info('The sweep ran on 7 instances.');
  logger.warn(
    { source: 'the 3rd conformer', title: 'Not converged' },
    'The optimizer stopped after 250 cycles.',
  );
  logger.info('The sweep ran on 7 instances.');

  expect(logMessages(logger.getLogs())).toStrictEqual([
    'the 3rd conformer: Not converged. The optimizer stopped after 250 cycles.',
    'The sweep ran on 7 instances.',
  ]);
  expect(logMessages(logger.getLogs(), { minLevel: 'warn' })).toStrictEqual([
    'the 3rd conformer: Not converged. The optimizer stopped after 250 cycles.',
  ]);
});
