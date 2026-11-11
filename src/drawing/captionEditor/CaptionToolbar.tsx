import type { IconName } from '@blueprintjs/core';
import { Button, ButtonGroup, HTMLSelect } from '@blueprintjs/core';
import type { Command } from 'prosemirror-state';
import type { ReactElement } from 'react';

import { NumberInput } from '../../number/ui/NumberInput.tsx';
import type { TextAlign } from '../core/captions.ts';
import { CAPTION_SIZE_LIMITS } from '../core/captions.ts';
import type { FontChoice } from '../core/fonts.ts';
import { CAPTION_FONTS } from '../core/fonts.ts';
import { MOD_KEY, shortcutText } from '../core/platform.ts';

import type { CaptionMark, CaptionSelectionStyle } from './captionCommands.ts';
import { setCaptionSize, toggleCaptionMark } from './captionCommands.ts';

/** The styles the toolbar sets, in its order. */
const MARKS: ReadonlyArray<{
  mark: CaptionMark;
  icon: IconName;
  label: string;
  /** What the tooltip adds to the label. */
  hint: string;
}> = [
  {
    mark: 'bold',
    icon: 'bold',
    label: 'Bold',
    hint: ` (${shortcutText([MOD_KEY, 'B'])})`,
  },
  {
    mark: 'italic',
    icon: 'italic',
    label: 'Italic',
    hint: ` (${shortcutText([MOD_KEY, 'I'])})`,
  },
  {
    mark: 'sub',
    icon: 'subscript',
    label: 'Subscript',
    hint: ` (${shortcutText([MOD_KEY, '='])})`,
  },
  {
    mark: 'sup',
    icon: 'superscript',
    label: 'Superscript',
    hint: ` (${shortcutText(['⇧', MOD_KEY, '='])})`,
  },
];

/** The alignments of a caption, in the toolbar's order. */
const ALIGNMENTS: ReadonlyArray<{
  align: TextAlign;
  icon: IconName;
  title: string;
}> = [
  { align: 'left', icon: 'align-left', title: 'Align left' },
  { align: 'center', icon: 'align-center', title: 'Centre' },
  { align: 'right', icon: 'align-right', title: 'Align right' },
];

/** What the toolbar of a caption being typed is given. */
export interface CaptionToolbarProps {
  /** The styles of what is selected. */
  selection: CaptionSelectionStyle;
  /** The size of the caption, in points. */
  base: number;
  /** Run a command on the text, and give it the keys back. */
  run: (command: Command, refocus: boolean) => void;
  /** How the lines of the caption line up. */
  align: TextAlign;
  /** The font of the caption, as a CSS font family. */
  family: string;
  /**
   * The fonts offered.
   * @default CAPTION_FONTS
   */
  fonts?: readonly FontChoice[];
  /** Whether the digits and charges of formulas are set automatically. */
  chemical: boolean;
  /** Turn the automatic formulas on or off. */
  onChemical: (chemical: boolean) => void;
  /** Align the caption anew. */
  onAlign: (align: TextAlign) => void;
  /** Set the caption in another font. */
  onFamily: (family: string) => void;
}

/**
 * The styles of a caption being typed, over the box it is typed in: bold,
 * italic, subscript, superscript and the size of the selection, then the
 * automatic formulas, the font and the alignment of the whole caption. Its
 * buttons leave the keys with the text.
 * @param props - The styles of the selection, and how to change them.
 * @returns The toolbar.
 */
export function CaptionToolbar(props: CaptionToolbarProps): ReactElement {
  const {
    selection,
    base,
    run,
    align,
    family,
    fonts = CAPTION_FONTS,
    chemical,
    onChemical,
    onAlign,
    onFamily,
  } = props;
  return (
    <div
      className="caption-toolbar no-print"
      role="toolbar"
      aria-label="Caption style"
    >
      <ButtonGroup>
        {MARKS.map(({ mark, icon, label, hint }) => (
          <Button
            key={mark}
            size="small"
            variant="minimal"
            icon={icon}
            active={selection.active.has(mark)}
            aria-pressed={selection.active.has(mark)}
            aria-label={label}
            title={`${label}${hint}`}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => {
              run(toggleCaptionMark(mark), true);
            }}
          />
        ))}
      </ButtonGroup>
      <div
        className="caption-toolbar__size"
        title={`Size of the selection, in points (${shortcutText(['⇧', MOD_KEY, '>'])} larger, ${shortcutText(['⇧', MOD_KEY, '<'])} smaller)`}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            run(() => true, true);
          }
        }}
      >
        <NumberInput
          ariaLabel="Size of the selection, in points"
          size="small"
          value={selection.size}
          allowEmpty
          placeholder="—"
          min={CAPTION_SIZE_LIMITS.min}
          max={CAPTION_SIZE_LIMITS.max}
          step={1}
          onChange={(value?: number) => {
            if (value !== undefined) run(setCaptionSize(value, base), false);
          }}
        />
        <span className="caption-toolbar__unit">pt</span>
      </div>
      <Button
        size="small"
        variant="minimal"
        text="Auto MF"
        active={chemical}
        aria-pressed={chemical}
        aria-label="Automatic formulas"
        title="Automatic formulas: the digits and charges of CH2Cl2, CDCl3, Ca2+ or SO42- set as subscripts and superscripts. Off, the text stays on its line."
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={() => {
          onChemical(!chemical);
        }}
      />
      <HTMLSelect
        iconName="caret-down"
        className="caption-toolbar__font"
        minimal
        value={family}
        aria-label="Font of the caption"
        title="Font of the caption"
        options={fonts.map((font) => ({
          value: font.family,
          label: font.name,
        }))}
        onChange={(event) => {
          onFamily(event.currentTarget.value);
        }}
      />
      <ButtonGroup>
        {ALIGNMENTS.map((choice) => (
          <Button
            key={choice.align}
            size="small"
            variant="minimal"
            icon={choice.icon}
            active={align === choice.align}
            aria-pressed={align === choice.align}
            aria-label={choice.title}
            title={choice.title}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => {
              onAlign(choice.align);
            }}
          />
        ))}
      </ButtonGroup>
    </div>
  );
}
