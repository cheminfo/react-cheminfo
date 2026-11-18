import type { FifoLogger as FifoLoggerType } from 'fifo-logger';
import { FifoLogger } from 'fifo-logger';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { LogBadge } from '../LogBadge.tsx';
import { LogCallouts } from '../LogCallouts.tsx';
import { useLogEntries } from '../useLogEntries.ts';

test('the callouts show each message once, worst first, in its level', () => {
  const logger = new FifoLogger();
  logger.info(
    { title: 'Raman intensities come from an empirical model' },
    'The `Placzek` activity of {{CO2}} is purely geometric.',
  );
  logger.warn('The geometry did not converge.');
  logger.warn('The geometry did not converge.');

  const html = renderToStaticMarkup(<LogCallouts entries={logger.getLogs()} />);
  const intents = [...html.matchAll(/bp6-intent-(?<intent>\w+)/g)].map(
    (match) => match.groups?.intent,
  );

  expect(html.startsWith('<div class="log-callouts">')).toBe(true);
  expect(intents).toStrictEqual(['warning', 'primary']);
  expect(html).toContain(
    'The geometry did not converge.<span class="log-callouts__count">×2</span>',
  );
  expect(html).toContain('Raman intensities come from an empirical model');
  expect(html).toContain('The <code>Placzek</code> activity of');
});

test('the source leads the message, and a cap counts what it leaves out', () => {
  const logger = new FifoLogger();
  logger.error({ source: 'record 4' }, 'No atom block.');
  logger.warn('first');
  logger.warn('second');
  logger.warn('third');

  const html = renderToStaticMarkup(
    <LogCallouts entries={logger.getLogs()} limit={2} />,
  );

  expect(html).toContain(
    '<span class="log-callouts__source">record 4</span>No atom block.',
  );
  expect(html).toContain('first');
  expect(html).not.toContain('second');
  expect(html).toContain(
    '<span class="log-callouts__more">2 more messages are not shown.</span>',
  );
  expect(
    renderToStaticMarkup(<LogCallouts entries={logger.getLogs()} limit={3} />),
  ).toContain('One more message is not shown.');
});

test('the callouts draw nothing when no message reaches the level', () => {
  const logger = new FifoLogger({ level: 'debug' });
  logger.debug('only for a developer');

  expect(renderToStaticMarkup(<LogCallouts entries={[]} />)).toBe('');
  expect(renderToStaticMarkup(<LogCallouts entries={logger.getLogs()} />)).toBe(
    '',
  );
});

test('the badge takes the worst intent, counts the messages, and does not print', () => {
  const logger = new FifoLogger();
  logger.info('context');
  logger.warn('qualified');
  logger.warn('qualified');

  const html = renderToStaticMarkup(<LogBadge entries={logger.getLogs()} />);

  expect(html).toContain('bp6-intent-warning');
  expect(html).toContain('aria-label="2 notes"');
  expect(html).toMatch(/class="[^"]*\blog-badge\b[^"]*\bno-print\b/);
  expect(html).toContain('data-icon="warning-sign"');
  expect(html).toContain('>2</span>');
});

test('a badge for one message shows no count', () => {
  const logger = new FifoLogger();
  logger.error('dropped');

  const html = renderToStaticMarkup(<LogBadge entries={logger.getLogs()} />);

  expect(html).toContain('bp6-intent-danger');
  expect(html).toContain('aria-label="One note"');
  expect(html).not.toMatch(/>1<\/span>/);
});

test('the badge is absent when there is nothing to say', () => {
  expect(renderToStaticMarkup(<LogBadge entries={[]} />)).toBe('');
});

function EntryCount(props: { logger: FifoLoggerType | null }) {
  return <>{useLogEntries(props.logger).length}</>;
}

test('the hook reads what a logger holds, and nothing without one', () => {
  const logger = new FifoLogger();
  logger.info('one');
  logger.child({ structure: 2 }).warn('two');

  expect(renderToStaticMarkup(<EntryCount logger={logger} />)).toBe('2');
  expect(renderToStaticMarkup(<EntryCount logger={null} />)).toBe('0');
});
