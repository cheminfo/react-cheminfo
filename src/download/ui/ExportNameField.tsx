import { useLayoutEffect, useRef } from 'react';

import { TOKEN } from '../../tokens/core/familyTokens.ts';

export interface ExportNameFieldProps {
  /** What is in the box, without an extension. */
  name: string;
  /**
   * The extension the file is about to take, shown after what is typed.
   * @default ''
   */
  extension?: string;
  /** Called with what was typed. */
  onChange: (name: string) => void;
}

/**
 * What the file about to be written out is called.
 *
 * It sits at the right of the row of buttons, against the one that writes the
 * file, because that is what it is about — copying takes no name, and puts
 * itself at the other end of the row. The name the editor came in with is
 * offered, since that is what a glycan is usually saved under, but a picture
 * for a slide and a molfile for a docking run are rarely wanted under it.
 *
 * The box grows with what is typed, so the extension sits directly against the
 * name and the two read as the one filename they are about to become. Held to a
 * fixed width instead, the extension hangs at the far edge with the gap between
 * them reading as part of neither.
 * @param props - Component props.
 * @returns The field.
 */
export function ExportNameField(props: ExportNameFieldProps) {
  const { name, extension = '', onChange } = props;

  const input = useRef<HTMLInputElement>(null);
  const mirror = useRef<HTMLSpanElement>(null);
  const ruler = useRef<HTMLSpanElement>(null);

  // Measured off a copy of the text in the same font rather than counted in
  // characters, which only holds for a monospace one. The width is set on the
  // element instead of kept in state: it is what the browser has just measured,
  // so rendering again to store it would measure the same thing twice.
  useLayoutEffect(() => {
    if (!input.current || !mirror.current || !ruler.current) return;
    const measured = mirror.current.offsetWidth + CARET;
    const floor = ruler.current.offsetWidth;
    input.current.style.width = `${Math.min(Math.max(measured, floor), MAXIMUM)}px`;
  });

  return (
    <div style={fieldStyle}>
      <div className="bp6-input" style={boxStyle}>
        <input
          ref={input}
          value={name}
          aria-label="File name"
          placeholder={PLACEHOLDER}
          spellCheck={false}
          autoComplete="off"
          style={inputStyle}
          onChange={(event) => onChange(event.target.value)}
          // The name is in force as it is typed, so Enter has nothing left to
          // confirm — and is kept off the dialog, whose answer is to close.
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.stopPropagation();
          }}
        />
        {extension === '' ? null : (
          <span style={extensionStyle}>{extension}</span>
        )}
        {/* Inside the box rather than beside it, so the copy the width is
            measured off is in the font the box gives its own text and not in
            whatever the dialog around it happens to use. */}
        <span ref={mirror} style={mirrorStyle} aria-hidden="true">
          {name === '' ? PLACEHOLDER : name}
        </span>
        <span ref={ruler} style={mirrorStyle} aria-hidden="true">
          {FLOOR_SAMPLE}
        </span>
      </div>
    </div>
  );
}

/** What the box says when nothing has been typed into it. */
const PLACEHOLDER = 'File name';

/** Room for the caret past the last character, so it is never clipped. */
const CARET = 2;

/**
 * Twenty characters, which the box is never narrower than.
 *
 * A name is typed into this box as often as it is read out of it, and a box cut
 * to `glycan` leaves no room to do that in — so the floor is a name of the
 * length one usually is, measured in the box's own font rather than counted at
 * some assumed character width. `n` is about the average width of a lowercase
 * letter, which is what a filename is mostly made of.
 */
const FLOOR_SAMPLE = 'n'.repeat(20);

/** Past this a name scrolls inside the box rather than pushing the dialog. */
const MAXIMUM = 260;

// Held against the right of the row beside the button that writes the file, so
// the space in the row falls between copying and saving rather than inside the
// name.
const fieldStyle = { marginLeft: 'auto', flexShrink: 0 } as const;

// Blueprint's own input chrome, worn by the box rather than by the field inside
// it, so the name and the extension sit within one border. Positioned, so the
// hidden copy the width is measured off can be taken out of the layout without
// leaving the box it takes its font from.
const boxStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: 'fit-content',
} as const;

// The field itself brings nothing of its own: the box around it is what is
// seen, and the text has to be in the font the width was measured in.
const inputStyle = {
  font: 'inherit',
  border: 'none',
  outline: 'none',
  padding: 0,
  margin: 0,
  background: 'transparent',
  color: 'inherit',
} as const;

const extensionStyle = {
  color: TOKEN.textMuted,
  whiteSpace: 'pre',
} as const;

// A copy of what is typed, in the same font, laid out but never painted.
const mirrorStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  visibility: 'hidden',
  pointerEvents: 'none',
  whiteSpace: 'pre',
  font: 'inherit',
} as const;
