/**
 * What a caption will look like once drawn, shown while it is typed: the
 * digits and charges the chemical rules set, while they are on.
 */

import type { Node } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

import { chemicalRanges } from '../core/chemicalText.ts';
import type { Script } from '../core/richText.ts';

import { captionSchema } from './captionSchema.ts';

/** What the preview shows, and whether the chemical rules apply. */
interface Preview {
  chemical: boolean;
  decorations: DecorationSet;
}

/** Where the preview keeps what it decorates. */
const PREVIEW = new PluginKey<Preview>('caption-preview');

/**
 * The preview of a caption being typed.
 * @param chemical - Whether the chemical rules apply to the caption.
 * @returns The plugin.
 */
export function captionPreview(chemical: boolean): Plugin<Preview> {
  return new Plugin<Preview>({
    key: PREVIEW,
    state: {
      init: (_config, state) => preview(state.doc, chemical),
      apply: (tr, previous) => {
        const next = tr.getMeta(PREVIEW) as boolean | undefined;
        if (next !== undefined && next !== previous.chemical) {
          return preview(tr.doc, next);
        }
        return tr.docChanged ? preview(tr.doc, previous.chemical) : previous;
      },
    },
    props: {
      decorations: (state) => PREVIEW.getState(state)?.decorations,
    },
  });
}

/**
 * Turn the chemical rules of the caption being typed on or off.
 * @param chemical - Whether they apply.
 * @returns The command.
 */
export function setCaptionChemical(chemical: boolean): Command {
  return (state, dispatch) => {
    dispatch?.(state.tr.setMeta(PREVIEW, chemical));
    return true;
  };
}

function preview(document: Node, chemical: boolean): Preview {
  return { chemical, decorations: previewDecorations(document, chemical) };
}

function previewDecorations(document: Node, chemical: boolean): DecorationSet {
  if (!chemical) return DecorationSet.empty;
  const { sub, sup } = captionSchema.marks;
  const decorations: Decoration[] = [];
  let offset = 0;
  for (const line of document.children) {
    // Per character of the line: whether a mark set it.
    const fixed: boolean[] = [];
    for (const child of line.children) {
      const marked =
        sub.isInSet(child.marks) !== undefined ||
        sup.isInSet(child.marks) !== undefined;
      let units = child.text?.length ?? 0;
      while (units-- > 0) fixed.push(marked);
    }
    for (const range of chemicalRanges(line.textContent, fixed)) {
      decorations.push(
        scriptDecoration(
          offset + 1 + range.start,
          offset + 1 + range.end,
          range.script,
        ),
      );
    }
    offset += line.nodeSize;
  }
  return DecorationSet.create(document, decorations);
}

function scriptDecoration(
  from: number,
  to: number,
  script: Script,
): Decoration {
  return Decoration.inline(from, to, {
    class: `caption-chemical caption-chemical--${script}`,
  });
}
