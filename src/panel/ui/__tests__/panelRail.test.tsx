import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { RailPanel } from '../PanelRail.tsx';
import { PanelRail } from '../PanelRail.tsx';

const PANELS: Array<RailPanel<'glycan' | 'fragments'>> = [
  { id: 'glycan', icon: 'properties', title: 'Glycan' },
  { id: 'fragments', icon: 'cut', title: 'Fragments' },
];

test('two rails offering the same panels give no element the same id', () => {
  // A glycan editor beside a mass viewer that was handed its panels, as AGA2S
  // lays them out.
  const markup = renderToStaticMarkup(
    <>
      <PanelRail
        panels={PANELS}
        openIds={['fragments']}
        onToggle={() => undefined}
      />
      <PanelRail panels={PANELS} openIds={[]} onToggle={() => undefined} />
    </>,
  );
  const ids = Array.from(
    markup.matchAll(/ id="(?<id>[^"]+)"/g),
    (match) => match.groups?.id,
  );

  expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toStrictEqual(
    [],
  );
  // Each rail still says which panel each of its buttons opens.
  expect(markup.split('data-panel-id="fragments"')).toHaveLength(3);
});
