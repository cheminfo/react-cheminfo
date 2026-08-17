import { Icon, Tag } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { ExerciseLevel, ExerciseStatus } from '../core/types.ts';

import { LEVEL_INTENT, STATUS_ICON, STATUS_INTENT } from './exerciseMeta.ts';

export interface ExerciseLevelTagProps {
  level: ExerciseLevel;
  /**
   * What the tag reads.
   * @default the level itself — `beginner`, `intermediate`, `advanced`
   */
  label?: string;
  /**
   * Whether the tag is the one currently selected, which fills it in rather
   * than leaving it minimal. Its colour does not depend on this: a level that
   * is filtered out is still that level, and a tag that dropped to `none` when
   * switched off would say the difficulty had changed.
   * @default false
   */
  active?: boolean;
  /**
   * Called when the tag is clicked, which also makes it interactive.
   * @default undefined — the tag only reports the level
   */
  onClick?: () => void;
}

/**
 * The difficulty of an exercise or a step, as a coloured tag.
 * @param props - The level, and whether it is the selected one.
 * @returns The tag.
 */
export function ExerciseLevelTag(props: ExerciseLevelTagProps): ReactElement {
  const { level, label = level, active = false, onClick } = props;

  return (
    <Tag
      round
      minimal={!active}
      active={active}
      intent={LEVEL_INTENT[level]}
      interactive={onClick !== undefined}
      onClick={onClick}
    >
      {label}
    </Tag>
  );
}

export interface ExerciseStatusIconProps {
  status: ExerciseStatus;
  /**
   * What the pointer and a screen reader are told.
   * @default the status itself — `idle`, `attempted`, `solved`
   */
  title?: string;
  /**
   * Size of the glyph, in pixels.
   * @default undefined — Blueprint's standard 16
   */
  size?: number;
}

/**
 * Where a student stands on one exercise, as the glyph in front of its title.
 * @param props - The status, and how it is announced.
 * @returns The icon.
 */
export function ExerciseStatusIcon(
  props: ExerciseStatusIconProps,
): ReactElement {
  const { status, title = status, size } = props;

  return (
    <Icon
      icon={STATUS_ICON[status]}
      intent={STATUS_INTENT[status]}
      size={size}
      title={title}
      aria-label={title}
    />
  );
}
