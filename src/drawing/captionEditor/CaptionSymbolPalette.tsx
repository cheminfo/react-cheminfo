import { Button } from '@blueprintjs/core';
import type { Command } from 'prosemirror-state';
import type { MouseEvent, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import {
  CAPTION_SYMBOLS,
  greekCaptionSelection,
  insertCaptionSymbol,
} from './captionSymbols.ts';
import { useToolbarInView } from './toolbarInView.ts';

/** What the symbol button of a caption's toolbar is given. */
export interface CaptionSymbolPaletteProps {
  /** The font of the caption, as a CSS font family: the palette shows it. */
  family: string;
  /** Whether the selection holds a Latin letter, which can be made Greek. */
  latin: boolean;
  /** Run a command on the text, and give it the keys back. */
  run: (command: Command, refocus: boolean) => void;
}

/**
 * The toolbar's symbol button, and the palette it opens on the far side of
 * the toolbar from the caption: Greek letters, signs and arrows typed at the
 * caret, and the Symbol font's way of making the selected letters Greek. The
 * caret stays in the text while the palette is used, and Escape closes the
 * palette rather than the caption.
 * @param props - The caption's font and selection, and how to change it.
 * @returns The button, and the palette while it is open.
 */
export function CaptionSymbolPalette(
  props: CaptionSymbolPaletteProps,
): ReactElement {
  const { family, latin, run } = props;
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  // The palette makes the toolbar taller: it is placed again as it opens.
  useToolbarInView(button);

  useEffect(() => {
    if (!open) return;
    // Heard before the caption box hears it, which would drop the caption.
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    };
    globalThis.addEventListener('keydown', closeOnEscape, true);
    return () => {
      globalThis.removeEventListener('keydown', closeOnEscape, true);
    };
  }, [open]);

  return (
    <>
      <Button
        ref={button}
        className="caption-toolbar__symbols"
        size="small"
        variant="minimal"
        text="αβ"
        active={open}
        aria-expanded={open}
        aria-label="Symbols"
        title="Symbols: Greek letters, signs and arrows"
        onMouseDown={keepCaret}
        onClick={() => {
          setOpen(!open);
        }}
      />
      {open ? (
        <div
          className="caption-symbols"
          role="group"
          aria-label="Symbols"
          style={{ fontFamily: family }}
          onMouseDown={keepCaret}
        >
          <Button
            className="caption-symbols__greek"
            size="small"
            variant="minimal"
            text="a → α"
            disabled={!latin}
            aria-label="Make the selected letters Greek"
            title="Make the selected letters Greek, as the Symbol font does: a → α, D → Δ"
            onClick={() => {
              run(greekCaptionSelection, true);
            }}
          />
          {CAPTION_SYMBOLS.map((group) => (
            <div
              key={group.name}
              className="caption-symbols__group"
              role="group"
              aria-label={group.name}
            >
              {group.symbols.map(({ symbol, name }) => (
                <Button
                  key={symbol}
                  className="caption-symbols__symbol"
                  size="small"
                  variant="minimal"
                  text={symbol}
                  aria-label={name}
                  title={name}
                  onClick={() => {
                    run(insertCaptionSymbol(symbol), true);
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

// A press on the button or anywhere in the palette, a disabled button
// included, leaves the caret where it is in the text.
function keepCaret(event: MouseEvent): void {
  event.preventDefault();
}
