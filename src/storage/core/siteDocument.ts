import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import { isPlainRecord } from '../../state/core/mergeStored.ts';

import type { ArchiveEntry, ArchiveFile } from './backupFiles.ts';
import { readArchive, writeArchive } from './backupFiles.ts';
import type { WorkspaceRecord } from './workspaceFile.ts';
import { readWorkspaceValue, writeWorkspaceText } from './workspaceFile.ts';

/** What a document's manifest says it is, in its `format` field. */
export const DOCUMENT_FORMAT = 'cheminfo-document';

const MANIFEST = 'manifest.json';
const VIEW = 'view.json';
const WORKSPACE = 'workspace.json';
const ATTACHMENTS = 'files/';
const RESERVED: ReadonlySet<string> = new Set([MANIFEST, VIEW, WORKSPACE]);

/** What a document holds: its data, and what it may carry beside. */
export interface SiteDocumentParts {
  /**
   * The site's own files, what the document is about — a drawing's SVG, a
   * molfile — each at the path it is unzipped to.
   */
  data: readonly ArchiveEntry[];
  /**
   * Where the view stood when it was saved, as the site writes it.
   * @default undefined — the document opens on the site's own view
   */
  view?: unknown;
  /**
   * The workspace it opens in: the panels and their settings.
   * @default undefined — the document opens in the reader's own workspace
   */
  workspace?: WorkspaceRecord;
  /**
   * Files it carries beside its data, kept under `files/`.
   * @default []
   */
  attachments?: readonly ArchiveEntry[];
}

/** Who writes a document. */
export interface WriteSiteDocumentOptions {
  /** The site it belongs to, e.g. `draw`, checked when it is read. */
  site: string;
  /**
   * The build that wrote it, e.g. `draw.cheminfo.org 1.4.0`.
   * @default undefined
   */
  generator?: string;
  /**
   * When it is saved.
   * @default now
   */
  date?: Date;
}

/** A document read back. */
export interface SiteDocument {
  /** The site it belongs to. */
  site: string;
  /** The build that wrote it, when it says. */
  generator?: string;
  /** When it was saved, as ISO 8601, when it says. */
  savedAt?: string;
  /** Its data files, in the order they were written. */
  data: ArchiveFile[];
  /** The view it was saved with, parsed but not checked. */
  view?: unknown;
  /** The workspace it carries, its preferences not yet fitted. */
  workspace?: WorkspaceRecord;
  /** The files it carries beside, their paths taken from inside `files/`. */
  attachments: ArchiveFile[];
}

/** The manifest at the root of a document. */
interface DocumentManifest {
  format: typeof DOCUMENT_FORMAT;
  version: 1;
  site: string;
  generator?: string;
  savedAt: string;
  data: string[];
  view?: string;
  workspace?: string;
  attachments?: string[];
}

/**
 * Write a document: one ZIP archive holding the site's data files as they open
 * anywhere — an SVG stays a picture any program shows — and, when asked, the
 * view and the workspace, and the files it carries.
 * @param parts - What the document holds.
 * @param options - Who writes it.
 * @returns The archive.
 * @throws {Error} When there is no data, or a data file takes a reserved name.
 */
export async function writeSiteDocument(
  parts: SiteDocumentParts,
  options: WriteSiteDocumentOptions,
): Promise<Blob> {
  const { data, view, workspace, attachments = [] } = parts;
  const { site, generator, date = new Date() } = options;
  if (data.length === 0) {
    throw new Error('A document holds at least one data file.');
  }
  for (const { path } of data) {
    if (RESERVED.has(path) || path.startsWith(ATTACHMENTS)) {
      throw new Error(`${path} is a name the document keeps for itself.`);
    }
  }
  const manifest: DocumentManifest = {
    format: DOCUMENT_FORMAT,
    version: 1,
    site,
    ...(generator ? { generator } : {}),
    savedAt: date.toISOString(),
    data: data.map(({ path }) => path),
    ...(view === undefined ? {} : { view: VIEW }),
    ...(workspace ? { workspace: WORKSPACE } : {}),
    ...(attachments.length > 0
      ? { attachments: attachments.map(({ path }) => path) }
      : {}),
  };
  const entries: ArchiveEntry[] = [
    { path: MANIFEST, content: `${JSON.stringify(manifest, null, 2)}\n` },
    ...data,
  ];
  if (view !== undefined) {
    entries.push({ path: VIEW, content: `${JSON.stringify(view, null, 2)}\n` });
  }
  if (workspace) {
    entries.push({
      path: WORKSPACE,
      content: writeWorkspaceText(workspace, site),
    });
  }
  for (const { path, content } of attachments) {
    entries.push({ path: `${ATTACHMENTS}${path}`, content });
  }
  return writeArchive(entries);
}

/**
 * Read a document back. The manifest is found wherever the archive keeps it,
 * so a document unzipped and zipped again inside a folder still opens. A view
 * or a workspace that does not read is left out rather than costing the data.
 * @param file - The archive.
 * @param site - The site reading it: a document of another one is refused.
 * @returns The document.
 * @throws {Error} When the file is no document, or another site's, or its data
 * is missing.
 */
export async function readSiteDocument(
  file: Blob,
  site: string,
): Promise<SiteDocument> {
  const files = await readArchive(file);
  const found = findManifest(files);
  if (!found) {
    throw new Error(
      'This archive holds no saved document, so nothing was opened.',
    );
  }
  const { manifest, folder } = found;
  if (manifest.site !== site) {
    throw new Error(
      `This document was saved by ${manifest.site}, so it does not open here.`,
    );
  }
  const byPath = new Map(files.map((entry) => [entry.path, entry]));
  const data: ArchiveFile[] = [];
  for (const path of manifest.data) {
    const entry = byPath.get(`${folder}${path}`);
    if (entry) data.push({ ...entry, path });
  }
  if (data.length === 0) {
    throw new Error('This document has lost its data, so nothing was opened.');
  }
  const attachments: ArchiveFile[] = [];
  const kept = `${folder}${ATTACHMENTS}`;
  for (const entry of files) {
    if (!entry.path.startsWith(kept)) continue;
    attachments.push({ ...entry, path: entry.path.slice(kept.length) });
  }
  const view = manifest.view
    ? parsedJson(byPath.get(`${folder}${manifest.view}`))
    : undefined;
  return {
    site,
    ...(manifest.generator ? { generator: manifest.generator } : {}),
    ...(manifest.savedAt ? { savedAt: manifest.savedAt } : {}),
    data,
    ...(view === undefined ? {} : { view }),
    ...readWorkspacePart(byPath.get(`${folder}${manifest.workspace ?? ''}`), {
      listed: manifest.workspace !== undefined,
      site,
    }),
    attachments,
  };
}

/**
 * The name a document is saved under: the site's own extension after its
 * stem, so the file says which site opens it, and still unzips anywhere.
 * @param stem - What the document is called, e.g. `benzene`.
 * @param site - The site, e.g. `draw`.
 * @returns E.g. `benzene.draw.zip`.
 */
export function siteDocumentName(stem: string, site: string): string {
  return `${sanitizeFileName(stem, site)}${siteDocumentExtension(site)}`;
}

/**
 * The extension a site's documents end in.
 * @param site - The site, e.g. `draw`.
 * @returns E.g. `.draw.zip`.
 */
export function siteDocumentExtension(site: string): string {
  return `.${site}.zip`;
}

function findManifest(
  files: readonly ArchiveFile[],
): { manifest: DocumentManifest; folder: string } | undefined {
  const candidates = files
    .filter(({ path }) => path === MANIFEST || path.endsWith(`/${MANIFEST}`))
    .toSorted((a, b) => a.path.length - b.path.length);
  for (const candidate of candidates) {
    const manifest = readManifest(parsedJson(candidate));
    if (manifest) {
      return { manifest, folder: candidate.path.slice(0, -MANIFEST.length) };
    }
  }
  return undefined;
}

function readManifest(value: unknown): DocumentManifest | undefined {
  if (!isPlainRecord(value) || value.format !== DOCUMENT_FORMAT) {
    return undefined;
  }
  const { site, generator, savedAt, data, view, workspace } = value;
  if (typeof site !== 'string' || !Array.isArray(data)) return undefined;
  return {
    format: DOCUMENT_FORMAT,
    version: 1,
    site,
    ...(typeof generator === 'string' ? { generator } : {}),
    savedAt: typeof savedAt === 'string' ? savedAt : '',
    data: data.filter((path): path is string => typeof path === 'string'),
    ...(typeof view === 'string' ? { view } : {}),
    ...(typeof workspace === 'string' ? { workspace } : {}),
  };
}

function readWorkspacePart(
  entry: ArchiveFile | undefined,
  options: { listed: boolean; site: string },
): { workspace?: WorkspaceRecord } {
  if (!options.listed || !entry) return {};
  try {
    return { workspace: readWorkspaceValue(parsedJson(entry), options.site) };
  } catch {
    return {};
  }
}

function parsedJson(entry: ArchiveFile | undefined): unknown {
  if (!entry) return undefined;
  try {
    return JSON.parse(entry.text());
  } catch {
    return undefined;
  }
}
