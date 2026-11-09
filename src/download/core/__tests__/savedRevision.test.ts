import { afterEach, expect, test } from 'vitest';

import { setFigureRevision } from '../figureRevision.ts';
import { readFigureSource, withFigureSource } from '../figureSource.ts';
import { savedRevisionAddress } from '../savedRevision.ts';

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20"/></svg>';

const SAVED = 'https://1a2b3c4d.draw-cheminfo.pages.dev';
const RUNNING = 'https://9f8e7d6c.draw-cheminfo.pages.dev';

const forgets: Array<() => void> = [];

afterEach(() => {
  while (forgets.length > 0) forgets.pop()?.();
});

function run(site: string, deployment: string | undefined): void {
  forgets.push(setFigureRevision(site, { version: '1.0.0', deployment }));
}

function savedBy(revision: string, site = 'draw'): Promise<string> {
  return withFigureSource(FIGURE, {
    site,
    href: `https://${site}.cheminfo.org/edit?panel=atoms`,
    revision,
  });
}

test('a figure written on a Pages deployment of its site records that deployment', async () => {
  run('draw', `${RUNNING}/`);

  const own = await withFigureSource(FIGURE, {
    site: 'draw',
    href: 'https://draw.cheminfo.org/',
  });
  const other = await withFigureSource(FIGURE, {
    site: 'glassware',
    href: 'https://glassware.cheminfo.org/',
  });

  expect(readFigureSource(own)).toStrictEqual({
    site: 'draw',
    href: 'https://draw.cheminfo.org/',
    revision: RUNNING,
  });
  expect(readFigureSource(other)).toStrictEqual({
    site: 'glassware',
    href: 'https://glassware.cheminfo.org/',
  });
});

test('a figure written off Pages records no deployment', async () => {
  run('draw', undefined);

  const figure = await withFigureSource(FIGURE, {
    site: 'draw',
    href: 'https://draw.cheminfo.org/',
  });

  expect(readFigureSource(figure)).toStrictEqual({
    site: 'draw',
    href: 'https://draw.cheminfo.org/',
  });
});

test('a figure saved by another deployment of the site opens there, on its page', async () => {
  run('draw', RUNNING);

  expect(savedRevisionAddress(await savedBy(SAVED), 'draw')).toBe(
    `${SAVED}/edit?panel=atoms`,
  );
});

test('the deployment running, or none running, offers nothing to go back to', async () => {
  const figure = await savedBy(SAVED);

  expect(savedRevisionAddress(figure, 'draw')).toBeUndefined();

  run('draw', SAVED);

  expect(savedRevisionAddress(figure, 'draw')).toBeUndefined();
  expect(savedRevisionAddress(FIGURE, 'draw')).toBeUndefined();
});

test('a deployment outside the running project, or of another site, is never opened', async () => {
  run('draw', RUNNING);

  const figures = await Promise.all(
    [
      'https://1a2b3c4d.attacker.pages.dev',
      'https://evil.example.org',
      SAVED.replace('https:', 'http:'),
      'https://a.b.draw-cheminfo.pages.dev',
      'https://draw-cheminfo.pages.dev',
      'not an address',
    ].map((revision) => savedBy(revision)),
  );
  for (const figure of figures) {
    expect(savedRevisionAddress(figure, 'draw')).toBeUndefined();
  }

  expect(
    savedRevisionAddress(await savedBy(SAVED, 'glassware'), 'draw'),
  ).toBeUndefined();
});

test('a site running off a Pages deployment trusts no recorded one', async () => {
  run('draw', 'https://draw.cheminfo.org');

  expect(
    savedRevisionAddress(
      await savedBy('https://draw.cheminfo.org.evil'),
      'draw',
    ),
  ).toBeUndefined();
  expect(savedRevisionAddress(await savedBy(SAVED), 'draw')).toBeUndefined();
});
