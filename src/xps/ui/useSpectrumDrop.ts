/**
 * Files dropped on the viewer, and spectra pasted into it.
 *
 * **The listeners go on the viewer's own root element, never on `window` or
 * `document`.** A page is free to mount two of these — a survey scan above the
 * narrow scan it was picked from, a sample beside its reference — and a listener
 * on the document is claimed by whichever of them mounted last, so a file
 * dropped on the left chart appears on the right one. Hearing the page at all is
 * therefore an explicit opt-in — `pasteFromPage` — and a page that turns it on
 * for two viewers at once has said so on purpose.
 *
 * A paste is only delivered to whatever holds the caret, so the element this
 * hook is put on has to be able to hold it: give it `tabIndex={-1}`, and a click
 * anywhere in the viewer then makes it the paste target.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { loadSpectra } from '../core/loadSpectra.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';

import { carriesFiles, takePaste } from './dropEvents.ts';
import { readSpectrumFiles } from './readSpectrumFiles.ts';

export interface UseSpectrumDropOptions {
  /**
   * Called with the spectra a drop or a paste produced, never with an empty
   * list. Whether they replace what is open or join it is the caller's to
   * decide.
   */
  onSpectra: (spectra: XpsSpectrum[]) => void;
  /**
   * The colours already on the chart, so what arrives is drawn in one of its
   * own.
   * @default []
   */
  taken?: readonly string[];
  /**
   * Called with what to tell whoever dropped the file, and with `null` as soon
   * as a read succeeds — so the sentence goes of its own accord rather than
   * standing until the next failure.
   * @default undefined
   */
  onError?: (error: string | null) => void;
  /**
   * How many blocks of a multi-block file to read.
   * @default the reader's own limit
   */
  maxSpectra?: number;
  /**
   * Whether a paste made anywhere on the page is taken as a spectrum, rather
   * than only one made while the viewer holds the caret. Worth turning on for a
   * page showing one viewer and nothing else; never for a page showing two.
   * @default false
   */
  pasteFromPage?: boolean;
  /**
   * Whether nothing at all is read — a viewer showing a fixed set of spectra
   * takes no drop and no paste.
   * @default false
   */
  disabled?: boolean;
}

/** What the drop target is currently doing. */
export interface SpectrumDrop {
  /** Whether a file is being dragged over it, for the surface to say so. */
  isOver: boolean;
  /**
   * Whether something is being read, which a VAMAS file of forty-eight blocks
   * takes a moment over.
   */
  isReading: boolean;
  /**
   * Read files chosen some other way — a file chooser, a fetch, a test. Stable
   * for the life of the viewer.
   * @param files - The files to read.
   */
  read: (files: FileList | readonly File[]) => void;
}

/** The `ref` to put on the viewer's root, and what that root is doing. */
export type SpectrumDropHandle = [
  ref: (element: HTMLElement | null) => void,
  drop: SpectrumDrop,
];

/**
 * Take spectra dropped on one element, and pasted into it.
 *
 * The listeners are attached from the `ref` rather than from an effect, so they
 * follow the element through every time it goes away and comes back — a viewer
 * inside a folded panel is unmounted while the panel is shut, and an effect that
 * bound the element it saw at mount would hand the drop to an element nobody
 * kept.
 * @param options - Who to tell, what is already drawn, and how far to listen.
 * @returns The `ref` for the root, and whether it is being dragged over or read.
 */
export function useSpectrumDrop(
  options: UseSpectrumDropOptions,
): SpectrumDropHandle {
  const { pasteFromPage = false } = options;
  const [isOver, setIsOver] = useState(false);
  const [isReading, setIsReading] = useState(false);

  // The options are read at the moment a file lands rather than closed over when
  // the listener was attached, so a viewer whose spectra changed since mounting
  // still hands the reader the colours it is actually drawing.
  const latest = useRef(options);
  const alive = useRef(true);
  useLayoutEffect(() => {
    latest.current = options;
  });
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const report = useCallback((spectra: XpsSpectrum[], error: string | null) => {
    if (!alive.current) return;
    const { onSpectra, onError } = latest.current;
    if (spectra.length > 0) onSpectra(spectra);
    onError?.(error);
    setIsReading(false);
  }, []);

  const read = useCallback(
    (files: FileList | readonly File[]) => {
      const { disabled, taken, maxSpectra } = latest.current;
      if (disabled === true || files.length === 0) return;
      setIsReading(true);
      void readSpectrumFiles(files, { taken, maxSpectra }).then((result) => {
        report(result.spectra, result.error);
      });
    },
    [report],
  );

  const readText = useCallback(
    (text: string) => {
      const { disabled, taken, maxSpectra } = latest.current;
      if (disabled === true) return;
      setIsReading(true);
      void loadSpectra(text, { taken, maxSpectra }).then((result) => {
        report(result.spectra, result.error);
      });
    },
    [report],
  );

  // A drag over a child fires `dragleave` on the parent, so the highlight is
  // counted in and out rather than switched: without the count it flickers off
  // every time the pointer crosses the axis it is being dragged over.
  const depth = useRef(0);
  const detach = useRef<(() => void) | null>(null);

  const attach = useCallback(
    (element: HTMLElement | null) => {
      // Torn down here rather than from a cleanup returned to React: only React
      // 19 runs one, where React 18 calls the ref with `null` instead — so
      // detaching on `null` is what unbinds the listeners under both.
      detach.current?.();
      detach.current = null;
      if (element === null) return;

      function onDragEnter(event: DragEvent) {
        if (!carriesFiles(event)) return;
        event.preventDefault();
        depth.current++;
        setIsOver(true);
      }

      function onDragOver(event: DragEvent) {
        if (!carriesFiles(event)) return;
        event.preventDefault();
        if (event.dataTransfer !== null) event.dataTransfer.dropEffect = 'copy';
      }

      function onDragLeave(event: DragEvent) {
        if (!carriesFiles(event)) return;
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setIsOver(false);
      }

      function onDrop(event: DragEvent) {
        if (!carriesFiles(event)) return;
        event.preventDefault();
        depth.current = 0;
        setIsOver(false);
        const files = event.dataTransfer?.files;
        if (files !== undefined) read(files);
      }

      function onPaste(event: Event) {
        takePaste(event as ClipboardEvent, read, readText);
      }

      element.addEventListener('dragenter', onDragEnter);
      element.addEventListener('dragover', onDragOver);
      element.addEventListener('dragleave', onDragLeave);
      element.addEventListener('drop', onDrop);
      element.addEventListener('paste', onPaste);
      detach.current = () => {
        element.removeEventListener('dragenter', onDragEnter);
        element.removeEventListener('dragover', onDragOver);
        element.removeEventListener('dragleave', onDragLeave);
        element.removeEventListener('drop', onDrop);
        element.removeEventListener('paste', onPaste);
      };
    },
    [read, readText],
  );

  useEffect(() => {
    // `globalThis` rather than a bare `document`, so a viewer rendered on a
    // server hears nothing instead of throwing on the way up.
    const page = globalThis.document as Document | undefined;
    if (!pasteFromPage || page === undefined) return;

    function onPaste(event: Event) {
      // A paste made inside the viewer has already been taken by the element's
      // own listener on the way up, and taking it again would read it twice.
      if (event.defaultPrevented) return;
      takePaste(event as ClipboardEvent, read, readText);
    }

    page.addEventListener('paste', onPaste);
    return () => {
      page.removeEventListener('paste', onPaste);
    };
  }, [pasteFromPage, read, readText]);

  return [attach, { isOver, isReading, read }];
}
