import { Button, Tag, Tooltip } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import type { ExerciseLevel, TutorialStep } from '../core/types.ts';

import { LEVEL_ORDER } from './exerciseMeta.ts';
import type { TutorialLevelColours } from './tutorialLevels.ts';
import { TUTORIAL_LEVEL_COLOURS } from './tutorialLevels.ts';

export interface TutorialStepStripProps {
  /** The whole tour, in teaching order. */
  steps: readonly TutorialStep[];
  /**
   * Which step is open, as its position in `steps`. A position outside the
   * tour is read as one of its ends, so a hand-edited link still opens.
   */
  activeIndex: number;
  /** Called with the position of the step to open. */
  onSelect: (index: number) => void;
  /**
   * What each strip is called — `Basics`, `π bonds, planarity, conjugation`.
   * @default undefined — the level names its own strip
   */
  levelLabels?: Partial<Record<ExerciseLevel, string>>;
  /**
   * Whether Previous and Next sit under the strips. Both exist on purpose: the
   * strips show the shape of the course and let a lecturer jump into it, the
   * pager is how a student actually walks through it.
   * @default true
   */
  pager?: boolean;
  /**
   * A word after the pager, for a tool whose steps also answer the keyboard.
   * @default undefined
   */
  pagerHint?: ReactNode;
  /**
   * Class the strips carry, so a site can reach them from its stylesheet.
   * @default undefined
   */
  className?: string;
}

/**
 * The numbered steps of the tour, one coloured strip per level, plus a pager.
 * @param props - The tour, the open step, and how to move.
 * @returns The strips and the pager.
 */
export function TutorialStepStrip(props: TutorialStepStripProps): ReactElement {
  const {
    steps,
    activeIndex,
    onSelect,
    levelLabels,
    pager = true,
    pagerHint,
    className,
  } = props;
  const active = clampIndex(activeIndex, steps.length);

  return (
    <div className={className} style={ROOT_STYLE}>
      {LEVEL_ORDER.map((level) => {
        const positions = positionsOfLevel(steps, level);
        if (positions.length === 0) return null;
        return (
          <LevelStrip
            key={level}
            steps={steps}
            positions={positions}
            colours={TUTORIAL_LEVEL_COLOURS[level]}
            label={levelLabels?.[level] ?? level}
            activeIndex={active}
            onSelect={onSelect}
          />
        );
      })}

      {pager && (
        <div style={PAGER_STYLE}>
          <Button
            size="small"
            icon="chevron-left"
            text="Previous"
            disabled={active === 0}
            onClick={() => {
              onSelect(active - 1);
            }}
          />
          <Tag minimal round>
            {`Step ${active + 1} of ${steps.length}`}
          </Tag>
          <Button
            size="small"
            endIcon="chevron-right"
            text="Next"
            intent="primary"
            disabled={active >= steps.length - 1}
            onClick={() => {
              onSelect(active + 1);
            }}
          />
          {pagerHint !== undefined && (
            <span style={HINT_STYLE}>{pagerHint}</span>
          )}
        </div>
      )}
    </div>
  );
}

interface LevelStripProps {
  steps: readonly TutorialStep[];
  positions: readonly number[];
  colours: TutorialLevelColours;
  label: string;
  activeIndex: number;
  onSelect: (index: number) => void;
}

function LevelStrip(props: LevelStripProps): ReactElement {
  const { steps, positions, colours, label, activeIndex, onSelect } = props;
  const buttons: ReactNode[] = [];
  for (const position of positions) {
    const step = steps[position] as TutorialStep;
    const active = position === activeIndex;
    buttons.push(
      <Tooltip
        key={step.id}
        content={step.title}
        hoverOpenDelay={HOVER_OPEN_DELAY}
        placement="bottom"
      >
        <button
          type="button"
          aria-label={`Step ${position + 1}: ${step.title}`}
          aria-current={active ? 'step' : undefined}
          style={numberStyle(colours, active)}
          onClick={() => {
            onSelect(position);
          }}
        >
          {position + 1}
        </button>
      </Tooltip>,
    );
  }

  return (
    <div style={{ ...STRIP_STYLE, background: colours.background }}>
      <span style={LABEL_STYLE}>{label}</span>
      {buttons}
    </div>
  );
}

function positionsOfLevel(
  steps: readonly TutorialStep[],
  level: ExerciseLevel,
): number[] {
  const positions: number[] = [];
  for (let index = 0; index < steps.length; index++) {
    if (steps[index]?.level === level) positions.push(index);
  }
  return positions;
}

function clampIndex(index: number, total: number): number {
  if (!Number.isFinite(index) || index <= 0) return 0;
  return Math.min(Math.floor(index), Math.max(total - 1, 0));
}

/**
 * The open step takes the darker shade of its own level, plus a border.
 *
 * Every button is the same square whatever it holds, so the numbers of one
 * strip stand above those of the next and the tour reads as a grid.
 * @param colours - The two shades of the level the step belongs to.
 * @param active - Whether this is the step on screen.
 * @returns The style of one numbered button.
 */
function numberStyle(
  colours: TutorialLevelColours,
  active: boolean,
): CSSProperties {
  return {
    display: 'inline-flex',
    width: STEP_SIZE,
    height: STEP_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: active ? '2px solid #1c2127' : '1px solid rgb(17 20 24 / 20%)',
    borderRadius: 4,
    background: active ? colours.activeBackground : '#ffffff',
    boxSizing: 'border-box',
    color: '#1c2127',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: active ? 700 : 500,
    lineHeight: 1,
  };
}

/** Wide enough for two digits, which every tour of ours stays under a hundred of. */
const STEP_SIZE = 28;

/** Long enough that the pointer can cross the strip without opening a title. */
const HOVER_OPEN_DELAY = 150;

const ROOT_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const STRIP_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 4,
  borderRadius: 4,
  padding: '4px 6px',
};

const LABEL_STYLE: CSSProperties = {
  flex: '0 0 220px',
  fontSize: 12,
  fontWeight: 600,
  color: '#1c2127',
};

const PAGER_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  paddingTop: 2,
};

const HINT_STYLE: CSSProperties = { color: '#5b6875', fontSize: 11 };
