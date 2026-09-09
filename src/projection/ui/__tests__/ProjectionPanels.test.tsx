/*
 * What each of the four cogs opens. The complaint the panels answer is a
 * visual one — a column of question marks, three row shapes, booleans that
 * could not be read — so the assertions here are about the shape of the
 * markup: one grid, one switch per boolean, headings only where a panel is
 * long enough to need them, and no glyph anywhere in the rows.
 */

import { getNumbers } from 'ml-dataset-iris';
import { PCA } from 'ml-pca';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { OverlayLayer } from '../../../overlay/ui/OverlayLayer.tsx';
import { pcaResult } from '../../core/pcaResult.ts';
import { PROJECTION_COPY } from '../../core/projectionCopy.ts';
import { DEFAULT_PROJECTION_OPTIONS } from '../../core/projectionOptions.ts';
import { ProjectionMapMore } from '../ProjectionMapMore.tsx';
import { ProjectionPairsMore } from '../ProjectionPairsMore.tsx';
import { ProjectionSharesMore } from '../ProjectionSharesMore.tsx';
import { ProjectionVariablesMore } from '../ProjectionVariablesMore.tsx';

const rows = getNumbers();
const IRIS = pcaResult(new PCA(rows, { scale: true }), { rows, scaled: true });

const SHARED = {
  options: DEFAULT_PROJECTION_OPTIONS,
  copy: PROJECTION_COPY,
  onChange: doNothing,
};

const MAP = (
  <ProjectionMapMore
    {...SHARED}
    result={IRIS}
    groupLabel="Species"
    hasGroups
    onZoomToSelection={doNothing}
    onResetView={doNothing}
    onClearSelection={doNothing}
  />
);

const PAIRS = (
  <ProjectionPairsMore
    {...SHARED}
    groupLabel="Species"
    hasGroups
    axisCount={4}
    width={720}
  />
);

const VARIABLES = (
  <ProjectionVariablesMore
    {...SHARED}
    axisCount={4}
    continuous={false}
    canShowEffect
    canRescale
    canPickSample={false}
  />
);

const SHARES = <ProjectionSharesMore {...SHARED} />;

const PANELS = [
  { name: 'Map', panel: MAP },
  { name: 'Every pair', panel: PAIRS },
  { name: 'What differs', panel: VARIABLES },
  { name: 'How much each explains', panel: SHARES },
] as const;

test('every panel names the figure it belongs to and offers the way back', () => {
  for (const { name, panel } of PANELS) {
    const html = draw(panel);

    expect(html).toContain(`>${name}</span>`);
    expect(html).toContain('>Reset</button>');
  }
});

test('no panel hangs a question mark off any of its rows', () => {
  for (const { panel } of PANELS) {
    expect(draw(panel)).not.toContain('help-icon');
  }
});

test('every name carries its own help, dotted, and reachable by keyboard', () => {
  const html = draw(VARIABLES);

  expect(occurrences(html, 'class="help-name"')).toBe(6);
  expect(html).toContain(
    'text-decoration:underline dotted var(--border-strong)',
  );
  expect(html).toContain('Hover a name for what it does.');
});

test('every row is a cell of one grid, so every control starts at the same x', () => {
  const html = draw(MAP);

  expect(occurrences(html, 'grid-template-columns:88px minmax(0, 1fr)')).toBe(
    5,
  );
});

test('a boolean is a switch whose state can be read without pressing it', () => {
  const html = draw(VARIABLES);

  // Both booleans start on, so both tracks carry the accent and both knobs
  // have slid to the far end of a thirty pixel track.
  expect(occurrences(html, 'background:var(--accent)')).toBe(2);
  expect(occurrences(html, 'left:14px')).toBe(2);
  expect(occurrences(html, 'aria-pressed="true"')).toBe(2);
  expect(html).not.toContain('aria-pressed="false"');
});

test('a panel gets headings once it is long enough to need them, and not before', () => {
  const map = draw(MAP);

  expect(map).toContain('>Axes</span>');
  expect(map).toContain('>Drawing</span>');
  expect(map).toContain('>Selecting</span>');
  // The first heading of a panel takes no rule: one immediately under the
  // header's own reads as a doubled line rather than as a division, so three
  // headings draw two hairlines.
  expect(occurrences(map, SECTION_RULE)).toBe(2);

  for (const short of [PAIRS, SHARES]) {
    expect(draw(short)).not.toContain('text-transform:uppercase');
  }
});

test('the map keeps its three commands under the footer rule, not among its rows', () => {
  const html = draw(MAP);
  const footer = html.indexOf(FOOTER_RULE);

  expect(footer).toBeGreaterThan(html.indexOf('Hover a name'));
  expect(html.indexOf('Zoom to selection')).toBeGreaterThan(footer);
  expect(html.indexOf('Reset view')).toBeGreaterThan(footer);
  expect(html.indexOf('Clear selection')).toBeGreaterThan(footer);
  // A command's own words are its caption, so it is never given a name column
  // as well — each of the three is written exactly once.
  expect(occurrences(html, 'Zoom to selection')).toBe(1);
  expect(occurrences(html, 'Clear selection')).toBe(1);
});

test('a name too long for the column is written short, never wrapped', () => {
  const html = draw(VARIABLES);

  expect(html).toContain('>One scale</span>');
  expect(html).toContain('>Average</span>');
  expect(html).not.toContain('>One scale for all</span>');
  // The value it chooses between is not shortened with it.
  expect(html).toContain('Strongest first');
});

/** The hairline over a section heading, which the first heading goes without. */
const SECTION_RULE =
  'border-top:1px solid var(--border);color:var(--text-faint);font-size:10px;font-weight:700';

/** The hairline the commands sit under. */
const FOOTER_RULE = 'padding:8px 12px 9px;border-top:1px solid var(--border)';

/**
 * One panel rendered to markup at the size an embedded figure draws it.
 * @param panel - The panel to draw.
 * @returns The markup.
 */
function draw(panel: ReactNode): string {
  return renderToStaticMarkup(
    <OverlayLayer density="compact">{panel}</OverlayLayer>,
  );
}

function occurrences(html: string, needle: string): number {
  return html.split(needle).length - 1;
}

function doNothing(): void {
  // The panels are the subject here; a test has no figure of its own to redraw.
}
