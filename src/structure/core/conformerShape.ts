import type { Molecule } from 'openchemlib';

/** Principal second moments of a conformer's atoms, in increasing order. */
export type PrincipalMoments = readonly [number, number, number];

/** What tells two minimised conformers of one energy apart. */
export interface ConformerShape {
  /** Principal second moments, smallest first. */
  moments: PrincipalMoments;
  /** Handedness in [-1, 1]: opposite for mirror images, 0 for a shape that is its own mirror image. */
  chirality: number;
}

/**
 * Shape of a conformer: the principal second moments of its atoms, weighted by
 * atomic number, about their weighted centre, and the handedness of the atoms
 * in that principal frame.
 *
 * Neither changes when the conformer is turned or has its symmetry-equivalent
 * atoms numbered differently, which is how the generator hands back the same
 * minimum twice, as with a cyclohexane chair and its flipped copy. A mirror
 * image keeps the moments and flips the sign of the chirality, so gauche butane
 * and its mirror image share the one and not the other.
 *
 * The chirality is Σ w·u₁u₂u₃ over Σ w·|u₁u₂u₃|, u being the coordinates along
 * right-handed principal axes. A mirror plane or an inversion centre makes it
 * vanish. It is 0 as well for a flat conformer, and when the principal axes
 * cannot be drawn.
 * @param molecule - A conformer with 3D coordinates.
 * @returns Its moments, smallest first, and its chirality.
 */
export function conformerShape(molecule: Molecule): ConformerShape {
  const atomCount = molecule.getAllAtoms();
  let total = 0;
  let centreX = 0;
  let centreY = 0;
  let centreZ = 0;
  for (let atom = 0; atom < atomCount; atom++) {
    const weight = molecule.getAtomicNo(atom);
    total += weight;
    centreX += weight * molecule.getAtomX(atom);
    centreY += weight * molecule.getAtomY(atom);
    centreZ += weight * molecule.getAtomZ(atom);
  }
  if (total === 0) return { moments: [0, 0, 0], chirality: 0 };
  centreX /= total;
  centreY /= total;
  centreZ /= total;
  const tensor: Tensor = { xx: 0, yy: 0, zz: 0, xy: 0, xz: 0, yz: 0 };
  for (let atom = 0; atom < atomCount; atom++) {
    const weight = molecule.getAtomicNo(atom);
    const x = molecule.getAtomX(atom) - centreX;
    const y = molecule.getAtomY(atom) - centreY;
    const z = molecule.getAtomZ(atom) - centreZ;
    tensor.xx += weight * x * x;
    tensor.yy += weight * y * y;
    tensor.zz += weight * z * z;
    tensor.xy += weight * x * y;
    tensor.xz += weight * x * z;
    tensor.yz += weight * y * z;
  }
  const moments = symmetricEigenvalues(tensor);
  const first = principalAxis(tensor, moments[0]);
  const third = principalAxis(tensor, moments[2]);
  if (first === null || third === null) return { moments, chirality: 0 };
  const second = cross(third, first);

  let signed = 0;
  let absolute = 0;
  for (let atom = 0; atom < atomCount; atom++) {
    const weight = molecule.getAtomicNo(atom);
    const x = molecule.getAtomX(atom) - centreX;
    const y = molecule.getAtomY(atom) - centreY;
    const z = molecule.getAtomZ(atom) - centreZ;
    const product =
      (x * first[0] + y * first[1] + z * first[2]) *
      (x * second[0] + y * second[1] + z * second[2]) *
      (x * third[0] + y * third[1] + z * third[2]);
    signed += weight * product;
    absolute += weight * Math.abs(product);
  }
  const radius = Math.sqrt((moments[0] + moments[1] + moments[2]) / total);
  if (absolute <= FLAT_TOLERANCE * total * radius * radius * radius) {
    return { moments, chirality: 0 };
  }
  return { moments, chirality: signed / absolute };
}

/**
 * Whether every atom of a conformer sits at finite coordinates.
 * @param conformer - A conformer with 3D coordinates.
 * @returns `false` as soon as one coordinate is `NaN` or infinite.
 */
export function hasFiniteCoordinates(conformer: Molecule): boolean {
  const atomCount = conformer.getAllAtoms();
  for (let atom = 0; atom < atomCount; atom++) {
    if (
      !Number.isFinite(conformer.getAtomX(atom)) ||
      !Number.isFinite(conformer.getAtomY(atom)) ||
      !Number.isFinite(conformer.getAtomZ(atom))
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Σ w·|u₁u₂u₃|, relative to the total weight times the cubed radius of
 * gyration, under which a conformer is flat: its handedness is rounding noise.
 */
const FLAT_TOLERANCE = 1e-4;

type Vector = readonly [number, number, number];

/** Second moments of the atoms about their centre: a symmetric 3×3 matrix. */
interface Tensor {
  xx: number;
  yy: number;
  zz: number;
  xy: number;
  xz: number;
  yz: number;
}

// Unit eigenvector of `moment`: the longest cross product of two rows of the tensor minus `moment`.
function principalAxis(tensor: Tensor, moment: number): Vector | null {
  const rows: Vector[] = [
    [tensor.xx - moment, tensor.xy, tensor.xz],
    [tensor.xy, tensor.yy - moment, tensor.yz],
    [tensor.xz, tensor.yz, tensor.zz - moment],
  ];
  let best: Vector = [0, 0, 0];
  let bestLength = 0;
  for (let a = 0; a < 3; a++) {
    for (let b = a + 1; b < 3; b++) {
      const candidate = cross(rows[a] as Vector, rows[b] as Vector);
      const length = Math.hypot(candidate[0], candidate[1], candidate[2]);
      if (length > bestLength) {
        best = candidate;
        bestLength = length;
      }
    }
  }
  if (bestLength === 0) return null;
  return [best[0] / bestLength, best[1] / bestLength, best[2] / bestLength];
}

function cross(a: Vector, b: Vector): Vector {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

// Closed-form eigenvalues of a symmetric 3×3 matrix (Smith, 1961).
function symmetricEigenvalues(tensor: Tensor): PrincipalMoments {
  const { xx, yy, zz, xy, xz, yz } = tensor;
  const mean = (xx + yy + zz) / 3;
  const offDiagonal = xy * xy + xz * xz + yz * yz;
  const spread =
    (xx - mean) * (xx - mean) +
    (yy - mean) * (yy - mean) +
    (zz - mean) * (zz - mean) +
    2 * offDiagonal;
  if (spread === 0) return [mean, mean, mean];
  const p = Math.sqrt(spread / 6);
  const a = (xx - mean) / p;
  const b = (yy - mean) / p;
  const c = (zz - mean) / p;
  const d = xy / p;
  const e = xz / p;
  const f = yz / p;
  const halfDeterminant =
    (a * (b * c - f * f) - d * (d * c - f * e) + e * (d * f - b * e)) / 2;
  const angle = Math.acos(Math.min(1, Math.max(-1, halfDeterminant))) / 3;
  const largest = mean + 2 * p * Math.cos(angle);
  const smallest = mean + 2 * p * Math.cos(angle + (2 * Math.PI) / 3);
  return [smallest, 3 * mean - largest - smallest, largest];
}
