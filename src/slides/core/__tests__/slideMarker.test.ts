import { expect, test } from 'vitest';

import {
  parseMarkerOptions,
  readEndSites,
  readSlideGlyph,
  takeSlideMarker,
} from '../slideMarker.ts';

test('a marker is read and taken out of the slide', () => {
  const taken = takeSlideMarker(
    '<!-- spectrum: ethyl-acetate step=kinds -->\n\n## 1 · How many kinds of ¹H?\n\n- Three',
    'spectrum',
  );

  expect(taken).toStrictEqual({
    value: 'ethyl-acetate step=kinds',
    body: '## 1 · How many kinds of ¹H?\n\n- Three',
  });
});

test('a marker running over several lines keeps its lines', () => {
  const taken = takeSlideMarker(
    '## Two\n\n<!-- molecules:\nCaffeine Cn1cnc2c1c(=O)n(C)c(=O)n2C\nEthyl acetate CC(=O)OCC\n-->',
    'molecules',
  );

  expect(taken).toStrictEqual({
    value: 'Caffeine Cn1cnc2c1c(=O)n(C)c(=O)n2C\nEthyl acetate CC(=O)OCC',
    body: '## Two',
  });
});

test('a slide without the marker comes back unchanged, other comments kept', () => {
  const body = '## Title\n\n<!-- zeeman: 9.4 -->';

  expect(takeSlideMarker(body, 'spectrum')).toStrictEqual({
    value: undefined,
    body,
  });
});

test('a marker written with no value reads as empty', () => {
  expect(
    takeSlideMarker('<!-- coupling-tree: -->\n## Split', 'coupling-tree'),
  ).toStrictEqual({
    value: '',
    body: '## Split',
  });
});

test('only the marker asked for is taken away', () => {
  const body = '<!-- timer: 90 -->\n<!-- glyph: ring -->\n## A';

  expect(takeSlideMarker(body, 'timer')).toStrictEqual({
    value: '90',
    body: '<!-- glyph: ring -->\n## A',
  });
});

test('a name that is no marker name is refused', () => {
  expect(() => takeSlideMarker('', 'spectrum.*')).toThrow(
    '"spectrum.*" is not a marker name',
  );
});

test('the options of a marker are read after its subject', () => {
  expect(
    parseMarkerOptions('ethyl-acetate  step=couplings Frequency=60,400 stray'),
  ).toStrictEqual({
    subject: 'ethyl-acetate',
    options: { step: 'couplings', frequency: '60,400' },
  });
});

test('a marker with options only has no subject', () => {
  expect(parseMarkerOptions('step=kinds')).toStrictEqual({
    subject: '',
    options: { step: 'kinds' },
  });
  expect(parseMarkerOptions('')).toStrictEqual({ subject: '', options: {} });
});

test('the glyph marker is taken out of the body, whatever case it was written in', () => {
  const read = readSlideGlyph(
    '# 3 · Your own course\n\n<!-- glyph: Any-Screen -->',
  );

  expect(read.glyph).toBe('any-screen');
  expect(read.body).toBe('# 3 · Your own course');
  expect(
    readSlideGlyph('<!-- glyph: ring -->\n\n# 1 · Structures'),
  ).toStrictEqual({ glyph: 'ring', body: '# 1 · Structures' });
});

test('a slide with no glyph marker keeps its body whole', () => {
  expect(readSlideGlyph('# 1 · The first year')).toStrictEqual({
    glyph: '',
    body: '# 1 · The first year',
  });
});

test('a closing slide names the sites it shows, and the recap is what is left', () => {
  const body = '# Covered\n\n- one\n\n<!-- sites: write, draw -->';

  expect(readEndSites(body)).toStrictEqual({
    sites: ['write', 'draw'],
    body: '# Covered\n\n- one',
  });
  expect(readEndSites('# Nothing').sites).toStrictEqual([]);
  expect(readEndSites('<!-- sites: , glassware ,, -->').sites).toStrictEqual([
    'glassware',
  ]);
});
