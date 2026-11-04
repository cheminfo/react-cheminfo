import { expect, test } from 'vitest';

import {
  MAX_FIGURE_INPUT_BYTES,
  packFigureInput,
  unpackFigureInput,
} from '../figureInputs.ts';

test('a value comes back as it was packed, and a long text packs smaller', async () => {
  const jdx = Array.from(
    { length: 2000 },
    (_, index) => `${400 + index},${(index % 97) / 100}`,
  ).join('\n');
  const value = { jdx, filename: 'sample.jdx', peaks: [{ wavenumber: 1715 }] };

  const packed = await packFigureInput(value);

  expect(packed).toMatch(/^[\w+/]+=*$/);
  expect(packed.length).toBeLessThan(jdx.length / 2);
  await expect(unpackFigureInput(packed)).resolves.toStrictEqual(value);
  // White space a pretty printer added is ignored.
  await expect(
    unpackFigureInput(packed.replaceAll(/(?<line>.{76})/g, '$<line>\n  ')),
  ).resolves.toStrictEqual(value);
});

test('what is not a packed value is refused', async () => {
  await expect(unpackFigureInput('not base64!')).rejects.toThrow(
    'The value is not written in base64.',
  );
  await expect(unpackFigureInput('AAAA')).rejects.toThrow(Error);
});

test('a value that would unpack past the limit is refused', async () => {
  const packed = await packFigureInput('0'.repeat(MAX_FIGURE_INPUT_BYTES + 1));

  expect(packed.length).toBeLessThan(100_000);
  await expect(unpackFigureInput(packed)).rejects.toThrow(
    'The value unpacks larger than allowed.',
  );
});
