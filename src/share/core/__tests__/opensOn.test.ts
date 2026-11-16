import { expect, test } from 'vitest';

import type { OpensOnLinks, ShareExample } from '../opensOn.ts';
import {
  carriedScreen,
  defaultOpensOn,
  opensOnAddress,
  opensOnLinks,
} from '../opensOn.ts';

const EXAMPLES: ShareExample[] = [
  { id: 'rc', name: 'Charging a capacitor' },
  { id: 'multivibrator', name: 'Multivibrator', description: 'Two LEDs.' },
];

const OPENED_ON = ['example', 'bench'];

test('the page keeps its own parameters, and drops what it opened on', () => {
  const links = opensOnLinks('?split=60&example=rc&bench=abc', OPENED_ON, {
    example: 'rc',
  });

  expect(links).toStrictEqual({
    search: 'split=60',
    example: 'rc',
    changed: false,
    screen: undefined,
  });
});

test('an example still as it opened is named, never carried whole', () => {
  const links = opensOnLinks('', OPENED_ON, {
    example: 'rc',
    changed: false,
    screen: { entries: [['bench', 'token']] },
  });

  expect(links.screen).toBeUndefined();
  expect(defaultOpensOn(links, EXAMPLES)).toStrictEqual({
    opensOn: 'example',
    example: 'rc',
  });
  expect(
    opensOnAddress(links, { opensOn: 'example', example: 'rc' }),
  ).toStrictEqual({ search: 'example=rc', path: undefined });
});

test('a changed example travels whole when a link can carry it', () => {
  const links = opensOnLinks('?split=60', OPENED_ON, {
    example: 'multivibrator',
    changed: true,
    screen: { entries: [['bench', 'abc-_']] },
  });
  const choice = defaultOpensOn(links, EXAMPLES);

  expect(choice).toStrictEqual({ opensOn: 'screen', example: 'multivibrator' });
  expect(opensOnAddress(links, choice)).toStrictEqual({
    search: 'split=60&bench=abc-_',
    path: undefined,
  });
});

test('a changed example no link can carry opens on the example it came from', () => {
  for (const screen of [undefined, 'too-large'] as const) {
    const links = opensOnLinks('', OPENED_ON, {
      example: 'multivibrator',
      changed: true,
      screen,
    });

    expect(defaultOpensOn(links, EXAMPLES)).toStrictEqual({
      opensOn: 'example',
      example: 'multivibrator',
    });
  }
});

test('with no example on screen, the picker starts on the first one', () => {
  const blank = opensOnLinks('', OPENED_ON, {});

  expect(defaultOpensOn(blank, EXAMPLES)).toStrictEqual({
    opensOn: 'none',
    example: 'rc',
  });

  const drawn = opensOnLinks('', OPENED_ON, {
    screen: { entries: [['bench', 'xyz']] },
  });

  expect(defaultOpensOn(drawn, EXAMPLES)).toStrictEqual({
    opensOn: 'screen',
    example: 'rc',
  });
  expect(opensOnAddress(drawn, { opensOn: 'none', example: 'rc' }).search).toBe(
    '',
  );
});

test('an example the list no longer holds is not offered by default', () => {
  const links = opensOnLinks('', OPENED_ON, { example: 'renamed' });

  expect(defaultOpensOn(links, EXAMPLES)).toStrictEqual({
    opensOn: 'none',
    example: 'rc',
  });
});

test('any example can be handed out, whatever is on screen', () => {
  const links: OpensOnLinks = {
    search: 'embed=1',
    example: null,
    changed: false,
    screen: 'too-large',
  };

  expect(
    opensOnAddress(links, { opensOn: 'example', example: 'multivibrator' })
      .search,
  ).toBe('embed=1&example=multivibrator');
  // What does not fit in a link is never written.
  expect(
    opensOnAddress(links, { opensOn: 'screen', example: 'rc' }).search,
  ).toBe('embed=1');
});

test('a site writes its own link to an example, and to the page alone', () => {
  const links = opensOnLinks('?panels=1&seq=d1-p90', ['seq'], {
    example: 'cosy',
    changed: true,
    screen: { path: '/sequences/cosy', entries: [['seq', 'd1-p90']] },
  });
  const addresses = {
    example: (id: string) => ({ path: `/sequences/${id}`, entries: [] }),
    alone: { path: '/pulse', entries: [] },
  };

  expect(
    opensOnAddress(links, { opensOn: 'example', example: 'noesy' }, addresses),
  ).toStrictEqual({ search: 'panels=1', path: '/sequences/noesy' });
  expect(
    opensOnAddress(links, { opensOn: 'screen', example: 'cosy' }, addresses),
  ).toStrictEqual({ search: 'panels=1&seq=d1-p90', path: '/sequences/cosy' });
  expect(
    opensOnAddress(links, { opensOn: 'none', example: 'cosy' }, addresses),
  ).toStrictEqual({ search: 'panels=1', path: '/pulse' });
});

test('only an address is carried, never a refusal', () => {
  expect(carriedScreen(undefined)).toBeUndefined();
  expect(carriedScreen('too-large')).toBeUndefined();
  expect(carriedScreen({ entries: [['bench', 'a']] })).toStrictEqual({
    entries: [['bench', 'a']],
  });
});
