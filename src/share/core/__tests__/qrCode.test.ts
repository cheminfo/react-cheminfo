import { expect, test } from 'vitest';

import { qrCodeSvg } from '../qrCode.ts';

test('a share link is a file of its own size, with the quiet zone around it', () => {
  const code = qrCodeSvg(
    'https://smiles.cheminfo.org/exercises?set=alkanes&embed=1',
  );

  // Version 4 is 33 modules, plus four of quiet zone on each side, at 8 px.
  expect(code?.width).toBe(328);
  expect(code?.height).toBe(328);
  expect(code?.markup.startsWith('<svg width="328" height="328" ')).toBe(true);
  expect(code?.markup).toContain('viewBox="0 0 328 328"');
  expect(code?.markup).toContain(
    '<rect fill="white" width="328" height="328"/>',
  );
});

test('the longest link a code holds is still drawn, and a longer one is refused', () => {
  // Version 40 at error correction M holds 2331 bytes.
  expect(qrCodeSvg('x'.repeat(2331))?.width).toBe(1480);
  expect(qrCodeSvg('x'.repeat(2332))).toBeNull();
});
