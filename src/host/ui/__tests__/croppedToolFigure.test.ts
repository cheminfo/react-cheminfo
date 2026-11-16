import { expect, test } from 'vitest';

import { croppedToolFigure } from '../croppedToolFigure.ts';

test('a drawing in points is handed back as it came', async () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="40pt" height="20pt"><path d="M0 0h40"/></svg>';

  await expect(croppedToolFigure(svg)).resolves.toBe(svg);
});

test('a document stating no size is handed back as it came', async () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h40"/></svg>';

  await expect(croppedToolFigure(svg)).resolves.toBe(svg);
});
