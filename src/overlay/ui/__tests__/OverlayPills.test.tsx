import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { OverlayLayer } from '../OverlayLayer.tsx';
import { OverlayPills } from '../OverlayPills.tsx';
import { OverlaySegmented } from '../OverlaySegmented.tsx';

const VIEWS = [
  { value: 'map', label: 'Map', count: 150 },
  { value: 'pairs', label: 'Pairs' },
  { value: 'shares', label: 'Shares', disabled: true },
];

test('a strip of pills is a tab strip, each pill naming the panel it drives', () => {
  const html = renderToStaticMarkup(
    <OverlayPills
      label="Views"
      value="pairs"
      baseId="view"
      panelId="figure"
      options={VIEWS}
      onChange={() => null}
    />,
  );

  expect(html).toContain('role="tablist" aria-label="Views"');
  expect(html.match(/role="tab"/g)).toHaveLength(3);
  expect(html).toContain('id="view-pairs" aria-selected="true"');
  expect(html).toContain('id="view-map" aria-selected="false"');
  expect(html.match(/aria-controls="figure"/g)).toHaveLength(3);
});

test('only the pill in force is in the tab order, so the strip costs one stop', () => {
  const html = renderToStaticMarkup(
    <OverlayPills
      label="Views"
      value="pairs"
      options={VIEWS}
      onChange={() => null}
    />,
  );

  expect(html.match(/tabindex="0"/g)).toHaveLength(1);
  expect(html.match(/tabindex="-1"/g)).toHaveLength(2);
  expect(html).toContain('aria-selected="true" tabindex="0"');
});

test('a choice nothing matches still leaves the strip reachable by keyboard', () => {
  const html = renderToStaticMarkup(
    <OverlayPills
      label="Views"
      value="nowhere"
      options={VIEWS}
      onChange={() => null}
    />,
  );

  expect(html.match(/tabindex="0"/g)).toHaveLength(1);
  expect(html).toContain('>Map<');
  expect(html).toContain('aria-selected="false" tabindex="0"');
});

test('the segments sit in one sunken track, which carries no outline of its own', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer density="compact">
      <OverlayPills
        label="Views"
        value="map"
        options={VIEWS}
        onChange={() => null}
      />
    </OverlayLayer>,
  );

  expect(html).toContain(
    'height:24px;padding:2px;border-radius:7px;background:var(--surface-sunken)',
  );
  expect(html).not.toContain('border:1px solid var(--border)');
  expect(html).not.toContain('border-left');
  expect(html.match(/border:none/g)).toHaveLength(3);
});

test('the choice in force is lifted out of the track, and nothing is filled with the accent', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer density="compact">
      <OverlayPills
        label="Views"
        value="map"
        options={VIEWS}
        onChange={() => null}
      />
    </OverlayLayer>,
  );

  expect(html).toContain(
    'background:var(--surface);color:var(--text);box-shadow:var(--shadow-sm)',
  );
  expect(html).toContain('background:transparent;color:var(--text-muted)');
  expect(html).not.toContain('var(--accent');
});

test('the lift is said by the ink and the weight as well as by the shadow', () => {
  const html = renderToStaticMarkup(
    <OverlayPills
      label="Views"
      value="map"
      options={VIEWS}
      onChange={() => null}
    />,
  );

  expect(html.match(/font-weight:600/g)).toHaveLength(1);
  expect(html.match(/font-weight:500/g)).toHaveLength(3);
  expect(html.match(/box-shadow:var\(--shadow-sm\)/g)).toHaveLength(1);
});

test('a count rides after its label, and a pill without one writes nothing', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer density="compact">
      <OverlayPills
        label="Views"
        value="map"
        options={VIEWS}
        onChange={() => null}
      />
    </OverlayLayer>,
  );

  expect(html).toContain('font-variant-numeric:tabular-nums');
  expect(html).toContain('>150</span>');
  expect(html).toContain('>Pairs</button>');
});

test('a choice that does not apply keeps its place and cannot be taken', () => {
  const html = renderToStaticMarkup(
    <OverlayPills
      label="Views"
      value="map"
      options={VIEWS}
      onChange={() => null}
    />,
  );

  expect(html.match(/disabled=""/g)).toHaveLength(1);
  expect(html).toContain('>Shares</button>');
  expect(html).toContain('cursor:default;opacity:0.6');
});

test('a segmented control is the same device, announced as a set of choices', () => {
  const html = renderToStaticMarkup(
    <OverlaySegmented
      label="View"
      value="map"
      options={[
        { value: 'map', label: 'Map' },
        { value: 'shares', label: 'Shares' },
      ]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('role="radiogroup" aria-label="View"');
  expect(html.match(/role="radio"/g)).toHaveLength(2);
  expect(html).toContain('aria-checked="true"');
  expect(html).not.toContain('aria-selected');
  expect(html).toContain('background:var(--surface-sunken)');
});

test('a setting is the same track one size down, and the type does not shrink with it', () => {
  const strip = renderToStaticMarkup(
    <OverlayPills
      label="Views"
      value="map"
      options={VIEWS}
      onChange={() => null}
    />,
  );
  const setting = renderToStaticMarkup(
    <OverlaySegmented
      label="View"
      value="map"
      options={[
        { value: 'map', label: 'Map' },
        { value: 'shares', label: 'Shares' },
      ]}
      onChange={() => null}
    />,
  );

  expect(strip).toContain('height:30px;padding:2px;border-radius:8px');
  expect(setting).toContain('height:26px;padding:2px;border-radius:8px');
  expect(strip).toContain('height:26px;padding:0 10px');
  expect(setting).toContain('height:22px;padding:0 8px');
  expect(strip.match(/font-size:12px/g)).toHaveLength(3);
  expect(setting.match(/font-size:12px/g)).toHaveLength(2);
});

test('a segmented control the figure cannot use greys every choice at once', () => {
  const html = renderToStaticMarkup(
    <OverlaySegmented
      label="View"
      value="map"
      disabled
      options={[
        { value: 'map', label: 'Map' },
        { value: 'shares', label: 'Shares' },
      ]}
      onChange={() => null}
    />,
  );

  expect(html.match(/disabled=""/g)).toHaveLength(2);
});
