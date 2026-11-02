import { useLayoutEffect, useRef, useState } from 'react';

/** Which panels of a stack are folded, and the gestures that change that. */
export interface PanelFolds {
  /**
   * Whether a panel shows its body.
   * @param id - The panel.
   * @returns False while it is folded away.
   */
  isOpen: (id: string) => boolean;
  /**
   * Fold a panel away, or unfold it.
   * @param id - The panel.
   * @param open - Whether it shows its body.
   */
  setOpen: (id: string, open: boolean) => void;
  /** The one panel left unfolded among several, or null. */
  focused: string | null;
  /**
   * Focus on a panel: unfold it and fold every other one, or, when it is
   * already in focus, unfold them all again.
   * @param id - The panel.
   */
  toggleFocus: (id: string) => void;
}

/** The folds of a stack kept by the editor rather than by the stack. */
export interface FoldKeeper<TId extends string = string> {
  /** The panels folded away. */
  folded: readonly string[];
  /**
   * Called with the panels folded after a gesture.
   * @param folded - The panels of the stack folded, in the order they are
   * drawn.
   */
  onChange: (folded: TId[]) => void;
}

const NOTHING_FOLDED: ReadonlySet<string> = new Set();

/**
 * The folds of a stack of panels, kept by the stack rather than by each panel
 * so that one panel can be focused — every other one folded — and the focus
 * undone.
 *
 * A panel closed while folded comes back unfolded when it is opened again: a
 * reader reopening a panel from the rail is asking to see it. An editor that
 * keeps the folds itself drops a panel from them when it closes it.
 * @param openIds - The panels in the stack, in the order they are drawn.
 * @param keeper - The folds as the editor keeps them; left out, the stack
 * keeps them, and forgets them when it unmounts.
 * @returns The folds.
 */
export function usePanelFolds<TId extends string>(
  openIds: readonly TId[],
  keeper?: FoldKeeper<TId>,
): PanelFolds {
  const [own, setOwn] = useState(NOTHING_FOLDED);
  const kept = keepOnly(keeper ? new Set(keeper.folded) : own, openIds);
  if (!keeper && kept !== own) setOwn(kept);

  // A shift-click folds every other panel in one event, one call each, so a
  // fold builds on the one written just before rather than on the render.
  const latest = useRef(kept);
  useLayoutEffect(() => {
    latest.current = kept;
  });

  function write(next: ReadonlySet<string>): void {
    latest.current = next;
    if (keeper) keeper.onChange(openIds.filter((id) => next.has(id)));
    else setOwn(next);
  }

  return {
    isOpen: (id) => !kept.has(id),
    setOpen: (id, open) => {
      const previous = latest.current;
      if (previous.has(id) !== open) return;
      const next = new Set(previous);
      if (open) next.delete(id);
      else next.add(id);
      write(next);
    },
    focused: focusedPanel(openIds, kept),
    toggleFocus: (id) => {
      write(
        focusedPanel(openIds, kept) === id
          ? NOTHING_FOLDED
          : new Set(openIds.filter((other) => other !== id)),
      );
    },
  };
}

/**
 * The folds of the panels still in the stack.
 * @param folded - The panels folded.
 * @param openIds - The panels in the stack.
 * @returns `folded` itself when every one of them is still in the stack.
 */
function keepOnly(
  folded: ReadonlySet<string>,
  openIds: readonly string[],
): ReadonlySet<string> {
  for (const id of folded) {
    if (!openIds.includes(id)) {
      return new Set(openIds.filter((open) => folded.has(open)));
    }
  }
  return folded;
}

/**
 * The panel in focus: the only one unfolded, when there is another to fold.
 * @param openIds - The panels in the stack.
 * @param folded - The panels folded.
 * @returns The panel, or null.
 */
function focusedPanel(
  openIds: readonly string[],
  folded: ReadonlySet<string>,
): string | null {
  if (openIds.length < 2) return null;
  let unfolded: string | null = null;
  for (const id of openIds) {
    if (folded.has(id)) continue;
    if (unfolded !== null) return null;
    unfolded = id;
  }
  return unfolded;
}
