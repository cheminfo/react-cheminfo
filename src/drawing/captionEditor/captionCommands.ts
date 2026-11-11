/**
 * What can be done to the text of a caption while it is typed: bold, italic,
 * a subscript or a superscript, and a size of its own.
 */

import { baseKeymap, selectAll, toggleMark } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import type { Command, EditorState, Plugin } from 'prosemirror-state';

import { clampCaptionSize } from '../core/captions.ts';
import { IS_MAC } from '../core/platform.ts';

import { captionSchema } from './captionSchema.ts';

/** The sizes a run grows and shrinks through, in points. */
const SIZE_STEPS = [
  5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72,
];

/** A style a run of the caption can be set in, from the toolbar or a key. */
export type CaptionMark = 'bold' | 'italic' | 'sub' | 'sup';

/** Every style, in the order the toolbar shows them. */
const CAPTION_MARKS: readonly CaptionMark[] = ['bold', 'italic', 'sub', 'sup'];

/** The styles of what is selected, for the toolbar. */
export interface CaptionSelectionStyle {
  /** The styles all of the selection is set in. */
  active: ReadonlySet<CaptionMark>;
  /** Its size, in points, or undefined when it holds several. */
  size?: number;
}

/**
 * Set or clear a style on the selection, or on what is typed next.
 * @param mark - The style.
 * @returns The command.
 */
export function toggleCaptionMark(mark: CaptionMark): Command {
  return toggleMark(captionSchema.marks[mark]);
}

/**
 * Set the selection, or what is typed next, in a size.
 * @param points - The size, in points.
 * @param base - The size of the caption: a run at it carries no size.
 * @returns The command.
 */
export function setCaptionSize(points: number, base: number): Command {
  return (state, dispatch) => {
    const size = clampCaptionSize(points);
    const type = captionSchema.marks.size;
    const { from, to, empty } = state.selection;
    const tr = state.tr;
    if (empty) {
      tr.removeStoredMark(type);
      if (size !== base) tr.addStoredMark(type.create({ points: size }));
    } else if (size === base) {
      tr.removeMark(from, to, type);
    } else {
      tr.addMark(from, to, type.create({ points: size }));
    }
    dispatch?.(tr.scrollIntoView());
    return true;
  };
}

/**
 * Make the selection one step larger or smaller.
 * @param direction - 1 to grow, -1 to shrink.
 * @param base - The size of the caption.
 * @returns The command.
 */
export function stepCaptionSize(direction: 1 | -1, base: number): Command {
  return (state, dispatch) => {
    const current = captionSelectionStyle(state, base).size ?? base;
    const next =
      direction === 1
        ? SIZE_STEPS.find((step) => step > current)
        : SIZE_STEPS.findLast((step) => step < current);
    if (next === undefined) return false;
    return setCaptionSize(next, base)(state, dispatch);
  };
}

/**
 * The styles of what is selected: those every character of it carries, or
 * those of the caret, and its size when there is one.
 * @param state - The editor state.
 * @param base - The size of the caption.
 * @returns The styles.
 */
export function captionSelectionStyle(
  state: EditorState,
  base: number,
): CaptionSelectionStyle {
  const { from, to, empty, $from } = state.selection;
  const active = new Set<CaptionMark>();
  if (empty) {
    const marks = state.storedMarks ?? $from.marks();
    for (const name of CAPTION_MARKS) {
      if (captionSchema.marks[name]?.isInSet(marks)) active.add(name);
    }
    const size = captionSchema.marks.size.isInSet(marks);
    return { active, size: size ? (size.attrs.points as number) : base };
  }
  const sizes = new Set<number>();
  const counts = new Map<CaptionMark, number>();
  let characters = 0;
  state.doc.nodesBetween(from, to, (node, position) => {
    if (!node.isText) return;
    const length =
      Math.min(to, position + node.nodeSize) - Math.max(from, position);
    if (length <= 0) return;
    characters += length;
    for (const name of CAPTION_MARKS) {
      if (captionSchema.marks[name]?.isInSet(node.marks)) {
        counts.set(name, (counts.get(name) ?? 0) + length);
      }
    }
    const size = captionSchema.marks.size.isInSet(node.marks);
    sizes.add(size ? (size.attrs.points as number) : base);
  });
  for (const name of CAPTION_MARKS) {
    if (characters > 0 && counts.get(name) === characters) active.add(name);
  }
  return { active, size: sizes.size === 1 ? [...sizes][0] : undefined };
}

/**
 * The keys and the history of a caption being typed. The modifier is the one
 * the rest of the editor reads, so a shortcut does what its label says.
 * @param base - The size of the caption, for the size steps.
 * @returns The plugins.
 */
export function captionKeys(base: number): Plugin[] {
  const mod = IS_MAC ? 'Meta' : 'Ctrl';
  const superscript = toggleCaptionMark('sup');
  const grow = stepCaptionSize(1, base);
  const shrink = stepCaptionSize(-1, base);
  return [
    history(),
    keymap({
      [`${mod}-a`]: selectAll,
      [`${mod}-z`]: undo,
      [`Shift-${mod}-z`]: redo,
      [`${mod}-y`]: redo,
      [`${mod}-b`]: toggleCaptionMark('bold'),
      [`${mod}-i`]: toggleCaptionMark('italic'),
      [`${mod}-=`]: toggleCaptionMark('sub'),
      [`${mod}-+`]: superscript,
      [`Shift-${mod}-=`]: superscript,
      [`${mod}->`]: grow,
      [`Shift-${mod}-.`]: grow,
      [`${mod}-<`]: shrink,
      [`Shift-${mod}-,`]: shrink,
    }),
    keymap(baseKeymap),
  ];
}
