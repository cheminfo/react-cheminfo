import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { TutorialStep } from '../src/pedagogy/core/types.ts';
import { GlossaryProvider } from '../src/pedagogy/ui/GlossaryProvider.tsx';
import { GlossaryText } from '../src/pedagogy/ui/GlossaryText.tsx';
import type { TutorialStepStripProps } from '../src/pedagogy/ui/TutorialStepStrip.tsx';
import { TutorialStepStrip } from '../src/pedagogy/ui/TutorialStepStrip.tsx';

import type { SmilesStepPayload } from './pedagogyFixtures.ts';
import { SMILES_GLOSSARY, SMILES_TUTORIAL } from './pedagogyFixtures.ts';

// What each coloured strip is called on a SMILES course.
const LEVEL_LABELS = {
  beginner: 'Atoms, bonds, branches',
  intermediate: 'Rings, brackets, charges',
  advanced: 'Stereochemistry and fused rings',
};

/**
 * The strip as a page owns it: which step is open is state, and the step itself
 * is drawn under the strips so clicking a number does something.
 * @param props - Whatever the story is passing, `activeIndex` being the step it
 * opens on.
 * @returns The strips, the pager, and the open step.
 */
function TutorialStepStripDemo(props: TutorialStepStripProps): ReactElement {
  const [index, setIndex] = useState(props.activeIndex);
  const step = props.steps[Math.min(index, props.steps.length - 1)];

  return (
    <div style={COLUMN_STYLE}>
      <TutorialStepStrip
        {...props}
        activeIndex={index}
        onSelect={(next) => {
          setIndex(next);
          props.onSelect(next);
        }}
      />
      {step !== undefined && (
        <div style={STEP_STYLE}>
          <h4 style={TITLE_STYLE}>{step.title}</h4>
          <p style={PROSE_STYLE}>
            <GlossaryText text={step.description} />
          </p>
          <code style={CODE_STYLE}>{preloaded(step)}</code>
        </div>
      )}
    </div>
  );
}

/**
 * What the step preloads into the playground, when the tour carries one — the
 * payload is the tool's, and the strip itself never looks at it.
 * @param step - The step that is open.
 * @returns The string, or a dash for a tour that preloads nothing.
 */
function preloaded(step: TutorialStep): string {
  const payload = step as TutorialStep & Partial<SmilesStepPayload>;
  if (payload.smiles === undefined) return '—';
  return `${payload.smiles}    ${payload.compound ?? ''}`.trimEnd();
}

/**
 * A tour is as wide as the page it is at the top of.
 * @param Story - The story being decorated.
 * @returns The story at page width, under the glossary its terms resolve
 * against.
 */
const inAPage: Decorator = (Story) => (
  <GlossaryProvider glossary={SMILES_GLOSSARY}>
    <div style={{ width: 'min(52rem, 92vw)' }}>
      <Story />
    </div>
  </GlossaryProvider>
);

/** A story about the strips has nothing to route. */
function noop(): void {
  // The demo keeps the open step in its own state.
}

const meta = {
  title: 'Pedagogy/TutorialStepStrip',
  component: TutorialStepStrip,
  decorators: [inAPage],
  args: {
    steps: SMILES_TUTORIAL,
    activeIndex: 0,
    onSelect: noop,
    levelLabels: LEVEL_LABELS,
  },
  argTypes: {
    activeIndex: { control: { type: 'range', min: 0, max: 9, step: 1 } },
    pager: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The ten steps of a tour, grouped into one coloured strip per level — green, amber, pink — with the pager a student actually walks through.',
      },
    },
  },
  // Keyed on the control, so moving the slider reopens the tour on that step
  // rather than leaving the demo's own state where the last click left it.
  render: (args) => <TutorialStepStripDemo key={args.activeIndex} {...args} />,
} satisfies Meta<typeof TutorialStepStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Click any number, or page through: the open step is drawn underneath. */
export const Default: Story = {};

/** Landing in the middle of the course, as a shared link does. */
export const MidCourse: Story = {
  args: { activeIndex: 6 },
};

/** No labels of its own: each strip is named by its level. */
export const PlainLevelNames: Story = {
  args: { levelLabels: {} },
};

/** A level nobody wrote a step for is not drawn as an empty strip. */
export const OneLevelOnly: Story = {
  args: { steps: SMILES_TUTORIAL.slice(0, 4) },
};

/** Without the pager, the strips are the only way through — a lecturer's view. */
export const NoPager: Story = {
  args: { pager: false },
};

/** A word for a tour whose steps also answer the arrow keys. */
export const WithAPagerHint: Story = {
  args: { pagerHint: '← and → move between steps' },
};

const COLUMN_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const STEP_STYLE: CSSProperties = {
  background: 'var(--surface, #fff)',
  border: '1px solid var(--border, #dfe3e8)',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: '12px 14px',
};

const TITLE_STYLE: CSSProperties = { margin: 0, fontSize: 15 };

const PROSE_STYLE: CSSProperties = { margin: 0, lineHeight: 1.5 };

const CODE_STYLE: CSSProperties = {
  alignSelf: 'flex-start',
  background: 'var(--surface-sunken, #f5f7fa)',
  borderRadius: 4,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  padding: '4px 8px',
};
