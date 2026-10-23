import type { Meta, StoryObj } from '@storybook/react-vite';

import { CardDetailsButton } from '../src/card/ui/CardDetailsButton.tsx';
import { CardFigure } from '../src/card/ui/CardFigure.tsx';
import { CardFrame } from '../src/card/ui/CardFrame.tsx';
import { CopyTableButton } from '../src/card/ui/CopyTableButton.tsx';
import { Structure } from '../src/structure/ui/Structure.tsx';
import { StructureExportButton } from '../src/structure/ui/StructureExportButton.tsx';

import { ChatFrame, TitrationCurve } from './cardFixtures.tsx';
import { CAFFEINE } from './structureFixtures.ts';
import { titrationTable } from './titrationFixtures.ts';

const meta = {
  title: 'Card/CardFrame',
  component: CardFrame,
  args: { children: null },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The page a chat frames inline for one answer — a site page under `?embed=1&card=1` — drawn by `react-cheminfo/styles/card.css`. Framed, it reports its height so the frame fits it, and grows while a panel it opened is open. Its first line leaves the chat’s corner free (`card__header`), and its last row (`card__end`) holds the copy of its table and the way to the site’s page.',
      },
    },
  },
} satisfies Meta<typeof CardFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A titration answered: the number asked for, the curve, and the way out. */
export const Default: Story = {
  render: () => (
    <ChatFrame>
      <CardFrame>
        <p className="card__header card__title">pH 8.72 at equivalence</p>
        <p className="card__muted">
          10 mL of acetic acid 0.1 M titrated with NaOH 0.1 M
        </p>
        <CardFigure fileName="acetic-acid-titration">
          <TitrationCurve />
        </CardFigure>
        <div className="card__end">
          <p className="card__note">Phenolphthalein marks the equivalence.</p>
          <CopyTableButton
            table={titrationTable}
            tooltip="Copy the curve as a table, to paste into a spreadsheet"
          />
          <CardDetailsButton />
        </div>
      </CardFrame>
    </ChatFrame>
  ),
};

/** A structure answered, its notations one glyph away beside its picture. */
export const WithStructure: Story = {
  render: () => (
    <ChatFrame width={420}>
      <CardFrame>
        <p className="card__header card__title">Caffeine</p>
        <p className="card__muted">C8H10N4O2 · 194.19 g/mol</p>
        <CardFigure
          fileName="caffeine"
          tools={<StructureExportButton smiles={CAFFEINE} name="caffeine" />}
        >
          <Structure smiles={CAFFEINE} width={240} height={160} />
        </CardFigure>
        <div className="card__end">
          <CardDetailsButton />
        </div>
      </CardFrame>
    </ChatFrame>
  ),
};
