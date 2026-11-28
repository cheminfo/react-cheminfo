import type { ReactElement, RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { Toolbar } from 'react-science/ui';

import { figureSvg } from '../../download/core/figureSvg.ts';
import { withPageFigureSource } from '../../download/core/pageFigureSource.ts';
import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import type { OpenFigureOptions } from '../../host/ui/useOpenFigure.tsx';
import { useOpenFigure } from '../../host/ui/useOpenFigure.tsx';
import { useSaveFigureAs } from '../../host/ui/useSaveFigureAs.tsx';
import { useSaveShortcut } from '../../host/ui/useSaveShortcut.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { IrEditorHandle } from '../core/irEditorApi.ts';
import { IR_FIGURE_SELECTOR } from '../core/irEditorApi.ts';

/** What {@link useSpectraDocument} is given. */
export interface SpectraDocumentOptions {
  /** The site, as its figures name it, e.g. `uv-vis`. */
  site: string;
  /** Whether nothing is open, so nothing can be saved. */
  empty: boolean;
  /** The ref the viewer fills in. */
  editorRef: RefObject<IrEditorHandle | null>;
  /**
   * Make the viewer known for as long as the page is on screen: a viewer
   * slot's `register`, so a host's figure carries what the viewer holds.
   * @default undefined — the viewer is made known to nothing
   */
  register?: (ref: RefObject<IrEditorHandle | null>) => () => void;
  /** What Save as offers to call the file when no one spectrum is chosen. */
  fallbackStem: string;
  /**
   * Read whatever Open picks, spectra and figures alike, several at once.
   * @default undefined — Open takes one figure saved here, through `onOpenFigure`
   */
  openFiles?: (files: readonly File[]) => Promise<void>;
  /**
   * Show a figure of the site Open picked, when `openFiles` is not given.
   * @default undefined
   */
  onOpenFigure?: OpenFigureOptions['onOpen'];
}

/** What {@link useSpectraDocument} gives the page. */
export interface SpectraDocument {
  /** Open and Save as, as items of the viewer's header. */
  actions: ReactElement;
  /** The file picker, the Save as dialog and the alerts, drawn beside. */
  dialogs: ReactElement;
  /** Open a figure saved here, picked or dropped. */
  openFigure: (file: File) => Promise<void>;
}

/** What Open takes when it opens figures only: an SVG, or a document. */
const FIGURE_ACCEPT = '.svg,image/svg+xml,.zip,application/zip';

/**
 * Keep the spectra in a file that opens here again: Save as writes the chart
 * with its bands, as the site's SVG or inside its document, carrying the
 * spectra it was drawn from; Open reads either back. Shift+Ctrl+S is Save as.
 * @param options - See {@link SpectraDocumentOptions}.
 * @returns The actions, the dialogs and the figure opener.
 */
export function useSpectraDocument(
  options: SpectraDocumentOptions,
): SpectraDocument {
  const { site, empty, editorRef, register, fallbackStem, openFiles } = options;
  const { onOpenFigure = noFigure } = options;
  const t = useChromeT();
  useEffect(() => register?.(editorRef), [register, editorRef]);
  const input = useRef<HTMLInputElement>(null);
  const opener = useOpenFigure({
    site,
    onOpen: onOpenFigure,
  });
  const saveAs = useSaveFigureAs({
    site,
    figure: async () => {
      const chart = globalThis.document.querySelector(IR_FIGURE_SELECTOR);
      if (empty || chart === null) return undefined;
      return withPageFigureSource(figureSvg(chart).markup);
    },
    stem: () => selectedStem(editorRef.current, fallbackStem),
  });
  useSaveShortcut(null, empty ? null : saveAs.open);
  const openLabel =
    openFiles === undefined ? t('spectra.openFigure') : t('spectra.open');

  const actions = (
    <>
      <Toolbar.Item
        icon="folder-open"
        tooltip={openLabel}
        aria-label={openLabel}
        onClick={() => input.current?.click()}
      />
      <Toolbar.Item
        icon="floppy-disk"
        tooltip={t('spectra.saveAsShortcut')}
        aria-label={t('spectra.saveAs')}
        disabled={empty}
        onClick={saveAs.open}
      />
    </>
  );
  const dialogs = (
    <>
      <input
        ref={input}
        type="file"
        hidden
        {...(openFiles === undefined
          ? { accept: FIGURE_ACCEPT, 'data-testid': 'open-figure-input' }
          : { multiple: true, 'data-testid': 'open-input' })}
        onChange={(event) => {
          const picked = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = '';
          if (picked.length === 0) return;
          if (openFiles === undefined) {
            void opener.open(picked[0] as File);
          } else {
            void openFiles(picked);
          }
        }}
      />
      {opener.dialog}
      {saveAs.dialog}
    </>
  );
  return { actions, dialogs, openFigure: opener.open };
}

/**
 * What Save as offers to call the file: the spectrum the panels act on, or
 * the one spectrum open.
 * @param editor - The viewer, once open.
 * @param fallback - The name when no one spectrum is chosen.
 * @returns The name, without its extension.
 */
export function selectedStem(
  editor: Pick<IrEditorHandle, 'getState'> | null,
  fallback: string,
): string {
  const state = editor?.getState();
  const spectra = state?.data.spectra ?? [];
  let selected = spectra.length === 1 ? spectra[0] : undefined;
  for (const spectrum of spectra) {
    if (spectrum.id === state?.view.selectedId) selected = spectrum;
  }
  return selected === undefined
    ? fallback
    : sanitizeFileName(selected.name, 'spectrum');
}

function noFigure(): never {
  throw new Error('This page opens no figure.');
}
