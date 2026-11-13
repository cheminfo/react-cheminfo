import { downloadBlob } from '../../download/core/downloadBlob.ts';
import { errorMessage } from '../../error/core/toError.ts';
import {
  readStorageText,
  removeStorageEntry,
  writeStorageText,
} from '../../state/core/storageEntry.ts';

import { createSiteFolder } from './createSiteFolder.ts';
import type { DocumentPartsKept, SaveTarget } from './documentFile.ts';
import { SAVE_TARGETS } from './documentFile.ts';
import {
  formatOfName,
  isKeptAs,
  namesInBrowser,
  namesInFolder,
  stemOf,
} from './documentSaverNames.ts';
import type {
  DocumentSaver,
  DocumentSaverOptions,
  SaveChoice,
  SaveFormat,
  SaveOutcome,
} from './documentSaverTypes.ts';
import {
  canPickFiles,
  canPickFolders,
  chooseSaveFile,
  freeFileName,
  writeFile,
} from './fileAccess.ts';
import { saveInBrowser } from './saveInBrowser.ts';

/**
 * Save a site's documents in one of four places — a file the visitor picks,
 * the site's folder, this browser, or a download — and remember the place, so
 * Ctrl+S asks once and never again. The file a document is kept in is a
 * signal the site's draft keeps, so Save still writes there after a reload.
 * @param options - See {@link DocumentSaverOptions}.
 * @returns See {@link DocumentSaver}.
 */
export function createDocumentSaver<D>(
  options: DocumentSaverOptions<D>,
): DocumentSaver<D> {
  const { site, formats, file, savedDocuments } = options;
  const folder = options.folder ?? createSiteFolder(site);
  const rememberedKey = `${site}:save-target`;

  function targets(): SaveTarget[] {
    return SAVE_TARGETS.filter((target) => {
      if (target === 'file') return canPickFiles();
      if (target === 'folder') return canPickFolders();
      if (target === 'browser') return savedDocuments !== undefined;
      return true;
    });
  }

  function remembered(): SaveTarget | undefined {
    const stored = readStorageText(rememberedKey);
    return targets().find((target) => target === stored);
  }

  function formatOf(id: string): SaveFormat<D> {
    return formats.find((format) => format.id === id) ?? formats[0];
  }

  function suggestion(): SaveChoice {
    const kept = file.peek();
    const offered = targets();
    const where = kept?.savedId ? 'browser' : kept?.handle ? 'file' : undefined;
    return {
      name: kept ? stemOf(formats, kept.name) : options.stem(),
      target:
        remembered() ??
        offered.find((target) => target === where) ??
        offered[0] ??
        'download',
      format: kept ? formatOfName(formats, kept.name).id : formats[0].id,
      view: kept?.parts?.view ?? false,
      workspace: kept?.parts?.workspace ?? false,
    };
  }

  async function writeOver(
    handle: FileSystemFileHandle,
    document: D,
    parts: DocumentPartsKept | undefined,
  ): Promise<SaveOutcome> {
    const format = formatOfName(formats, handle.name);
    try {
      await writeFile(handle, async () =>
        format.write(document, parts, handle.name),
      );
    } catch (error) {
      return {
        kind: 'failed',
        name: handle.name,
        message: errorMessage(error),
      };
    }
    file.value = { name: handle.name, handle, saved: document, ...kept(parts) };
    return { kind: 'saved', target: 'file', name: handle.name };
  }

  async function inFolder(
    choice: SaveChoice,
    document: D,
    parts: DocumentPartsKept | undefined,
  ): Promise<SaveOutcome> {
    const directory = await folder.writable();
    if (directory === null) return { kind: 'cancelled' };
    if (directory === undefined) return download(choice, document, parts);
    const { extension } = formatOf(choice.format);
    const wanted = `${choice.name}${extension}`;
    try {
      const name =
        choice.replace === true ||
        (await isKeptAs(file.peek()?.handle, directory, wanted))
          ? wanted
          : await freeFileName(directory, choice.name, extension);
      const handle = await directory.getFileHandle(name, { create: true });
      const outcome = await writeOver(handle, document, parts);
      folder.changed();
      if (outcome.kind !== 'saved') return outcome;
      return name === wanted
        ? { ...outcome, target: 'folder' }
        : { ...outcome, target: 'folder', wanted };
    } catch (error) {
      return { kind: 'failed', name: wanted, message: errorMessage(error) };
    }
  }

  async function inBrowser(
    choice: SaveChoice,
    document: D,
  ): Promise<SaveOutcome> {
    if (!savedDocuments) return download(choice, document, undefined);
    try {
      const { outcome, kept } = await saveInBrowser(
        savedDocuments,
        choice.name,
        document,
        file.peek()?.savedId,
      );
      file.value = kept;
      return outcome;
    } catch (error) {
      return {
        kind: 'failed',
        name: choice.name,
        message: errorMessage(error),
      };
    }
  }

  async function download(
    choice: SaveChoice,
    document: D,
    parts: DocumentPartsKept | undefined,
  ): Promise<SaveOutcome> {
    const format = formatOf(choice.format);
    const name = `${choice.name}${format.extension}`;
    try {
      const content = await format.write(document, parts, name);
      const type = Object.keys(format.picker.accept)[0] ?? '';
      downloadBlob(
        content instanceof Blob ? content : new Blob([content], { type }),
        name,
      );
    } catch (error) {
      return { kind: 'failed', name, message: errorMessage(error) };
    }
    file.value = { name, saved: document, ...kept(parts) };
    return { kind: 'saved', target: 'download', name };
  }

  async function saveTo(choice: SaveChoice): Promise<SaveOutcome> {
    const document = options.document();
    if (document === undefined) return { kind: 'empty' };
    const target = targets().includes(choice.target)
      ? choice.target
      : 'download';
    writeStorageText(rememberedKey, target);
    const format = formatOf(choice.format);
    const parts = format.holdsParts
      ? { view: choice.view, workspace: choice.workspace }
      : undefined;
    if (target === 'file') {
      const name = `${choice.name}${format.extension}`;
      const handle = await chooseSaveFile(name, format.picker);
      if (handle === null) return { kind: 'cancelled' };
      if (handle === undefined) return download(choice, document, parts);
      return writeOver(handle, document, parts);
    }
    if (target === 'folder') return inFolder(choice, document, parts);
    if (target === 'browser') return inBrowser(choice, document);
    return download(choice, document, parts);
  }

  return {
    formats,
    folder,
    targets,
    remembered,
    remember: (target) => {
      if (target === undefined) removeStorageEntry(rememberedKey);
      else writeStorageText(rememberedKey, target);
    },
    takenNames: (target) => {
      const kept = file.peek();
      if (target === 'browser') {
        return savedDocuments
          ? namesInBrowser(savedDocuments, kept?.savedId)
          : Promise.resolve(new Map());
      }
      return namesInFolder(folder, formats, kept?.handle?.name);
    },
    suggestion,
    save: async () => {
      const document = options.document();
      if (document === undefined) return { kind: 'empty' };
      const kept = file.peek();
      if (kept?.handle) return writeOver(kept.handle, document, kept.parts);
      if (kept?.savedId && savedDocuments) {
        const saved = await savedDocuments.update(kept.savedId, document);
        if (saved) {
          file.value = { name: saved.name, savedId: saved.id, saved: document };
          return { kind: 'saved', target: 'browser', name: saved.name };
        }
      }
      const target = remembered();
      if (target === undefined) return { kind: 'choose' };
      if (target === 'folder' || target === 'browser') {
        return { kind: 'name', target };
      }
      return saveTo({ ...suggestion(), target });
    },
    saveTo,
  };
}

function kept(parts: DocumentPartsKept | undefined): {
  parts?: DocumentPartsKept;
} {
  return parts ? { parts } : {};
}
