import { expect, test } from 'vitest';

import { OPENCHEMLIB_WORK } from '../../../citation/core/openchemlibPaper.ts';
import { PLATFORM_WORK } from '../../../citation/core/platformPaper.ts';
import { connectHost } from '../connectHost.ts';
import { readCitedWorks, readToolHelp } from '../toolCredits.ts';
import { readHello } from '../toolMessages.ts';

const HELP = {
  title: 'Conformers',
  body: ['Each row is one shape the molecule can take.'],
  link: 'https://3d.cheminfo.org/about',
};

function noListener() {
  return stopNothing;
}

function stopNothing() {
  // Nothing was listening.
}

test('a hello carries the works to cite and the help, read back as sent', () => {
  const posted: unknown[] = [];
  const stop = connectHost({
    host: {
      postMessage: (message) => {
        posted.push(message);
      },
    },
    listen: noListener,
    tool: { name: '3d', inputs: [], outputs: [] },
    origin: 'https://3d.cheminfo.org',
    build: null,
    cite: [PLATFORM_WORK, OPENCHEMLIB_WORK],
    help: HELP,
    load: () => undefined,
  });
  stop();

  const hello = readHello(posted[0]);

  expect(hello?.cite).toStrictEqual([PLATFORM_WORK, OPENCHEMLIB_WORK]);
  expect(hello?.help).toStrictEqual(HELP);
});

test('a hello that names no works and no help carries neither', () => {
  const hello = readHello({
    type: 'cheminfo:hello',
    version: 1,
    tool: { name: 'osiris', origin: 'https://osiris.cheminfo.org' },
  });

  expect(hello).not.toHaveProperty('cite');
  expect(hello).not.toHaveProperty('help');
});

test('a work whose reference is incomplete is dropped, the others kept', () => {
  const { reference } = OPENCHEMLIB_WORK;
  const works = readCitedWorks([
    { what: 'No reference' },
    { what: 'No DOI', reference: { ...reference, doi: 3 } },
    { what: 'Another kind', reference: { ...reference, kind: 'book' } },
    {
      what: 'A dataset',
      reference: {
        kind: 'dataset',
        authors: [{ given: 'A.', family: 'B' }, 'C'],
        title: 'Spectra',
        repository: 'Zenodo',
        year: 2024,
        doi: '10.5281/zenodo.1',
      },
    },
    OPENCHEMLIB_WORK,
  ]);

  const [dataset, openchemlib] = works ?? [];

  expect(dataset?.what).toBe('A dataset');
  expect(openchemlib).toStrictEqual(OPENCHEMLIB_WORK);
  expect(works).toHaveLength(2);
  expect(dataset?.reference.authors).toStrictEqual([
    { given: 'A.', family: 'B' },
  ]);
  expect(readCitedWorks([{ what: 'No reference' }])).toBeUndefined();
  expect(readCitedWorks('PLATFORM_WORK')).toBeUndefined();
});

test('help keeps three paragraphs, cuts a long one, and drops a link that is not a web address', () => {
  const help = readToolHelp({
    title: 'Predictions',
    body: ['One', 2, 'Two', 'Three', 'Four', 'x'.repeat(600)],
    link: 'data:text/html,<p>no</p>',
  });

  expect(help).toStrictEqual({
    title: 'Predictions',
    body: ['One', 'Two', 'Three'],
  });
  expect(
    readToolHelp({ title: 'Long', body: ['x'.repeat(600)] })?.body[0],
  ).toHaveLength(500);
  expect(readToolHelp({ title: 'Empty', body: [] })).toBeUndefined();
});
