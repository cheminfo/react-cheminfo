import { InputGroup } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { PanelMessage } from '../../panel/ui/PanelMessage.tsx';
import { chooseSurveyLines, readElementList } from '../core/surveyElements.ts';
import type { XpsSurveyLine } from '../core/surveyLines.ts';
import type { XpsInstrument } from '../core/xpsInstrument.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';

import { labelStyle, panelFieldStyle as fieldStyle } from './panelStyles.ts';

export interface SurveyElementsFieldProps {
  /** The survey being quantified. */
  spectrum: XpsSpectrum;
  /** The lines it is quantified on now. */
  lines: readonly XpsSurveyLine[];
  /** Whose factors decide which line a new element is read on. */
  instrument: XpsInstrument;
  /** Told the lines that follow from what was typed. */
  onLines: (lines: XpsSurveyLine[]) => void;
}

/**
 * The elements a survey is quantified for, typed as a chemist writes them.
 *
 * Read once the field is left or Enter is pressed rather than on every key: an
 * element half typed — the `M` of `Mo` — is another element, and a table that
 * rebuilt itself around manganese for one keystroke would be noise. An element
 * already in the table keeps its line and window; a new one is read on its
 * strongest line. What cannot be quantified is said under the field, and the
 * text stays as typed so the word is still there to correct.
 * @param props - Component props.
 * @returns The field.
 */
export function SurveyElementsField(
  props: SurveyElementsFieldProps,
): ReactNode {
  const { spectrum, lines, instrument, onLines } = props;
  const [draft, setDraft] = useState(() => elementsText(lines));
  const [notice, setNotice] = useState<string | null>(null);

  function commit(): void {
    const reading = readElementList(draft);
    const choice = chooseSurveyLines(
      reading.elements,
      lines,
      instrument,
      spectrum,
    );
    setNotice(noticeOf(reading.unknown, reading.unseen, choice.missing));
    if (elementsText(choice.lines) !== elementsText(lines)) {
      onLines(choice.lines);
    }
  }

  return (
    <div style={fieldStyle}>
      <label style={fieldStyle}>
        <span style={labelStyle}>Elements</span>
        <InputGroup
          size="small"
          value={draft}
          placeholder="C O N"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit();
          }}
        />
      </label>
      {notice === null ? null : <PanelMessage>{notice}</PanelMessage>}
    </div>
  );
}

/**
 * The elements of a set of lines, as the field shows them.
 * @param lines - The lines.
 * @returns Their elements, separated by spaces.
 */
function elementsText(lines: readonly XpsSurveyLine[]): string {
  return lines.map((line) => line.element).join(' ');
}

/**
 * What the field says about what it could not quantify.
 * @param unknown - Words that are no element symbol.
 * @param unseen - Hydrogen and helium, if typed.
 * @param missing - Elements without a line inside the survey.
 * @returns The sentences, `null` when everything typed was quantified.
 */
function noticeOf(
  unknown: readonly string[],
  unseen: readonly string[],
  missing: readonly string[],
): string | null {
  const sentences: string[] = [];
  if (unknown.length === 1) {
    sentences.push(`${LIST.format(unknown)} is not an element symbol.`);
  } else if (unknown.length > 1) {
    sentences.push(`${LIST.format(unknown)} are not element symbols.`);
  }
  if (unseen.length > 0) {
    sentences.push(
      `A survey does not see ${LIST.format(unseen)}, so ${unseen.length === 1 ? 'it is' : 'they are'} left out.`,
    );
  }
  if (missing.length > 0) {
    sentences.push(
      `No line of ${LIST.format(missing)} lies inside this spectrum.`,
    );
  }
  return sentences.length === 0 ? null : sentences.join(' ');
}

/** Words as an English sentence lists them: `A, B and C`. */
const LIST = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
