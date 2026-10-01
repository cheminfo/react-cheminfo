import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { AtomicOrbitalControls } from '../AtomicOrbitalControls.tsx';

function attributesOf(html: string, name: string): string[] {
  const pattern = new RegExp(`${name}="(?<value>[^"]+)"`, 'g');
  return [...html.matchAll(pattern)].map((match) => match.groups?.value ?? '');
}

test('the canvas offers the frame, the spin and the way back to the framing', () => {
  const html = renderToStaticMarkup(
    <AtomicOrbitalControls
      axes
      onToggleAxes={() => undefined}
      spinning={false}
      onToggleSpin={() => undefined}
      onResetView={() => undefined}
    />,
  );

  expect(attributesOf(html, 'aria-label')).toStrictEqual([
    'Show the x, y, z axes',
    'Spin the orbital',
    'Reset the view',
  ]);
  expect(html).toContain('aria-pressed="false"');
});

test('a turning orbital says so on its button', () => {
  const html = renderToStaticMarkup(
    <AtomicOrbitalControls
      axes={false}
      onToggleAxes={() => undefined}
      spinning
      onToggleSpin={() => undefined}
      onResetView={() => undefined}
    />,
  );

  expect(attributesOf(html, 'aria-pressed')).toStrictEqual(['false', 'true']);
});
