/** The separators a table can be written with. */
export type DelimiterId = 'tab' | 'comma' | 'semicolon';

/** One separator, and everything a file written with it needs. */
export interface DelimiterChoice {
  /** How the choice is named in a link and in a dialog. */
  id: DelimiterId;
  /** What the choice reads in the interface. */
  label: string;
  /** The character itself. */
  delimiter: string;
  /** Extension a file written with it takes, without the dot. */
  extension: string;
  /** What such a file is, so the system opens it with a spreadsheet. */
  mimeType: string;
}

/**
 * The separator a choice stands for, whatever a link or a stored preference
 * carries.
 *
 * An unknown id falls back to the tab rather than throwing: this value comes
 * out of an address or a stored setting, and a link written two years ago must
 * still open.
 * @param id - The named choice.
 * @returns The choice, or the tab one when the name is not known.
 */
export function delimiterChoice(id: string | undefined): DelimiterChoice {
  for (const choice of DELIMITER_CHOICES) {
    if (choice.id === id) return choice;
  }
  return TAB_CHOICE;
}

/** The tab, which is what a table is written with unless asked otherwise. */
const TAB_CHOICE: DelimiterChoice = {
  id: 'tab',
  label: 'Tab',
  delimiter: '\t',
  extension: 'tsv',
  mimeType: 'text/tab-separated-values',
};

/** Every separator offered, in the order a dialog lists them. */
export const DELIMITER_CHOICES: readonly DelimiterChoice[] = [
  TAB_CHOICE,
  {
    id: 'comma',
    label: 'Comma',
    delimiter: ',',
    extension: 'csv',
    mimeType: 'text/csv',
  },
  {
    id: 'semicolon',
    label: 'Semicolon',
    delimiter: ';',
    extension: 'csv',
    mimeType: 'text/csv',
  },
];

/** The separator used when a caller does not name one. */
export const DEFAULT_DELIMITER = '\t';
