import type { Command } from 'prosemirror-state';
import { EditorState, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { TextAlign } from '../core/captions.ts';
import { hasModifier } from '../core/platform.ts';

import { CaptionToolbar } from './CaptionToolbar.tsx';
import { captionBoxPlacement, realignedShift } from './captionBox.ts';
import type { CaptionSelectionStyle } from './captionCommands.ts';
import { captionKeys, captionSelectionStyle } from './captionCommands.ts';
import type { CaptionEditorProps } from './captionEditorProps.ts';
import { captionPreview, setCaptionChemical } from './captionPreview.ts';
import { captionDocument, captionText } from './captionSchema.ts';

/**
 * The box a caption is typed in, laid over a drawing where the caption goes,
 * in its font and size, with what it will look like: bold, italic, scripts,
 * sizes, and the digits and charges the chemical rules set. Its toolbar also
 * turns those rules off, and sets the font and the alignment. It opens
 * focused with everything selected; ⌘Enter or a click elsewhere keeps it,
 * Enter starts a line, Escape drops the change. A caption aligned anew keeps
 * its place on screen. `react-cheminfo/styles/caption-editor.css` draws it.
 * @param props - The caption, and where it is laid.
 * @returns The box and its toolbar.
 */
export function CaptionEditor(props: CaptionEditorProps): ReactElement {
  // What the box opens on: the editor keeps its own from there.
  const { text: openText, size: base, fonts, ariaLabel = 'Caption' } = props;
  const {
    align: openAlign,
    family: openFamily,
    chemical: openChemical,
  } = props;
  const { left, top, zoom, width, color, onCommit, onClose } = props;
  const { verticalAlign = 'baseline', rotation = 0 } = props;
  const frame = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const closed = useRef(false);
  // Seeded once: what is typed never comes back into the box as a new state.
  const [opened] = useState(() => {
    const plugins = captionKeys(base);
    plugins.push(captionPreview(openChemical));
    const doc = captionDocument(openText);
    const selection = TextSelection.between(
      doc.resolve(0),
      doc.resolve(doc.content.size),
    );
    const state = EditorState.create({ doc, plugins, selection });
    return { base, state, label: ariaLabel };
  });
  const [selected, setSelected] = useState<CaptionSelectionStyle>(() =>
    captionSelectionStyle(opened.state, opened.base),
  );
  // `shift` is how far the anchor has moved along the line, in points, as
  // the caption was aligned anew.
  const [layout, setLayout] = useState(() => ({
    align: openAlign,
    family: openFamily,
    chemical: openChemical,
    shift: 0,
  }));

  useEffect(() => {
    const mount = host.current;
    if (!mount) return;
    const editor = new EditorView(mount, {
      state: opened.state,
      attributes: {
        class: 'caption-editor__text',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': opened.label,
        spellcheck: 'false',
      },
      dispatchTransaction(transaction) {
        const next = editor.state.apply(transaction);
        editor.updateState(next);
        setSelected(captionSelectionStyle(next, opened.base));
      },
    });
    view.current = editor;
    // The box opens because the visitor asked to type here: it takes the keys.
    editor.focus();
    return () => {
      view.current = null;
      editor.destroy();
    };
  }, [opened]);

  const { align, family, chemical, shift } = layout;
  const size = opened.base * zoom;
  const placed = captionBoxPlacement({
    left,
    top,
    zoom,
    size: opened.base,
    align,
    verticalAlign,
    rotation,
    shift,
  });
  const box: CSSProperties & Record<'--zoom', string> = {
    left: placed.left,
    top: placed.top,
    transform: placed.transform,
    width,
    '--zoom': `${zoom}px`,
  };

  const close = (keep: boolean) => {
    if (closed.current) return;
    closed.current = true;
    const editor = view.current;
    if (keep && editor) {
      const text = captionText(editor.state.doc);
      if (!onCommit({ text, align, family, chemical })) {
        // What cannot be kept keeps its box open, and what was typed in it.
        closed.current = false;
        editor.focus();
        return;
      }
    }
    onClose();
  };

  // A caption aligned anew keeps its place: the anchor moves, not the words.
  const realign = (next: TextAlign) => {
    const editor = view.current;
    const wrapper = frame.current;
    if (!editor || !wrapper) return;
    const across = realignedShift(align, next, wrapper.offsetWidth, zoom);
    setLayout({ ...layout, align: next, shift: shift + across });
    editor.focus();
  };

  const setFamily = (next: string) => {
    setLayout({ ...layout, family: next });
    view.current?.focus();
  };

  const run = (command: Command, refocus: boolean) => {
    const editor = view.current;
    if (!editor) return;
    command(editor.state, editor.dispatch);
    if (refocus) editor.focus();
  };

  const setChemical = (next: boolean) => {
    setLayout({ ...layout, chemical: next });
    run(setCaptionChemical(next), true);
  };

  return (
    <div
      ref={frame}
      className={
        width === undefined
          ? 'caption-editor'
          : 'caption-editor caption-editor--wrapped'
      }
      style={box}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Escape') close(false);
        if (event.key === 'Enter' && hasModifier(event)) {
          event.preventDefault();
          close(true);
        }
      }}
      onBlur={(event) => {
        const wrapper = event.currentTarget;
        if (wrapper.contains(event.relatedTarget)) return;
        // A remount rebuilds the box in place, which takes the keys away and
        // straight back: only a blur that leaves them elsewhere closes it.
        queueMicrotask(() => {
          if (!wrapper.contains(document.activeElement)) close(true);
        });
      }}
    >
      <CaptionToolbar
        selection={selected}
        base={opened.base}
        run={run}
        align={align}
        family={family}
        fonts={fonts}
        chemical={chemical}
        onChemical={setChemical}
        onAlign={realign}
        onFamily={setFamily}
      />
      <div
        ref={host}
        className="caption-editor__box"
        style={{
          fontSize: size,
          fontFamily: family,
          textAlign: align,
          color,
          // Turned about the anchor, as the caption is drawn; the toolbar
          // stays upright above it.
          ...(rotation === 0
            ? {}
            : {
                transform: `rotate(${rotation}deg)`,
                transformOrigin: placed.transformOrigin,
              }),
        }}
      />
    </div>
  );
}
