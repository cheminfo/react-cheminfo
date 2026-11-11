import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import { isSameSite } from '../../ecosystem/core/lookup.ts';
import { isPlainRecord } from '../../state/core/mergeStored.ts';

/** What a workspace file says it is, in its `format` field. */
export const WORKSPACE_FORMAT = 'cheminfo-workspace';

/** A workspace as it travels in a file or in a document. */
export interface WorkspaceRecord {
  /**
   * Its identifier, the same in every copy, so a workspace taken in again
   * replaces the copy taken before rather than piling up beside it.
   */
  id: string;
  /** The name the workspace picker shows. */
  name: string;
  /** The preferences, keyed as the site's bucket keeps them. */
  preferences: Record<string, unknown>;
}

/**
 * Write a workspace as the JSON file a workspace is saved to.
 * @param record - The workspace.
 * @param site - The site it belongs to, e.g. `draw`, checked when it is read.
 * @returns The file's text.
 */
export function writeWorkspaceText(
  record: WorkspaceRecord,
  site: string,
): string {
  const { id, name, preferences } = record;
  const file = { format: WORKSPACE_FORMAT, version: 1, site, id, name };
  return `${JSON.stringify({ ...file, preferences }, null, 2)}\n`;
}

/**
 * Read a workspace file.
 * @param text - The file's text.
 * @param site - The site reading it: a workspace of another one is refused.
 * @returns The workspace, its preferences not yet fitted to the site's.
 * @throws {Error} When the text is not a workspace of this site.
 */
export function readWorkspaceText(text: string, site: string): WorkspaceRecord {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error('This file is not JSON, so no workspace was opened.', {
      cause: error,
    });
  }
  return readWorkspaceValue(parsed, site);
}

/**
 * Read a workspace already parsed from JSON, as a document carries it.
 * @param value - The parsed value, trusted for nothing.
 * @param site - The site reading it: a workspace of another one is refused.
 * @returns The workspace, its preferences not yet fitted to the site's.
 * @throws {Error} When the value is not a workspace of this site.
 */
export function readWorkspaceValue(
  value: unknown,
  site: string,
): WorkspaceRecord {
  if (!isPlainRecord(value) || value.format !== WORKSPACE_FORMAT) {
    throw new Error('This file holds no workspace, so none was opened.');
  }
  if (typeof value.site !== 'string' || !isSameSite(value.site, site)) {
    throw new Error(
      `This workspace was made for ${String(value.site)}, so it was not opened here.`,
    );
  }
  const { id, name, preferences } = value;
  return {
    id: typeof id === 'string' && id !== '' ? id : crypto.randomUUID(),
    name:
      typeof name === 'string' && name.trim() !== ''
        ? name.trim()
        : 'Workspace',
    preferences: isPlainRecord(preferences) ? preferences : {},
  };
}

/**
 * The name a workspace is saved under: its own, then the site's suffix, so a
 * folder of them says which site opens each.
 * @param name - The workspace's name.
 * @param site - The site, e.g. `draw`.
 * @returns E.g. `Teaching.draw-workspace.json`.
 */
export function workspaceFileName(name: string, site: string): string {
  return `${sanitizeFileName(name, 'workspace')}.${site}-workspace.json`;
}
