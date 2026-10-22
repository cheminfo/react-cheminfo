import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { Molecule3DStage } from '../Molecule3DStage.tsx';

test('a style object is the box, whatever the screen', () => {
  const html = renderToStaticMarkup(
    <Molecule3DStage style={{ height: 320 }}>
      {() => <span>canvas</span>}
    </Molecule3DStage>,
  );

  expect(html).toBe('<div style="height:320px"><span>canvas</span></div>');
});

test('a style function is told the box does not fill the screen yet', () => {
  const html = renderToStaticMarkup(
    <Molecule3DStage
      style={(fillsScreen) => ({ height: fillsScreen ? '100%' : 320 })}
    >
      {(fullscreen) => (
        <span>{fullscreen === undefined ? 'cannot fill' : 'can fill'}</span>
      )}
    </Molecule3DStage>,
  );

  expect(html).toBe('<div style="height:320px"><span>cannot fill</span></div>');
});
