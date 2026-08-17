import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { StructureEditor } from '../StructureEditor.tsx';

function noop(): void {
  // The editor reports nothing while it is only being rendered to markup.
}

test('the canvas is positioned out of the container’s height computation', () => {
  const markup = renderToStaticMarkup(<StructureEditor onChange={noop} />);

  expect(markup).toContain('position:relative');
  expect(markup).toContain('position:absolute');
  expect(markup).toContain('inset:0');
});

test('the container takes the class and the style the site gives it', () => {
  const markup = renderToStaticMarkup(
    <StructureEditor
      onChange={noop}
      className="draw-card__editor"
      style={{ borderRadius: 0 }}
    />,
  );

  expect(markup).toContain('class="draw-card__editor"');
  expect(markup).toContain('border-radius:0');
  // The packaged style is still underneath the one the site merged over it.
  expect(markup).toContain('overflow:hidden');
});
