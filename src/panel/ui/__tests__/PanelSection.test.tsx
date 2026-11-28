import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PanelSection } from '../PanelSection.tsx';

test('a section is named by its title, its hint under it', () => {
  expect(
    renderToStaticMarkup(
      <PanelSection title="Spring" hint="Drag its end to stretch it.">
        <input aria-label="Stiffness" />
      </PanelSection>,
    ),
  ).toBe(
    '<section class="panel-section" aria-label="Spring"><h3 class="panel-section__title">Spring</h3><p class="panel-section__hint">Drag its end to stretch it.</p><input aria-label="Stiffness"/></section>',
  );
});

test('a section with no hint holds its title and controls only', () => {
  expect(renderToStaticMarkup(<PanelSection title="Text" />)).toBe(
    '<section class="panel-section" aria-label="Text"><h3 class="panel-section__title">Text</h3></section>',
  );
});
