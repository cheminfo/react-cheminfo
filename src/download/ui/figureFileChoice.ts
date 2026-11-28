import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';

/**
 * Files of another kind offered after the two a picture is saved as, such as a
 * molfile.
 */
export interface FigureFileChoice<TFile extends string> {
  /** The files offered. */
  options: ReadonlyArray<OverlayOption<TFile>>;
  /** The one picked, or `null` while a picture is. */
  value: TFile | null;
  /** Called with the file picked, and with `null` when a picture is. */
  onChange: (value: TFile | null) => void;
  /** The line at the foot of the panel while one is picked. */
  hint: string;
  /**
   * What Copy says while one is picked, for a file Copy takes in place of the
   * picture, such as a molfile pasted into an editor.
   * @default undefined — Copy takes the picture whatever is picked
   */
  copy?: FigureFileCopy;
}

/** What Copy says while it takes a file rather than the picture. */
export interface FigureFileCopy {
  /** Said beside Copy before it is pressed. */
  ready: string;
  /** Said once it has copied. */
  copied: string;
}
