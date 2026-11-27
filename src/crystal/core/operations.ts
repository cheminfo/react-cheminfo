import { errorMessage } from '../../error/core/toError.ts';

import type { CrystalStructure } from './cif/types.ts';
import { resolveStructureSetting } from './resolve.ts';
import { spaceGroupOperations } from './spaceGroups/spaceGroupOperations.ts';
import { closure } from './symmetry/group.ts';
import { operationKey } from './symmetry/operation.ts';
import { parseOperation } from './symmetry/parseOperation.ts';
import type { CrystalOperation } from './symmetry/types.ts';

/**
 * The full coset list a structure's asymmetric unit is expanded with.
 *
 * The file's own operations come first, in file order, so an atom's
 * `operationIndex` points at the line of the file that made it. A file that
 * lists only part of the group — one coset of a centred group, or a few
 * generators — is completed: from the setting its symbol names when every
 * listed operation belongs to it, else by composing the listed ones. A file
 * that lists none, or one that cannot be read, is expanded with the setting its
 * Hall symbol, Hermann–Mauguin symbol or number names.
 * @param structure - What `readCif` returned.
 * @returns The operations, the identity among them.
 * @throws {Error} When no listed operation can be used and the file names no space
 *   group the catalogue knows.
 */
export function structureOperations(
  structure: CrystalStructure,
): ReadonlyArray<CrystalOperation<3>> {
  const resolved = resolveStructureSetting(structure);
  const listed = readListed(structure.symopsXyz);
  if (typeof listed === 'string' || listed.length === 0) {
    if (resolved.setting !== null) {
      return spaceGroupOperations(resolved.setting);
    }
    throw new Error(
      typeof listed === 'string'
        ? `This CIF names no space group this reader knows, and its operation list cannot be read: ${listed}.`
        : 'This CIF names no space group this reader knows, and lists no symmetry operation.',
    );
  }
  const keys = new Set<string>();
  const operations: Array<CrystalOperation<3>> = [];
  appendNew(operations, keys, listed);
  if (resolved.setting !== null && resolved.agrees === true) {
    appendNew(operations, keys, spaceGroupOperations(resolved.setting));
    return operations;
  }
  try {
    appendNew(operations, keys, closure(operations));
  } catch {
    // Operations that close on no group are left as the file wrote them.
  }
  return operations;
}

function readListed(
  symopsXyz: readonly string[],
): Array<CrystalOperation<3>> | string {
  const operations: Array<CrystalOperation<3>> = [];
  for (const xyz of symopsXyz) {
    try {
      operations.push(parseOperation(xyz, 3));
    } catch (error) {
      return errorMessage(error);
    }
  }
  return operations;
}

function appendNew(
  operations: Array<CrystalOperation<3>>,
  keys: Set<string>,
  candidates: ReadonlyArray<CrystalOperation<3>>,
) {
  for (const operation of candidates) {
    const key = operationKey(operation);
    if (keys.has(key)) continue;
    keys.add(key);
    operations.push(operation);
  }
}
