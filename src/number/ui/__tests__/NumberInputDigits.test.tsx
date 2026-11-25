import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { NumberInput } from '../NumberInput.tsx';

test('a box of three digits is five characters wide, padding included, with or without its steppers', () => {
  const widths = [true, false].map((buttons) => {
    const markup = renderToStaticMarkup(
      <NumberInput value={101} digits={3} buttons={buttons} onChange={noop} />,
    );
    return /<input[^>]*style="(?<style>[^"]*)"/u.exec(markup)?.groups?.style;
  });

  expect(widths).toStrictEqual(['width:5ch', 'width:5ch']);
});

function noop(): void {
  // The width is all this test reads.
}
