import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { EmptyGuide, EmptyGuideSection } from '../EmptyGuide.tsx';
import { ShortcutList } from '../ShortcutList.tsx';
import { firstHintIndex } from '../hintCycle.ts';

test('the first hint follows the clock, so another visit opens on another', () => {
  expect(firstHintIndex(0, 3, 1000)).toBe(0);
  expect(firstHintIndex(1000, 3, 1000)).toBe(1);
  expect(firstHintIndex(2999, 3, 1000)).toBe(2);
  expect(firstHintIndex(3000, 3, 1000)).toBe(0);
});

test('there is no first hint to pick among none, or with no time to show it', () => {
  expect(firstHintIndex(5000, 0, 1000)).toBe(0);
  expect(firstHintIndex(5000, 3, 0)).toBe(0);
});

test('a guide writes its help, its links, one hint and its figures', () => {
  const html = renderToStaticMarkup(
    <EmptyGuide
      help={<EmptyGuideSection title="Keys">Press one</EmptyGuideSection>}
      linksTitle="Learn"
      links={[{ label: 'The first talk', href: '/talks/first' }]}
      hints={['Only hint']}
      figures={[{ src: '/a.svg', alt: 'A scheme', share: 2 }]}
    />,
  );

  expect(html).toContain('<h2 class="empty-guide__title">Keys</h2>');
  expect(html).toContain('Press one');
  expect(html).toContain('aria-label="Learn"');
  expect(html).toContain('href="/talks/first"');
  expect(html).toContain('<span>Only hint</span>');
  expect(html).toContain('src="/a.svg"');
  expect(html).toContain('alt="A scheme"');
  expect(html).toContain('flex-grow:2');
});

test('a guide offers its ways to start as buttons, ahead of its help', () => {
  const html = renderToStaticMarkup(
    <EmptyGuide
      actions={[
        { label: 'Start drawing', icon: 'draw', onSelect: () => undefined },
        { label: 'Use a template', onSelect: () => undefined },
      ]}
      help={<EmptyGuideSection title="Keys">Press one</EmptyGuideSection>}
    />,
  );

  expect(html.indexOf('Start drawing')).toBeLessThan(html.indexOf('Keys'));
  expect(html.match(/class="empty-guide__action"/g)).toHaveLength(2);
  expect(html).toContain('data-icon="draw"');
});

test('a guide with no way to start writes no row of buttons', () => {
  const html = renderToStaticMarkup(<EmptyGuide actions={[]} />);

  expect(html).not.toContain('empty-guide__actions');
});

test('the figures are headed only when the site says what a click does', () => {
  const figures = [{ src: '/a.svg', alt: 'A scheme' }];
  const plain = renderToStaticMarkup(<EmptyGuide figures={figures} />);
  const headed = renderToStaticMarkup(
    <EmptyGuide figures={figures} figuresTitle="Click one to copy it" />,
  );

  expect(plain).not.toContain('empty-guide__figures-title');
  expect(headed).toContain(
    '<p class="empty-guide__title empty-guide__figures-title">Click one to copy it</p>',
  );
});

test('a figure is a button only when a click on it does something', () => {
  const inert = renderToStaticMarkup(
    <EmptyGuide figures={[{ src: '/a.svg', alt: 'A scheme' }]} />,
  );
  const clicked = renderToStaticMarkup(
    <EmptyGuide
      figures={[
        {
          src: '/a.svg',
          alt: 'A scheme',
          title: 'Copy it',
          onSelect: () => undefined,
        },
      ]}
    />,
  );

  expect(inert).toContain('<figure class="empty-guide__figure"');
  expect(inert).not.toContain('<button');
  expect(clicked).toContain(
    '<button type="button" class="empty-guide__figure"',
  );
  expect(clicked).toContain('title="Copy it"');
  expect(clicked).not.toContain('<figure');
});

test('figures in a stack take one place in the row, in the order given', () => {
  const html = renderToStaticMarkup(
    <EmptyGuide
      figures={[
        { src: '/a.svg', alt: 'A scheme', share: 2 },
        {
          share: 3,
          stack: [
            { src: '/b.svg', alt: 'A flask' },
            { src: '/c.svg', alt: 'A plate' },
          ],
        },
      ]}
    />,
  );

  expect(html).toContain(
    '<div class="empty-guide__figures">' +
      '<figure class="empty-guide__figure" style="flex-grow:2"><img src="/a.svg" alt="A scheme" draggable="false"/></figure>' +
      '<div class="empty-guide__stack" style="flex-grow:3">' +
      '<figure class="empty-guide__figure" style="flex-grow:1"><img src="/b.svg" alt="A flask" draggable="false"/></figure>' +
      '<figure class="empty-guide__figure" style="flex-grow:1"><img src="/c.svg" alt="A plate" draggable="false"/></figure>' +
      '</div></div>',
  );
});

test('a guide with nothing to say draws no empty line for it', () => {
  const html = renderToStaticMarkup(<EmptyGuide />);

  expect(html).toBe(
    '<div class="empty-guide no-print" data-testid="empty-guide"><div class="empty-guide__figures"></div></div>',
  );
});

test('a list of keys draws one cap per key and one line per row', () => {
  const html = renderToStaticMarkup(
    <ShortcutList
      rows={[
        { keys: ['1', '2'], label: 'Set the order' },
        { keys: ['Esc'], label: 'Select' },
      ]}
    />,
  );

  expect(html.match(/<kbd>/g)).toHaveLength(3);
  expect(html.match(/shortcut-list__row/g)).toHaveLength(2);
  expect(html).toContain('<dd>Set the order</dd>');
});
