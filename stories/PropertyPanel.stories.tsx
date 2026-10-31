import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import '../styles/osiris.css';
import {
  BENZIDINE,
  BENZIDINE_MUTAGENIC,
} from '../src/osiris/core/__tests__/benzidine.ts';
import type { RiskDetail, RiskType } from '../src/osiris/core/index.ts';
import type { PropertyPanelProps } from '../src/osiris/ui/index.ts';
import { PropertyPanel, RiskSquare } from '../src/osiris/ui/index.ts';

const meta = {
  title: 'Osiris/PropertyPanel',
  component: PropertyPanel,
  args: { properties: BENZIDINE },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'What OSIRIS predicts about one molecule: the four toxicity risks, then the ten numbers with their bars. A risk square opens why it came back as it did — a matched fragment is drawn and located on the molecule. Styled by `react-cheminfo/styles/osiris.css`.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={FRAME_STYLE}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PropertyPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Benzidine, with its mutagenicity explained on a click. */
export const Default: Story = {
  render: (args) => <ExplainedPanel {...args} />,
};

/** For a host that already shows the formula, such as an editor's side panel. */
export const WithoutHead: Story = {
  args: { head: false },
  render: (args) => <ExplainedPanel {...args} />,
};

/** Every row stands while the prediction runs, so nothing moves when it lands. */
export const Predicting: Story = {
  args: { properties: null, pending: true },
};

/** A structure the predictor refused, said in one sentence above the panel. */
export const Refused: Story = {
  args: {
    properties: null,
    problem: 'This structure has no atoms, so there is nothing to predict.',
    emptyMessage: 'Draw a structure to predict its properties.',
  },
};

/** The square alone, as a cell of a comparison table draws it. */
export const CompactSquares: Story = {
  render: () => (
    <div style={ROW_STYLE}>
      <RiskSquare risk="mutagenic" level="high" compact />
      <RiskSquare risk="tumorigenic" level="low" compact />
      <RiskSquare risk="irritant" level="none" compact />
      <RiskSquare risk="reproductive" level="unknown" compact />
      <RiskSquare risk="reproductive" level={undefined} pending compact />
    </div>
  ),
};

/**
 * The panel with the open risk kept in state, as a page keeps it, and the
 * explanation answered from a fixture rather than a worker.
 * @param props - The panel's props, from the story's args.
 * @returns The panel.
 */
function ExplainedPanel(props: PropertyPanelProps): ReactElement {
  const [openRisk, setOpenRisk] = useState<RiskType | null>('mutagenic');
  return (
    <PropertyPanel
      {...props}
      openRisk={openRisk}
      onOpenRisk={setOpenRisk}
      loadDetail={loadDetail}
    />
  );
}

/**
 * Why a risk of benzidine came back as it did.
 * @param structure - The molecule, unused: the fixture is benzidine's.
 * @param risk - Which risk was opened.
 * @returns The mutagenicity fragment, or no finding for the others.
 */
async function loadDetail(
  structure: string,
  risk: RiskType,
): Promise<RiskDetail> {
  void structure;
  return risk === 'mutagenic' ? BENZIDINE_MUTAGENIC : { risk, findings: [] };
}

const FRAME_STYLE: CSSProperties = { width: 460 };

const ROW_STYLE: CSSProperties = { display: 'flex', gap: 8 };
