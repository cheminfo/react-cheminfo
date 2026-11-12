import { HTMLSelect } from '@blueprintjs/core';
import type { ReactNode } from 'react';

import { NumberInput } from '../../number/ui/NumberInput.tsx';
import { formatPercent } from '../core/peakFormat.ts';
import type { SurveyProblem, SurveyQuantity } from '../core/quantifySurvey.ts';
import type { XpsSurveyLine } from '../core/surveyLines.ts';
import { availableLines, surveyLine } from '../core/surveyLines.ts';
import type { XpsInstrument } from '../core/xpsInstrument.ts';

import {
  panelBarFillStyle,
  panelBarTrackStyle,
  panelCellStyle as cellStyle,
  panelColumnTitleStyle as headerTextStyle,
  panelNumberCellStyle as numberCellStyle,
  panelStickyHeaderStyle as headerStyle,
  panelTableStyle as tableStyle,
} from './panelStyles.ts';

export interface SurveyTableProps {
  /** The quantification, one row per line, in the order of the lines. */
  rows: readonly SurveyQuantity[];
  /** Whose factors the lines are chosen among. */
  instrument: XpsInstrument;
  /** The binding energies the survey covers, lowest first. */
  extent: readonly [number, number];
  /** Told that one line was given another level or another window. */
  onChange: (index: number, line: XpsSurveyLine) => void;
  /** Told where the pointer rests, in eV of binding energy; `null` once it leaves. */
  onHover: (bindingEnergy: number | null) => void;
}

/**
 * The composition of a survey, one element per row, every choice behind it
 * editable where it is read.
 *
 * The level an element is read on is a choice among the lines the instrument
 * has a factor for, and choosing another one puts its usual window back. The
 * window is two numbers, in eV of binding energy, typed rather than dragged:
 * an analyst who moves a bound wants the bound they read in a paper, not the
 * pixel the pointer landed on. A row that is left out of the composition says
 * why in place of its percentage.
 * @param props - Component props.
 * @returns The table.
 */
export function SurveyTable(props: SurveyTableProps): ReactNode {
  const { rows, instrument, extent, onChange, onHover } = props;

  return (
    <table style={tableStyle} onMouseLeave={() => onHover(null)}>
      <thead>
        <tr>
          {COLUMN_TITLES.map((title) => (
            <th key={title} scope="col" style={headerStyle}>
              <span style={headerTextStyle}>{title}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            key={row.element}
            onMouseEnter={() => onHover((row.from + row.to) / 2)}
          >
            <th scope="row" style={lineCellStyle}>
              <HTMLSelect
                minimal
                value={row.orbital}
                style={selectStyle}
                aria-label={`The level ${row.element} is quantified on`}
                onChange={(event) => {
                  const next = surveyLine(
                    row.element,
                    event.target.value,
                    extent,
                  );
                  if (next !== null) onChange(index, next);
                }}
                options={levelOptions(row, instrument, extent)}
              />
            </th>
            <td style={windowCellStyle}>
              <NumberInput
                size="small"
                buttons={false}
                step={0.5}
                value={row.from}
                ariaLabel={`Lower bound of the ${row.element} window, in eV`}
                style={boundStyle}
                onChange={(from) => onChange(index, lineOf(row, { from }))}
              />
            </td>
            <td style={windowCellStyle}>
              <NumberInput
                size="small"
                buttons={false}
                step={0.5}
                value={row.to}
                ariaLabel={`Upper bound of the ${row.element} window, in eV`}
                style={boundStyle}
                onChange={(to) => onChange(index, lineOf(row, { to }))}
              />
            </td>
            <td style={numberCellStyle}>{row.factor ?? '—'}</td>
            <td style={shareCellStyle}>
              {row.problem === null ? (
                <>
                  <span style={percentStyle}>
                    {formatPercent(row.atomicFraction)}
                  </span>
                  <span style={panelBarTrackStyle}>
                    <span
                      style={{
                        ...panelBarFillStyle,
                        display: 'block',
                        width: `${row.atomicFraction * 100}%`,
                      }}
                    />
                  </span>
                </>
              ) : (
                <span style={problemStyle} title={PROBLEM_TITLES[row.problem]}>
                  {PROBLEM_LABELS[row.problem]}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * The levels a row can be read on: those the instrument has a factor for
 * inside the survey, and the one in force even when it has none.
 * @param row - The row.
 * @param instrument - The instrument.
 * @param extent - The binding energies the survey covers.
 * @returns The options of the level picker.
 */
function levelOptions(
  row: SurveyQuantity,
  instrument: XpsInstrument,
  extent: readonly [number, number],
): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  for (const { orbital } of availableLines(instrument, row.element, extent)) {
    options.push({ value: orbital, label: `${row.element} ${orbital}` });
  }
  if (!options.some((option) => option.value === row.orbital)) {
    options.unshift({
      value: row.orbital,
      label: `${row.element} ${row.orbital}`,
    });
  }
  return options;
}

/**
 * A row as the line it was computed from, with one bound changed.
 * @param row - The row.
 * @param change - The bound that changes.
 * @returns The line.
 */
function lineOf(
  row: SurveyQuantity,
  change: Partial<Pick<XpsSurveyLine, 'from' | 'to'>>,
): XpsSurveyLine {
  const { element, orbital, from, to } = row;
  return { element, orbital, from, to, ...change };
}

/** The headings name the columns rather than sort them. */
const COLUMN_TITLES = ['Line', 'From', 'To', 'RSF', 'Atomic %'] as const;

/** What a row says in place of its percentage. */
const PROBLEM_LABELS: Record<SurveyProblem, string> = {
  noFactor: 'no factor',
  outside: 'outside',
  noSignal: 'no signal',
};

/** And what it means, on hover. */
const PROBLEM_TITLES: Record<SurveyProblem, string> = {
  noFactor:
    'The instrument has no sensitivity factor for this line: choose another line, or add the factor to the instrument.',
  outside: 'The window holds fewer than two points of this spectrum.',
  noSignal: 'Nothing rises above the background inside this window.',
};

/**
 * Wide enough for `Mo 3d5/2` beside the picker's arrows: a select left to size
 * itself inside a shrinking table cell shrinks to the arrows alone.
 */
const selectStyle = {
  fontSize: 11,
  height: 22,
  paddingLeft: 2,
  minWidth: 84,
} as const;

const lineCellStyle = {
  ...cellStyle,
  textAlign: 'left',
  fontWeight: 400,
  padding: '1px 2px',
} as const;

const windowCellStyle = { ...cellStyle, padding: '1px 2px' } as const;

/** Wide enough for `1200.5`, and no wider: the share needs the room. */
const boundStyle = { width: 58 } as const;

const shareCellStyle = {
  ...cellStyle,
  width: '100%',
  minWidth: 70,
} as const;

/** The share is what the table is read for, so it is the one figure emphasised. */
const percentStyle = { display: 'block', fontWeight: 600 } as const;

const problemStyle = { opacity: 0.7, fontStyle: 'italic' } as const;
