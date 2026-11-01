import { expect, test } from 'vitest';

import { toolAboutUrl, toolPageUrl } from '../toolPage.ts';

test("a framed tool's own page drops the framing and keeps its own parameters", () => {
  expect(
    toolPageUrl(
      'https://iupac-name.cheminfo.org/converter?embed=1&hide=editor&direction=structure-to-name',
    ),
  ).toBe(
    'https://iupac-name.cheminfo.org/converter?direction=structure-to-name',
  );
  expect(
    toolPageUrl('https://3d.cheminfo.org/?embed=1&hide=intro,editor,options'),
  ).toBe('https://3d.cheminfo.org/');
  expect(
    toolPageUrl('https://smiles.cheminfo.org/?smiles=CC[N+](C)C&embed'),
    // The plus stays a plus, rather than turning into a space.
  ).toBe('https://smiles.cheminfo.org/?smiles=CC%5BN%2B%5D(C)C');
});

test("a framed tool's About is the About of its site, framed", () => {
  expect(
    toolAboutUrl('https://lcao.cheminfo.org/playground?embed=1&hide=structure'),
  ).toBe('https://lcao.cheminfo.org/about?embed=1');
  expect(toolAboutUrl('http://localhost:10819/?embed=1')).toBe(
    'http://localhost:10819/about?embed=1',
  );
});
