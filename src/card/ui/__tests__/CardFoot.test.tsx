/**
 * The last row of a card: its actions floated at the foot, a remark and the
 * folds beside them, and nothing of it printed.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CardFold } from '../CardFold.tsx';
import { CardFoot } from '../CardFoot.tsx';
import { CardFrame } from '../CardFrame.tsx';

test('the row holds the way to the page, and nothing else when given nothing', () => {
  const html = renderToStaticMarkup(<CardFoot />);

  expect(html).toMatch(
    /^<div class="card__foot"><div class="card__actions no-print">/,
  );
  expect(html).toContain('data-testid="card-details"');
  expect(html).not.toContain('data-testid="card-copy-table"');
  expect(html).not.toContain('card__note');
  expect(html).not.toContain('card-fold');
});

test('the card’s own actions come first, then the copy of its table, then Details', () => {
  const html = renderToStaticMarkup(
    <CardFoot
      actions={<button type="button">Download</button>}
      table={{ table: () => 'a\tb', tooltip: 'Copy the atoms as a table' }}
      detailsTooltip="Open the full page on chemcalc.org"
    />,
  );

  const own = html.indexOf('>Download<');
  const copy = html.indexOf('data-testid="card-copy-table"');
  const details = html.indexOf('data-testid="card-details"');

  expect(own).toBeGreaterThan(-1);
  expect(copy).toBeGreaterThan(own);
  expect(details).toBeGreaterThan(copy);
});

test('a remark opens the row, and the folds follow the actions', () => {
  const html = renderToStaticMarkup(
    <CardFoot
      note="The first 12 of 9,000 drawn"
      folds={
        <>
          <CardFold summary="Subshells">one</CardFold>
          <CardFold summary="About these values">two</CardFold>
        </>
      }
    />,
  );

  expect(html).toContain(
    '</div><p class="card__note">The first 12 of 9,000 drawn</p><details class="card-fold"><summary>Subshells</summary><div class="card-fold__body">one</div></details><details class="card-fold"><summary>About these values</summary><div class="card-fold__body">two</div></details></div>',
  );
});

test('a fold is closed unless it is asked to open, and stacks its parts on request', () => {
  const closed = renderToStaticMarkup(
    <CardFold summary="Molfile">text</CardFold>,
  );
  const open = renderToStaticMarkup(
    <CardFold summary="Molfile" defaultOpen stack>
      text
    </CardFold>,
  );

  expect(closed).toBe(
    '<details class="card-fold"><summary>Molfile</summary><div class="card-fold__body">text</div></details>',
  );
  expect(open).toBe(
    '<details class="card-fold" open=""><summary>Molfile</summary><div class="card-fold__body card-fold__body--stack">text</div></details>',
  );
});

test('a card laid out as a column says so, beside the site’s own class', () => {
  const block = renderToStaticMarkup(<CardFrame>x</CardFrame>);
  const stack = renderToStaticMarkup(
    <CardFrame className="answer-card" stack testId="answer-card">
      x
    </CardFrame>,
  );

  expect(block).toBe('<div class="card" data-testid="card">x</div>');
  expect(stack).toBe(
    '<div class="card card--stack answer-card" data-testid="answer-card">x</div>',
  );
});
