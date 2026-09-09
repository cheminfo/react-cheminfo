/*
 * What the one bar over the figure holds, tab by tab. It is rendered through
 * the viewer because that is the only place it exists: the bar belongs to the
 * component rather than to any tab, and what a tab puts in it is exactly what
 * this checks.
 */

import { getClasses, getNumbers } from 'ml-dataset-iris';
import { PCA } from 'ml-pca';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type {
  ProjectionResult,
  ProjectionSamples,
  ProjectionTab,
} from '../../core/index.ts';
import { pcaResult } from '../../core/index.ts';
import { ProjectionViewer } from '../ProjectionViewer.tsx';

const rows = getNumbers();
const IRIS: ProjectionResult = pcaResult(new PCA(rows, { scale: true }), {
  rows,
  scaled: true,
});
const SAMPLES: ProjectionSamples = {
  ids: rows.map((_, index) => `flower-${index + 1}`),
  groups: getClasses(),
  groupLabel: 'Species',
};

test('the pair grid puts one stepper on the bar and its colours behind the cog', () => {
  const html = draw('pairs');

  expect(html).toContain('Components');
  expect(html).toContain('aria-label="Increase Components"');
  expect(html).not.toContain('Dot size');
  expect(html).not.toContain('Colour by');
});

test('the panels put the one control that changes their meaning on the bar', () => {
  const html = draw('variables');

  // The setting is written as the view it is on rather than as a caption
  // beside a box, so the bar answers "what am I looking at" before it is
  // pressed. Its name rides on the button, for the pointer and the reader
  // walking by keyboard.
  expect(html).toContain('aria-label="Show — Effect on a sample"');
  expect(html).toContain('>Effect on a sample</span>');
  // At this width the row is one glyph short of writing the key word in front
  // of the value: the save glyph rides every tab, and what a bar short of room
  // gives up is words rather than controls.
  expect(html).not.toContain('>Show</span>');
  expect(html).not.toContain('One scale for all');
  expect(html).not.toContain('Bar order');
});

test('the shares figure writes its one value on the bar and names it behind the cog', () => {
  const html = draw('shares');

  expect(html).toContain('aria-label="Increase Target"');
  // Twice: the named end of the bar, and the cog at the end of it. The panel
  // behind that cog is the only place the target is called anything, carries
  // the sentence saying what it marks, and can be put back where it started.
  expect(occurrences(html, 'aria-label="Options"')).toBe(2);
  expect(html).toContain('aria-haspopup="menu"');
  // A shut popover draws none of its contents, so nothing of the panel is in
  // the page until the reader opens it.
  expect(html).not.toContain('Hover a name for what it does.');
});

test('a figure short of room drops the key words and never the settings', () => {
  // The viewer has not been measured in a string render, so it is drawn at the
  // width a single column of a page usually gives it — too narrow for the map
  // to write a key word in front of each value, and wide enough to keep both
  // values on the row.
  const html = draw('map');

  expect(occurrences(html, 'role="tab"')).toBe(4);
  expect(html).toContain('aria-label="Options"');
  expect(html).toContain('aria-label="Colour by — Species"');
  expect(html).toContain('aria-label="Group outlines — 95%"');
  expect(html).toContain('>Species</span>');
  expect(html).toContain('>95%</span>');
  // Written on the bar the reader sees only the two answers: the names are on
  // the buttons and over the menus they open.
  expect(html).not.toContain('>Colour</span>');
  expect(html).not.toContain('>Outlines</span>');
});

function draw(tab: ProjectionTab): string {
  return renderToStaticMarkup(
    <ProjectionViewer result={IRIS} samples={SAMPLES} tab={tab} />,
  );
}

function occurrences(html: string, needle: string): number {
  return html.split(needle).length - 1;
}
