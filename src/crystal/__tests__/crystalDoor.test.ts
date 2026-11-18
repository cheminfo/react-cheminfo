import { expect, test, vi } from 'vitest';

// A Node batch reading a whole crystal database imports this door and nothing
// else: it must not need React, OpenChemLib or molstar to load.
vi.mock('openchemlib', () => {
  throw new Error('react-cheminfo/crystal reached openchemlib');
});
vi.mock('react', () => {
  throw new Error('react-cheminfo/crystal reached react');
});
vi.mock('molstar', () => {
  throw new Error('react-cheminfo/crystal reached molstar');
});

test('the crystal door loads neither React, nor OpenChemLib, nor molstar', async () => {
  const crystal = await import('../../crystal.ts');

  expect(typeof crystal.readCif).toBe('function');
  expect(typeof crystal.crystalMolecules).toBe('function');
  expect(crystal.SPACE_GROUP_SETTINGS).toHaveLength(521);
});
