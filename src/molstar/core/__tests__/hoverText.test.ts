/**
 * The label of whatever is not an atom, in molstar's own words but as plain
 * text: the markup its label providers write is resolved, and the loci that
 * stand for nothing, or for everything, say nothing.
 */

import { Sphere3D } from 'molstar/lib/mol-math/geometry.js';
// Lowercased on import: it is a factory, not a constructor.
import {
  DataLoci as dataLoci,
  EmptyLoci,
  EveryLoci,
} from 'molstar/lib/mol-model/loci.js';
import { expect, test } from 'vitest';

import { lociText } from '../hover.ts';

test('a drawing’s own label is read without its markup or its entities', () => {
  const loci = dataLoci(
    'orbital',
    {},
    [0],
    () => Sphere3D.zero(),
    () => '<b>C1</b>&nbsp;sp³   σ to <i>H5</i> &amp; (+)',
  );

  expect(lociText(loci)).toBe('C1 sp³ σ to H5 & (+)');
});

test('a label of markup alone says nothing', () => {
  const loci = dataLoci(
    'blank',
    {},
    [0],
    () => Sphere3D.zero(),
    () => '<span></span>&nbsp;',
  );

  expect(lociText(loci)).toBeNull();
});

test('nothing and everything have no label to show', () => {
  expect(lociText(EmptyLoci)).toBeNull();
  expect(lociText(EveryLoci)).toBeNull();
});
