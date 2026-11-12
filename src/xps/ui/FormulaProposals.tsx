import { InputGroup } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { MF } from 'react-mf';

import { ClickToCopy } from '../../clipboard/ui/ClickToCopy.tsx';
import { useAsync } from '../../hooks/ui/useAsync.ts';
import { PanelEmpty, PanelMessage } from '../../panel/ui/PanelMessage.tsx';
import { formatPercent } from '../core/peakFormat.ts';
import type { FormulaProposal } from '../core/proposeFormulas.ts';
import { defaultFormulaRanges } from '../core/proposeFormulas.ts';

import {
  labelStyle,
  panelCellStyle as cellStyle,
  panelColumnTitleStyle as headerTextStyle,
  panelFieldStyle as fieldStyle,
  panelNumberCellStyle as numberCellStyle,
  panelStickyHeaderStyle as headerStyle,
  panelSummaryStyle as summaryStyle,
  panelTableStyle as tableStyle,
} from './panelStyles.ts';

export interface FormulaProposalsProps {
  /** Each quantified element and its atomic fraction, largest first. */
  composition: ReadonlyArray<{ element: string; fraction: number }>;
}

/**
 * The empirical formulas the composition could be, searched as it changes.
 *
 * The search is `mf-from-atomic-ratio` from mass-tools, fetched the first time
 * a composition of two elements or more is on screen. It runs over the measured
 * elements only — a survey sees no hydrogen — and the ranges it runs over are
 * the field above the list, which starts from one to ten atoms of each, a
 * trace from none.
 * @param props - Component props.
 * @returns The formulas, closest first.
 */
export function FormulaProposals(props: FormulaProposalsProps): ReactNode {
  const { composition } = props;

  const elements = composition.map((entry) => entry.element).join(' ');
  const defaultRanges = defaultFormulaRanges(composition);
  // Typed ranges hold only while the same elements are measured: ranges
  // written for C and O say nothing about a composition that gained nitrogen.
  // A trace crossing the error allowed changes the default ranges, but not the
  // elements, so ranges typed by hand are kept through it.
  const [typed, setTyped] = useState({ elements, ranges: defaultRanges });
  const ranges = typed.elements === elements ? typed.ranges : defaultRanges;

  const enough = composition.length >= 2;
  const search = useCallback(async () => {
    if (!enough) return NO_PROPOSALS;
    const { proposeFormulas } = await import('../core/proposeFormulas.ts');
    return proposeFormulas(composition, { ranges, limit: PROPOSAL_LIMIT });
  }, [composition, ranges, enough]);
  const found = useAsync(search);

  return (
    <section style={sectionStyle} aria-label="Formulas">
      <label style={fieldStyle}>
        <span style={labelStyle}>Formulas within</span>
        <InputGroup
          size="small"
          value={ranges}
          disabled={!enough}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          aria-label="Ranges of atoms the formulas are searched in"
          onChange={(event) =>
            setTyped({ elements, ranges: event.target.value })
          }
        />
      </label>

      {enough ? null : (
        <PanelEmpty>
          A formula is a ratio, so it takes two quantified elements.
        </PanelEmpty>
      )}

      {enough && found.failure !== undefined ? (
        <PanelMessage intent="danger">
          These ranges could not be searched: {found.failure.message}
        </PanelMessage>
      ) : null}

      {enough && found.status === 'success' && found.data.length === 0 ? (
        <PanelEmpty>
          No formula in these ranges is within 5 points of every measured
          percentage. Widen the ranges, or check the windows above.
        </PanelEmpty>
      ) : null}

      {enough && found.status === 'success' && found.data.length > 0 ? (
        <>
          <div style={summaryStyle}>
            Empirical formulas of the measured elements, closest first. A survey
            is good to about ten per cent, so several can fit.
          </div>
          <table style={{ ...tableStyle, opacity: found.pending ? 0.6 : 1 }}>
            <thead>
              <tr>
                <th scope="col" style={headerStyle}>
                  <span style={headerTextStyle}>Formula</span>
                </th>
                <th scope="col" style={headerStyle}>
                  <span style={headerTextStyle}>Deviation</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {found.data.map((proposal) => (
                <tr key={proposal.mf} title={comparison(proposal)}>
                  <td style={formulaCellStyle}>
                    <ClickToCopy value={proposal.mf} label="formula">
                      <MF mf={proposal.mf} />
                    </ClickToCopy>
                  </td>
                  <td style={numberCellStyle}>
                    {formatPercent(proposal.error)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </section>
  );
}

/** How many formulas the list shows. */
const PROPOSAL_LIMIT = 10;

const NO_PROPOSALS: FormulaProposal[] = [];

/**
 * A formula against the measurement, element by element, as a row's title.
 * @param proposal - The formula.
 * @returns `C 66.7 % (measured 66.5 %), O 33.3 % (measured 33.5 %)`.
 */
function comparison(proposal: FormulaProposal): string {
  return proposal.elements
    .map(
      ({ element, formula, measured }) =>
        `${element} ${formatPercent(formula)} (measured ${formatPercent(measured)})`,
    )
    .join(', ');
}

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  marginTop: 6,
} as const;

const formulaCellStyle = { ...cellStyle, width: '100%' } as const;
