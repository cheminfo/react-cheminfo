// @vitest-environment jsdom
/**
 * A whole card: the lead on the line that leaves the chat's corner free, what
 * comes under it, and the last row, whose table is the card's own, else the
 * one of the fold while it is open.
 */

import { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, beforeEach, expect, test } from 'vitest';

import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { CardAnswer } from '../CardAnswer.tsx';
import { loadEmbed } from '../embed.ts';

beforeAll(async () => {
  await loadEmbed();
});

beforeEach(() => {
  mountRoot();
});

afterEach(() => {
  unmountRoot();
});

/**
 * The fold of the card on screen.
 * @returns The fold.
 */
function fold(): HTMLDetailsElement {
  const details = host.querySelector('details');
  if (details === null) throw new Error('no fold');
  return details;
}

/**
 * Open or close the fold, as a reader's click does.
 * @param open - Whether it ends open.
 */
function toggle(open: boolean): void {
  const details = fold();
  act(() => {
    details.open = open;
    details.dispatchEvent(new Event('toggle'));
  });
}

const POINTS = {
  table: () => 'Volume (mL)\tpH\n10\t8.72',
  tooltip: 'Copy the points as a table',
};

test('the lead comes first, then what is under it, then the foot', () => {
  const html = renderToStaticMarkup(
    <CardAnswer
      lead={<span className="card__value">pH 8.72</span>}
      leadClassName="answer-card__lead"
      className="answer-card"
      more={{ summary: 'How it was computed', content: <p>points</p> }}
    >
      <svg />
    </CardAnswer>,
  );

  expect(html).toMatch(
    /^<div class="card answer-card" data-testid="answer-card"><div class="card__header answer-card__lead"><span class="card__value">pH 8.72<\/span><\/div><svg><\/svg><div class="card__foot">/,
  );
  expect(html).toContain(
    '<details class="card-fold"><summary>How it was computed</summary><div class="card-fold__body"><p>points</p></div></details></div></div>',
  );
  expect(html).not.toContain('data-testid="card-copy-table"');
});

test('a card with nothing folded has the row of its actions alone', () => {
  const html = renderToStaticMarkup(
    <CardAnswer lead="CCO" stack testId="card-under-test" />,
  );

  expect(html).toMatch(
    /^<div class="card card--stack" data-testid="card-under-test"><div class="card__header">CCO<\/div><div class="card__foot">/,
  );
  expect(html).not.toContain('card-fold');
});

test('a fold may stack what it opens on', () => {
  const html = renderToStaticMarkup(
    <CardAnswer
      lead="InChI"
      more={{ summary: 'Layers', content: 'rows', stack: true }}
    />,
  );

  expect(html).toContain(
    '<div class="card-fold__body card-fold__body--stack">rows</div>',
  );
});

test('the table of the fold is copied only while the fold is open', () => {
  act(() => {
    root.render(
      <CardAnswer
        lead="pH 8.72"
        more={{ summary: 'Points', content: 'points', table: POINTS }}
      />,
    );
  });

  expect(host.querySelector('[data-testid="card-copy-table"]')).toBeNull();

  toggle(true);

  expect(host.querySelector('[data-testid="card-copy-table"]')).not.toBeNull();

  toggle(false);

  expect(host.querySelector('[data-testid="card-copy-table"]')).toBeNull();
});

test('the card’s own table is copied whether the fold is open or not', () => {
  act(() => {
    root.render(
      <CardAnswer
        lead="pH 8.72"
        table={{ table: () => 'pH\n8.72', testId: 'own-table' }}
        more={{ summary: 'Points', content: 'points', table: POINTS }}
      />,
    );
  });

  expect(host.querySelector('[data-testid="own-table"]')).not.toBeNull();

  toggle(true);

  expect(host.querySelector('[data-testid="own-table"]')).not.toBeNull();
  expect(host.querySelectorAll('[data-testid="card-copy-table"]')).toHaveLength(
    0,
  );
});
