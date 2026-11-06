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
