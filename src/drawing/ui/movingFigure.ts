/**
 * The image a figure shows while it moves: the same figure, its root saying
 * `moving`, made once for each figure and kept for the next drawing of it.
 * Only the screen shows it; the document, its files and its copies keep the
 * figure as it was written, held still.
 */

import { useCallback } from 'react';

import { useAsync } from '../../hooks/ui/useAsync.ts';
import { figureMoves, movingFigure } from '../render/motion.ts';

/**
 * The glyphs of the round badges at a figure's top right, drawn about the
 * centre of a badge 22 units across: the pencil that changes the figure on
 * the site that drew it, and play and pause on a figure that moves.
 */
export const FIGURE_MARK_GLYPHS = {
  change:
    'M-5.5 3.5V5.5H-3.5L3.6 -1.6L1.6 -3.6ZM5.2 -3.2C5.5 -3.5 5.5 -3.9 5.2 -4.2L4.2 -5.2C3.9 -5.5 3.5 -5.5 3.2 -5.2L2.3 -4.3L4.3 -2.3Z',
  play: 'M-2.5 -4.8L4.8 0L-2.5 4.8Z',
  pause: 'M-4.2 -4.5H-1.3V4.5H-4.2ZM1.3 -4.5H4.2V4.5H1.3Z',
} as const;

/** Whether the reader's system asks for less motion, read as the page opens. */
const REDUCED_MOTION =
  globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** How many figures the moving images are kept for. */
const KEPT = 16;

/**
 * The moving image of a figure: while it is made, and once made — `null` for
 * a figure that never moves.
 */
interface Made {
  promise: Promise<string | undefined>;
  value?: string | null;
}

/** The moving image of each figure, by its own. */
const made = new Map<string, Made>();

/**
 * The image a figure shows on screen. One already made is shown at once, so
 * a figure dragged across the page never flickers back to its still image.
 * @param src - The figure, as a `data:` URL.
 * @param moving - Whether it is to move: false for a figure held still, and
 * for every view that is not the page itself — a print, a thumbnail.
 * @returns The moving image once it is made, otherwise the figure's own.
 */
export function useMovingFigureSource(src: string, moving: boolean): string {
  const want = moving && !REDUCED_MOTION;
  const known = want ? made.get(src)?.value : null;
  const read = useCallback(
    async () =>
      want && known === undefined ? movingFigureSource(src) : undefined,
    [src, want, known],
  );
  const result = useAsync(read);
  if (!want) return src;
  if (known !== undefined) return known ?? src;
  if (result.pending || result.status !== 'success') return src;
  return result.data ?? src;
}

/**
 * Whether a figure can be set moving, where the reader's system allows motion
 * at all — the question a play or pause badge asks before it is drawn.
 * @param src - The figure, as a `data:` URL, or `undefined` for none.
 * @returns True once it is read and found to move.
 */
export function useFigureMoves(src: string | undefined): boolean {
  const read = useCallback(
    async () =>
      src === undefined || REDUCED_MOTION ? undefined : movingFigureSource(src),
    [src],
  );
  const result = useAsync(read);
  return !result.pending && result.status === 'success' && !!result.data;
}

/**
 * The moving image of a figure, made the first time it is asked for.
 * @param src - The figure, as a `data:` URL.
 * @returns The moving image, or `undefined` for a picture that never moves.
 */
export function movingFigureSource(src: string): Promise<string | undefined> {
  const known = made.get(src);
  if (known) return known.promise;
  const entry: Made = { promise: makeMoving(src) };
  void entry.promise.then((value) => {
    entry.value = value ?? null;
  });
  made.set(src, entry);
  if (made.size > KEPT) {
    const oldest = made.keys().next().value;
    if (oldest !== undefined) made.delete(oldest);
  }
  return entry.promise;
}

async function makeMoving(src: string): Promise<string | undefined> {
  if (!src.startsWith('data:image/svg+xml')) return undefined;
  try {
    const response = await fetch(src);
    if (!response.ok) return undefined;
    const svg = await response.text();
    if (!figureMoves(svg)) return undefined;
    return await dataUrl(
      new Blob([movingFigure(svg)], { type: 'image/svg+xml' }),
    );
  } catch {
    // A picture that cannot be read is shown as it is, still.
    return undefined;
  }
}

function dataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const { result } = reader;
      if (typeof result === 'string') resolve(result);
      else reject(new Error('The figure could not be read.'));
    });
    reader.addEventListener('error', () => {
      reject(reader.error ?? new Error('The figure could not be read.'));
    });
    reader.readAsDataURL(blob);
  });
}
