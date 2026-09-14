import { useEffect, useState } from 'react';

import type { Molecule3DFile } from '../core/settings.ts';

/**
 * Ertl's topological polar surface area of the molecule, from openchemlib,
 * loaded only once a caller asks for it.
 * @param molfile - The molecule, or `null`.
 * @param enabled - Whether to compute it at all.
 * @returns The area in Å², or `null` while unknown, disabled, or when
 * openchemlib is not installed or cannot read the molfile.
 */
export function usePolarSurfaceArea(
  molfile: Molecule3DFile | null,
  enabled: boolean,
): number | null {
  const [result, setResult] = useState<{
    data: string;
    area: number | null;
  } | null>(null);
  const data = enabled ? (molfile?.data ?? null) : null;

  useEffect(() => {
    if (data === null) return;
    let cancelled = false;
    void computePolarSurfaceArea(data).then((area) => {
      if (!cancelled) setResult({ data, area });
    });
    return () => {
      cancelled = true;
    };
  }, [data]);

  return data !== null && result?.data === data ? result.area : null;
}

async function computePolarSurfaceArea(
  molfile: string,
): Promise<number | null> {
  try {
    const { Molecule, MoleculeProperties } = await import('openchemlib');
    const molecule = Molecule.fromMolfile(molfile);
    return new MoleculeProperties(molecule).polarSurfaceArea;
  } catch {
    return null;
  }
}
