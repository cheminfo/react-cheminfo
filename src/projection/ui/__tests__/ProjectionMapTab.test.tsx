/*
 * The map as a reader meets it, which is through the viewer: the tab draws the
 * picture but the key it floats and the words behind its question mark are
 * built above it, so a test rendering the tab alone could be handed chrome the
 * viewer never builds.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/index.ts';
import {
  CHART_TICK_ROOM,
  CHART_TITLE_ROOM,
} from '../../../chart/ui/chartStyles.ts';
import type {
  ProjectionOptions,
  ProjectionResult,
  ProjectionSamples,
} from '../../core/index.ts';
import { ProjectionViewer } from '../ProjectionViewer.tsx';
import { PROJECTION_PLOT_ROOM } from '../projectionTabStyles.ts';

const SCORES = rowMatrix([
  [-2.6, 0.3],
  [-2.1, -0.2],
  [-2.35, 0.25],
  [1.3, 0.7],
  [1.8, -0.4],
  [1.5, 0.2],
]);

const RESULT: ProjectionResult = {
  method: 'Principal components',
  axes: [
    { name: 'PC1', share: 0.7296 },
    { name: 'PC2', share: 0.2285 },
  ],
  scores: SCORES,
};

const SAMPLES: ProjectionSamples = {
  ids: ['a', 'b', 'c', 'd', 'e', 'f'],
  groups: ['setosa', 'setosa', 'setosa', 'virginica', 'virginica', 'virginica'],
  groupLabel: 'Species',
};

test('the key names what the colour means, in one line and no more', () => {
  const html = draw();

  expect(html).toContain('Colour = species.');
  expect(html).toContain('setosa (3)');
  expect(html).toContain('virginica (3)');
  // The sentence about what an outline holds is behind the question mark, so
  // the key stays one line over the dots.
  expect(html).not.toContain('assuming the group is roughly bell-shaped');
});

test('the map draws one dot per sample, coloured by its group', () => {
  const html = draw();

  expect(countOf(html, DOT)).toBe(6);
  expect(countOf(html, `${DOT} fill="#0072b2"`)).toBe(3);
  expect(countOf(html, `${DOT} fill="#d55e00"`)).toBe(3);
});

test('a sample in no group is drawn in the one ink that names nothing', () => {
  const html = draw({
    samples: {
      ids: SAMPLES.ids,
      groups: ['setosa', 'setosa', 'setosa', undefined, undefined, undefined],
      groupLabel: 'Species',
    },
  });

  expect(countOf(html, `${DOT} fill="var(--text-faint)"`)).toBe(3);
});

test('a selected dot gains an accent ring and keeps its group colour', () => {
  const html = draw({ selected: ['a'] });

  expect(countOf(html, 'stroke="var(--accent)"')).toBe(1);
  expect(countOf(html, `${DOT} fill="#0072b2"`)).toBe(3);
});

test('an axis is titled the way every figure in the package titles one', () => {
  const html = draw();

  expect(html).toContain('PC1 — 73.0 %');
  expect(html).toContain('PC2 — 22.9 %');
});

test('rows the model never saw are drawn hollow and named in the key', () => {
  const html = draw({ result: { ...RESULT, fittedCount: 4 } });

  expect(countOf(html, `${DOT} fill="none"`)).toBe(2);
  expect(html).toContain('Hollow = added after the map was built');
});

test('every row builds the model unless the result says otherwise', () => {
  const html = draw();

  expect(countOf(html, `${DOT} fill="none"`)).toBe(0);
  expect(html).not.toContain('Hollow = added after the map was built');
});

test('a group too small to outline says so in the key', () => {
  const overrides = {
    result: {
      ...RESULT,
      scores: rowMatrix([
        [-2.6, 0.3],
        [-2.1, -0.2],
        [-2.4, 0.1],
        [1.3, 0.7],
        [1.8, -0.4],
      ]),
    },
    samples: {
      ids: ['a', 'b', 'c', 'd', 'e'],
      groups: ['setosa', 'setosa', 'setosa', 'virginica', 'virginica'],
      groupLabel: 'Species',
    },
  };

  expect(draw(overrides)).toContain('Not outlined: too few samples.');
});

test('the visible end of the bar is two controls and the rest is behind the cog', () => {
  const html = draw();

  expect(html).toContain('Colour by');
  expect(html).toContain('Group outlines');
  expect(html).not.toContain('Dot size');
  expect(html).not.toContain('Zoom to selection');
});

test('the key floats inside the plot, clear of both axis labels', () => {
  const html = draw();

  // It is placed in a layer covering the plot rectangle rather than the
  // figure's own box, so no corner it can choose reaches the ticks written
  // down the left or the title written under the foot.
  expect(countOf(html, `left:${PROJECTION_PLOT_ROOM.left}px`)).toBe(1);
  expect(PROJECTION_PLOT_ROOM.left).toBeGreaterThanOrEqual(
    CHART_TICK_ROOM.left + CHART_TITLE_ROOM.left,
  );
  expect(PROJECTION_PLOT_ROOM.bottom).toBeGreaterThanOrEqual(
    CHART_TICK_ROOM.bottom + CHART_TITLE_ROOM.bottom,
  );
});

test('the outline size is written on the bar as a share of the samples', () => {
  const html = draw();

  // The bar writes the answer and leaves the question to the button's own
  // name, so a reader scanning the figure reads how wide the rings are drawn
  // without opening anything. A number of standard deviations is never
  // written: on a map two of them cover about 86 % and not the 95 % everyone
  // has been taught, so the share is the only honest way to say it.
  expect(html).toContain('title="Group outlines — 95%"');
  expect(countOf(html, '>95%</span>')).toBe(1);
  expect(html).not.toContain('SD');
});

test('colouring by nothing leaves one ink and no colour key at all', () => {
  const html = draw({ options: { colorBy: 'none' } });

  expect(countOf(html, `${DOT} fill="var(--text-faint)"`)).toBe(6);
  expect(html).not.toContain('Colour = species');
  expect(html).not.toContain('setosa (3)');
});

test('a reference point is drawn and named beside the groups it sits among', () => {
  const html = draw({
    result: {
      ...RESULT,
      markers: [
        { label: 'Centre of cluster 1', position: [-2.3, 0.1], group: 0 },
      ],
    },
  });

  expect(html).toContain('data-mark="Centre of cluster 1"');
  expect(countOf(html, 'Centre of cluster 1')).toBe(2);
});

test('the group averages are named once they are drawn', () => {
  const html = draw({ options: { showGroupMeans: true } });

  expect(html).toContain('Group averages');
  expect(countOf(html, 'data-mark="Group average"')).toBe(2);
});

test('the map never writes either of the two words kept out of the interface', () => {
  const html = draw({ options: { showGroupMeans: true } });

  expect(html).not.toContain('reconstructed');
  expect(html).not.toContain('variance');
});

/** What a sample's own dot looks like, whatever colour it takes. */
const DOT = 'r="3.5"';

interface DrawOverrides {
  result?: ProjectionResult;
  samples?: ProjectionSamples;
  options?: Partial<ProjectionOptions>;
  selected?: readonly string[];
}

function draw(overrides: DrawOverrides = {}): string {
  const result = overrides.result ?? RESULT;
  return renderToStaticMarkup(
    <ProjectionViewer
      result={result}
      samples={overrides.samples ?? SAMPLES}
      options={overrides.options}
      selected={overrides.selected}
    />,
  );
}

function countOf(html: string, needle: string): number {
  return html.split(needle).length - 1;
}
