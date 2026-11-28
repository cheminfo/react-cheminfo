import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { inPageSlideLink } from '../inPageSlideLink.tsx';

interface FakeClick {
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  prevented: boolean;
  preventDefault: () => void;
}

function click(modifier: Partial<FakeClick> = {}): FakeClick {
  const event: FakeClick = {
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    prevented: false,
    preventDefault() {
      event.prevented = true;
    },
    ...modifier,
  };
  return event;
}

function press(element: ReactElement, event: FakeClick): void {
  (element.props as { onClick: (event: FakeClick) => void }).onClick(event);
}

test('a plain click follows the address in the page', () => {
  const opened: string[] = [];
  const renderLink = inPageSlideLink((href) => {
    opened.push(href);
    return true;
  });
  const link = renderLink({ href: '/?from=talk:a:2', children: 'Open' });
  const event = click();
  press(link, event);

  expect(renderToStaticMarkup(link)).toBe(
    '<a class="slide-demo" href="/?from=talk:a:2">Open</a>',
  );
  expect(opened).toStrictEqual(['/?from=talk:a:2']);
  expect(event.prevented).toBe(true);
});

test('a modified click is the browser’s, and so is an address the site declines', () => {
  const opened: string[] = [];
  const renderLink = inPageSlideLink((href) => {
    opened.push(href);
    return href !== '/docs';
  });

  const modified = click({ metaKey: true });
  press(renderLink({ href: '/x', children: 'X' }), modified);
  const declined = click();
  press(renderLink({ href: '/docs', children: 'Docs' }), declined);

  expect(opened).toStrictEqual(['/docs']);
  expect(modified.prevented).toBe(false);
  expect(declined.prevented).toBe(false);
});

test('the anchor may carry another address for a middle click', () => {
  const renderLink = inPageSlideLink(() => true, {
    href: (href) => `/pdb${href}`,
  });

  expect(
    renderToStaticMarkup(renderLink({ href: '/viewer?id=1', children: 'V' })),
  ).toBe('<a class="slide-demo" href="/pdb/viewer?id=1">V</a>');
});
