import type { TextAlign } from '../core/captions.ts';
import type { FontChoice } from '../core/fonts.ts';

import type { CaptionVerticalAlign } from './captionBox.ts';

/** What a caption editor hands back when it is kept. */
export interface CaptionEditorResult {
  /** The rich text, in the drawing's format. */
  text: string;
  /** How its lines line up on the anchor. */
  align: TextAlign;
  /** Its CSS font family. */
  family: string;
  /** Whether digits and charges are set by the chemical rules. */
  chemical: boolean;
}

/** The box a caption is typed in, and where it is laid. */
export interface CaptionEditorProps {
  /** The rich text, in the drawing's format. */
  text: string;
  /** The base size, in points. */
  size: number;
  /** The CSS font family. */
  family: string;
  /**
   * The fonts the toolbar offers.
   * @default CAPTION_FONTS
   */
  fonts?: readonly FontChoice[];
  /** How the lines line up on the anchor. */
  align: TextAlign;
  /** Whether digits and charges are set by the chemical rules. */
  chemical: boolean;
  /** Where the box is anchored, in pixels from the positioned parent's left. */
  left: number;
  /** Where the box is anchored, in pixels from the positioned parent's top. */
  top: number;
  /** Pixels per point. */
  zoom: number;
  /**
   * How the box sits on its anchor: by its first baseline, or by the top,
   * the middle or the bottom of its lines.
   * @default 'baseline'
   */
  verticalAlign?: CaptionVerticalAlign;
  /**
   * Width of the box in pixels, the text wrapping inside it.
   * @default undefined — as wide as its longest line
   */
  width?: number;
  /**
   * Text colour of the box.
   * @default the stylesheet's text colour
   */
  color?: string;
  /**
   * How far the box is turned about its anchor, in degrees clockwise; the
   * toolbar stays upright.
   * @default 0
   */
  rotation?: number;
  /** Called to keep what was typed; returning false keeps the box open. */
  onCommit: (result: CaptionEditorResult) => boolean;
  /** Called once the box is closed, kept or dropped. */
  onClose: () => void;
  /**
   * The name of the text box, for assistive technology.
   * @default 'Caption'
   */
  ariaLabel?: string;
}
