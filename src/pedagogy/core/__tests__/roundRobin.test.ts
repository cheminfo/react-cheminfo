import { expect, test } from 'vitest';

import { drawRoundRobin, kindSeed } from '../roundRobin.ts';

// nmr.cheminfo.org's nuclear-spin series as its `POOLS` held them at ff07b41,
// kind by kind in the order its series cycles through them. The drawing was
// moved here from that site, so its links must keep opening the same series.
const NMR_KINDS: ReadonlyArray<readonly [string, string]> = [
  [
    'lines',
    'cdcl3 cd2cl2 dmso-d6 acetone-d5 ammonium borohydride-11 borohydride-10 tetrafluoroborate hexafluorophosphate-p hexafluorophosphate-f hexafluorosilicate methane chloroform phosphine',
  ],
  [
    'spin',
    '1H 3He 4He 7Li 9Be 11B 12C 13C 15N 16O 17O 18O 20Ne 22Ne 24Mg 25Mg 26Mg 27Al 28Si 29Si 30Si 31P 32S 33S 34S 36S 35Cl 37Cl 36Ar 38Ar 40Ar 39K 41K 40Ca 43Ca 45Sc 49Ti 51V 53Cr 59Co 63Cu 65Cu 67Zn 69Ga 71Ga 73Ge 83Kr 85Rb 87Sr 89Y 93Nb 105Pd 113In 115In 119Sn 123Sb 133Cs 139La 141Pr 151Eu 153Eu 159Tb 169Tm 173Yb 187Os 209Bi',
  ],
  [
    'unpaired',
    '1H 3He 7Li 9Be 11B 13C 15N 17O 25Mg 27Al 29Si 31P 33S 35Cl 37Cl 39K 41K 43Ca 45Sc 49Ti 51V 53Cr 59Co 63Cu 65Cu 67Zn 69Ga 71Ga 73Ge 83Kr 85Rb 87Sr 89Y 93Nb 105Pd 113In 115In 119Sn 123Sb 133Cs 139La 141Pr 151Eu 153Eu 159Tb 169Tm 173Yb 187Os 209Bi',
  ],
  ['range', '2H 6Li 10B 14N 40K 50V 138La 176Lu 180Ta'],
  [
    'measured',
    '19F 57Fe 61Ni 75As 77Se 87Rb 91Zr 101Ru 103Rh 107Ag 109Ag 111Cd 113Cd 115Sn 117Sn 121Sb 123Te 125Te 129Xe 131Xe 135Ba 137Ba 143Nd 191Ir 193Ir 195Pt 197Au 199Hg 201Hg 203Tl 205Tl 207Pb',
  ],
];

const NMR_POOLS: string[][] = NMR_KINDS.map(([kind, subjects]) =>
  subjects.split(' ').map((subject) => `${kind}:${subject}`),
);

test("nmr's pools are the sizes its own test counts", () => {
  expect(NMR_POOLS.map((pool) => pool.length)).toStrictEqual([
    14, 66, 49, 9, 32,
  ]);
});

test('a seed draws the series nmr pins for it, the kinds in turn', () => {
  expect(drawRoundRobin(NMR_POOLS, 7, 4271)).toStrictEqual([
    'lines:chloroform',
    'spin:69Ga',
    'unpaired:105Pd',
    'range:10B',
    'measured:109Ag',
    'lines:borohydride-11',
    'spin:43Ca',
  ]);
  expect(drawRoundRobin(NMR_POOLS, 12, 0)).toStrictEqual([
    'lines:ammonium',
    'spin:18O',
    'unpaired:141Pr',
    'range:2H',
    'measured:191Ir',
    'lines:methane',
    'spin:209Bi',
    'unpaired:13C',
    'range:6Li',
    'measured:199Hg',
    'lines:cdcl3',
    'spin:73Ge',
  ]);
});

test('a longer series keeps the questions already on screen', () => {
  const seven = drawRoundRobin(NMR_POOLS, 7, 4271);
  const twenty = drawRoundRobin(NMR_POOLS, 20, 4271);

  expect(twenty).toHaveLength(20);
  expect(twenty.slice(0, 7)).toStrictEqual(seven);
  expect(drawRoundRobin(NMR_POOLS, 7, 4272)).not.toStrictEqual(seven);
});

test('a kind left empty is skipped, and the others keep their questions', () => {
  const withoutSpin = [
    NMR_POOLS[0] ?? [],
    [],
    NMR_POOLS[2] ?? [],
    NMR_POOLS[3] ?? [],
    NMR_POOLS[4] ?? [],
  ];
  const everything = drawRoundRobin(NMR_POOLS, 500, 4271);
  const others = everything.filter((question) => !question.startsWith('spin'));

  expect(drawRoundRobin(withoutSpin, 12, 4271)).toStrictEqual(
    others.slice(0, 12),
  );
});

test('a series stops at the pools, and holds nothing for no question', () => {
  expect(drawRoundRobin(NMR_POOLS, 500, 1)).toHaveLength(170);
  expect(new Set(drawRoundRobin(NMR_POOLS, 500, 1)).size).toBe(170);
  expect(drawRoundRobin(NMR_POOLS, 0, 1)).toStrictEqual([]);
  expect(drawRoundRobin([[], []], 5, 1)).toStrictEqual([]);
});

test('each kind gets a seed of its own, a fixed step apart', () => {
  expect(kindSeed(4271, 0)).toBe(2_654_440_032);
  expect(kindSeed(4271, 1)).toBe(1_013_908_497);
  expect(kindSeed(0, 4)).toBe(387_276_917);
  expect(kindSeed(4_294_967_295, 0)).toBe(2_654_435_760);
});
