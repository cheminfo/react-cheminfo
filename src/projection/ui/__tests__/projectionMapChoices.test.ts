/*
 * What the map's two settings offer, in the two lengths the bar needs. The
 * short form is what a value menu writes under its own heading; the long form
 * is what the pointer is told and what the panel behind the chip writes out.
 */

import { expect, test } from 'vitest';

import { DEFAULT_PROJECTION_OPTIONS } from '../../core/index.ts';
import {
  projectionColourChoices,
  projectionOutlineChoices,
} from '../projectionMapChoices.ts';

test('the colour stands for the groups or for nothing, in that order', () => {
  expect(projectionColourChoices('Species', 'Nothing')).toStrictEqual([
    { value: 'group', label: 'Species' },
    { value: 'none', label: 'Nothing' },
  ]);
});

test('the outline sizes are bare shares, with the sentence on the pointer', () => {
  const choices = projectionOutlineChoices(DEFAULT_PROJECTION_OPTIONS, 'None');

  expect(choices).toStrictEqual([
    { value: 'none', label: 'None', title: 'No outlines' },
    { value: 'share:0.5', label: '50%', title: '50% of samples' },
    { value: 'share:0.9', label: '90%', title: '90% of samples' },
    { value: 'share:0.95', label: '95%', title: '95% of samples' },
    { value: 'share:0.99', label: '99%', title: '99% of samples' },
  ]);
});

test('a size asked for in spreads keeps its place, written as what it covers', () => {
  const options = {
    ...DEFAULT_PROJECTION_OPTIONS,
    ellipse: { kind: 'standardDeviations', standardDeviations: 2 },
  } as const;
  const choices = projectionOutlineChoices(options, 'None');

  // Two standard deviations is widely assumed to mean 95%; on a map it covers
  // 86%, so the bar writes 86% and the pointer says where that came from.
  expect(choices[1]).toStrictEqual({
    value: 'sd:2',
    label: '86%',
    title: '2 SD (about 86%)',
  });
  expect(choices).toHaveLength(6);
});
