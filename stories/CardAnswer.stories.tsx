import type { Meta, StoryObj } from '@storybook/react-vite';

import { CardAnswer } from '../src/card/ui/CardAnswer.tsx';
import { CardFacts } from '../src/card/ui/CardFacts.tsx';
import { CardFold } from '../src/card/ui/CardFold.tsx';
import { CardFoot } from '../src/card/ui/CardFoot.tsx';
import { CardFrame } from '../src/card/ui/CardFrame.tsx';
import { CardStatus } from '../src/card/ui/CardStatus.tsx';

import { ChatFrame, TitrationCurve } from './cardFixtures.tsx';
import { TITRATION_ROWS, titrationTable } from './titrationFixtures.ts';

const meta = {
  title: 'Card/CardAnswer',
  component: CardAnswer,
  args: { lead: null },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A whole card: the answer on the line that leaves the chat’s corner free, what comes under it, and the last row (`CardFoot`) — the details folded away (`CardFold`), the copy of the card’s table and the way to the site’s page, floated so what a fold opens takes the card’s whole width.',
      },
    },
  },
} satisfies Meta<typeof CardAnswer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A titration answered: the number asked for, the curve, and the points folded. */
export const Default: Story = {
  render: () => (
    <ChatFrame>
      <CardAnswer
        lead={
          <>
            <div className="card__value">pH 8.72</div>
            <p className="card__line card__muted">
              at equivalence, 10 mL of acetic acid 0.1 M titrated with NaOH
            </p>
          </>
        }
        table={{
          table: titrationTable,
          tooltip: 'Copy the curve as a table, to paste into a spreadsheet',
        }}
        more={{
          summary: `The ${TITRATION_ROWS.length} points of the curve`,
          content: <TitrationPoints />,
        }}
      >
        <TitrationCurve />
      </CardAnswer>
    </ChatFrame>
  ),
};

/** A column of a card: its key numbers, then two folds beside the actions. */
export const WithFacts: Story = {
  render: () => (
    <ChatFrame width={420}>
      <CardFrame stack>
        <p className="card__header card__title">Iron · element 26</p>
        <CardFacts
          facts={[
            { label: 'Atomic weight', value: '55.845', detail: 'Da' },
            { label: 'Unpaired electrons', value: '4', copy: false },
            { label: 'Electronegativity', value: '1.83' },
          ]}
        />
        <CardFoot
          table={{ table: () => 'Isotope\tAbundance\n56Fe\t91.75 %' }}
          folds={
            <>
              <CardFold summary="All 4 stable isotopes" stack>
                <p className="card__note">⁵⁴Fe 5.85 % · ⁵⁶Fe 91.75 %</p>
                <p className="card__note">⁵⁷Fe 2.12 % · ⁵⁸Fe 0.28 %</p>
              </CardFold>
              <CardFold summary="About these values">
                <p className="card__note">From the IUPAC 2021 tables.</p>
              </CardFold>
            </>
          }
        />
      </CardFrame>
    </ChatFrame>
  ),
};

/** A remark at the start of the last row, and no fold. */
export const WithNote: Story = {
  render: () => (
    <ChatFrame width={420}>
      <CardFrame stack>
        <p className="card__header card__title">C6H14 · 5 isomers</p>
        <CardFoot
          note="The first 5 of 5 drawn"
          table={{ table: () => 'SMILES\nCCCCCC' }}
        />
      </CardFrame>
    </ChatFrame>
  ),
};

/** While the answer is computed: what is done, beside the spinner. */
export const Waiting: Story = {
  render: () => (
    <ChatFrame width={420}>
      <CardFrame>
        <CardStatus waiting="Converting…" />
      </CardFrame>
    </ChatFrame>
  ),
};

/**
 * The points of the curve, as the fold lists them.
 * @returns The table.
 */
function TitrationPoints() {
  return (
    <table className="bp6-html-table bp6-compact">
      <thead>
        <tr>
          <th>Volume (mL)</th>
          <th>pH</th>
        </tr>
      </thead>
      <tbody>
        {TITRATION_ROWS.map(([volume, ph]) => (
          <tr key={volume}>
            <td>{volume}</td>
            <td>{ph}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
