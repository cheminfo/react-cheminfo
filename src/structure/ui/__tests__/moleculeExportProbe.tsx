/**
 * The molecule export mounted in jsdom, and the hands that drive it: the
 * pages it reads, the buttons a visitor presses, and what it says and saves.
 *
 * The file is written over several turns of the event loop, as in a page, so
 * a press lets React render on its own afterwards and the tests wait for what
 * it renders.
 */

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

import type {
  MoleculeFile,
  MoleculeFileRow,
} from '../../core/moleculeFileTypes.ts';
import { MoleculeExport } from '../MoleculeExport.tsx';

import type { SavedFile } from './savedFiles.ts';
import { watchSavedFiles } from './savedFiles.ts';

/** What the export reads: a page of molecules at a time. */
export type ExportRead = (
  signal: AbortSignal,
) => AsyncIterable<readonly MoleculeFileRow[]>;

/** One mounted export. */
export interface ExportProbe {
  /** Draw the export over these pages, as many matching as `total` says. */
  render: (read: ExportRead, total?: number) => void;
  /** Press the button reading `text`. */
  press: (text: string) => void;
  /** What the export says beside its buttons. */
  note: () => string;
  /** What it says went wrong, `null` when nothing did. */
  alert: () => string | null;
  /** Every file handed to the browser. */
  saved: () => SavedFile[];
  /** Every file reported saved, in order. */
  files: MoleculeFile[];
  /** Take the export off the page, as a visitor leaving does. */
  leave: () => void;
  /** Clean up after the test. */
  dispose: () => void;
}

/**
 * Mount a root, ready for `render`.
 * @returns The probe.
 */
export function mountExport(): ExportProbe {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const saved = watchSavedFiles();
  const files: MoleculeFile[] = [];
  const host = document.createElement('div');
  document.body.append(host);
  let root = createRoot(host);
  return {
    render: (read, total) => {
      act(() =>
        root.render(
          <MoleculeExport
            read={read}
            fileName="matches: today"
            total={total}
            onSaved={(file) => files.push(file)}
          />,
        ),
      );
    },
    press: (text) => {
      vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
      const button = [...host.querySelectorAll('button')].find(
        (candidate) => candidate.textContent === text,
      );
      if (button === undefined) throw new Error(`no button reads ${text}`);
      act(() => {
        button.click();
      });
      vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false);
    },
    note: () => host.querySelector('.molecule-export__note')?.textContent ?? '',
    alert: () => host.querySelector('[role="alert"]')?.textContent ?? null,
    saved,
    files,
    leave: () => {
      vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
      act(() => root.unmount());
      root = createRoot(host);
    },
    dispose: () => {
      vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
      act(() => root.unmount());
      host.remove();
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    },
  };
}

/**
 * Wait for what the export renders. The first molfile OpenChemLib writes in a
 * process takes seconds on a busy machine, past the default second of a wait.
 * @param check - Throws until the export shows what is expected.
 * @returns When it does.
 */
export function until(check: () => void): Promise<void> {
  return vi.waitFor(check, { timeout: 20_000 });
}

/**
 * A read handing over these pages, one after the other.
 * @param list - The pages.
 * @returns The read.
 */
export function pages(...list: Array<readonly MoleculeFileRow[]>): ExportRead {
  return async function* read() {
    for (const page of list) yield page;
  };
}
