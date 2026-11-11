import { expect, test, vi } from 'vitest';

// A tool that takes no structure imports `react-cheminfo/host` and nothing
// else of the host protocol, and Vite emits OpenChemLib's 1.3 MB resources
// file as soon as the package is in the graph, used or not.
vi.mock('openchemlib', () => {
  throw new Error('react-cheminfo/host reached openchemlib');
});

test('the host door reaches no OpenChemLib', async () => {
  const host = await import('../../host.ts');

  expect(host.STRUCTURE_KINDS).toStrictEqual([
    'chem.molfile',
    'chem.ocl.id',
    'chem.smiles',
  ]);
  expect('hostStructureLoader' in host).toBe(false);
});
