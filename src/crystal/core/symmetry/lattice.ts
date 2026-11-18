/** The six parameters of a unit cell: three edges in Å, three angles in degrees. */
export interface UnitCell {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  /** Angle between b and c, in degrees. */
  readonly alpha: number;
  /** Angle between c and a, in degrees. */
  readonly beta: number;
  /** Angle between a and b, in degrees. */
  readonly gamma: number;
}

/** A cell with everything derived from it computed once. */
export interface Lattice {
  readonly cell: UnitCell;
  /** The cell volume in Å³. */
  readonly volume: number;
  /** M, whose columns are the Cartesian components of a, b and c. */
  readonly cartesian: number[][];
  /** M⁻¹. */
  readonly fractional: number[][];
}

/**
 * Everything a cell implies, computed once.
 *
 * **The Cartesian convention is the PDB / CCP4 one**, which is what molstar and
 * every CIF consumer assumes: **a** lies along **x**, **b** lies in the **xy**
 * plane with a positive **y** component, and **c** completes a right-handed set.
 * There are two other conventions in common use and they disagree with this one,
 * so never mix Cartesian coordinates from another source without checking.
 * @param cell - The six cell parameters.
 * @returns The lattice.
 */
export function createLattice(cell: UnitCell): Lattice {
  const cartesian = cartesianMatrix(cell);
  return {
    cell,
    volume: cellVolume(cell),
    cartesian,
    fractional: invertUpperTriangular(cartesian),
  };
}

/**
 * The cell volume in Å³, from the closed form; it equals `sqrt(det G)`.
 * @param cell - The six cell parameters.
 * @throws {RangeError} When the three angles describe no cell that exists. A CIF can carry
 *   such a triple, and without this the volume is `NaN` and every coordinate
 *   downstream of it silently becomes one too.
 * @returns The volume, Å³.
 */
export function cellVolume(cell: UnitCell): number {
  const cosAlpha = Math.cos(toRadians(cell.alpha));
  const cosBeta = Math.cos(toRadians(cell.beta));
  const cosGamma = Math.cos(toRadians(cell.gamma));
  const factor =
    1 -
    cosAlpha * cosAlpha -
    cosBeta * cosBeta -
    cosGamma * cosGamma +
    2 * cosAlpha * cosBeta * cosGamma;
  if (factor <= 0) {
    throw new RangeError(
      `no cell has the angles ${cell.alpha}, ${cell.beta}, ${cell.gamma} degrees`,
    );
  }
  return cell.a * cell.b * cell.c * Math.sqrt(factor);
}

/**
 * M, whose columns are the Cartesian components of a, b and c. `G = Mᵀ M`.
 * @param cell - The six cell parameters.
 * @returns M, row-major.
 */
export function cartesianMatrix(cell: UnitCell): number[][] {
  const { a, b, c, alpha, beta, gamma } = cell;
  const cosAlpha = Math.cos(toRadians(alpha));
  const cosBeta = Math.cos(toRadians(beta));
  const cosGamma = Math.cos(toRadians(gamma));
  const sinGamma = Math.sin(toRadians(gamma));
  return [
    [a, b * cosGamma, c * cosBeta],
    [0, b * sinGamma, (c * (cosAlpha - cosBeta * cosGamma)) / sinGamma],
    [0, 0, cellVolume(cell) / (a * b * sinGamma)],
  ];
}

/**
 * The Cartesian coordinates, in Å, of a fractional point.
 * @param lattice - The cell.
 * @param point - Fractional coordinates.
 * @returns The Cartesian coordinates, Å.
 */
export function fractionalToCartesian(
  lattice: Lattice,
  point: readonly number[],
): number[] {
  return applyMatrix(lattice.cartesian, point);
}

/**
 * The fractional coordinates of a Cartesian point given in Å.
 * @param lattice - The cell.
 * @param point - Cartesian coordinates, Å.
 * @returns The fractional coordinates.
 */
export function cartesianToFractional(
  lattice: Lattice,
  point: readonly number[],
): number[] {
  return applyMatrix(lattice.fractional, point);
}

function applyMatrix(matrix: number[][], point: readonly number[]): number[] {
  const image = new Array<number>(matrix.length).fill(0);
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    let sum = 0;
    for (let j = 0; j < matrix.length; j++) {
      sum += (row?.[j] ?? 0) * (point[j] ?? 0);
    }
    image[i] = sum;
  }
  return image;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * M⁻¹ in closed form: M has a along x and b in the xy plane, so it is upper
 * triangular and its diagonal is never zero for a cell that exists.
 * @param matrix - M.
 * @returns M⁻¹.
 */
function invertUpperTriangular(matrix: number[][]): number[][] {
  const [row0 = [], row1 = [], row2 = []] = matrix;
  const m00 = row0[0] ?? 1;
  const m01 = row0[1] ?? 0;
  const m02 = row0[2] ?? 0;
  const m11 = row1[1] ?? 1;
  const m12 = row1[2] ?? 0;
  const m22 = row2[2] ?? 1;
  return [
    [1 / m00, -m01 / (m00 * m11), (m01 * m12 - m02 * m11) / (m00 * m11 * m22)],
    [0, 1 / m11, -m12 / (m11 * m22)],
    [0, 0, 1 / m22],
  ];
}
