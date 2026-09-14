import type { ProjectionCopy } from './projectionCopy.ts';
import { PROJECTION_COPY } from './projectionCopy.ts';
import type { ProjectionCopyPatch } from './projectionCopyPatch.ts';

/**
 * The words the viewer will write, with a site's overrides merged in one key
 * at a time, so a site fixing a single sentence keeps every other default.
 * @param overrides - What the site wants said differently.
 * @returns Every word, complete.
 */
export function mergeProjectionCopy(
  overrides?: ProjectionCopyPatch<ProjectionCopy>,
): ProjectionCopy {
  if (overrides === undefined) return { ...PROJECTION_COPY };
  return mergeBranch(
    PROJECTION_COPY as unknown as Branch,
    overrides,
  ) as unknown as ProjectionCopy;
}

type Branch = Record<string, unknown>;

function mergeBranch(base: Branch, overrides: Branch): Branch {
  const merged: Branch = { ...base };
  for (const key of Object.keys(overrides)) {
    const value = overrides[key];
    if (value === undefined) continue;
    const current = merged[key];
    merged[key] =
      isBranch(current) && isBranch(value)
        ? mergeBranch(current, value)
        : value;
  }
  return merged;
}

function isBranch(value: unknown): value is Branch {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
