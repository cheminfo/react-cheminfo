import { MenuItem } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { CITATION_FORMATS } from '../core/formats.ts';
import type { Reference } from '../core/reference.ts';
import { CITATION_STYLES } from '../core/segments.ts';

import { CopyEntry } from './entries.tsx';
import type { CopyFeedback } from './useCopyFeedback.ts';

export interface CopyFormatEntriesProps {
  /** The works the entries copy, in reading order. */
  references: readonly Reference[];
  /** The copy action and the feedback of the menu these entries sit in. */
  feedback: CopyFeedback;
  /**
   * What the feedback keys are prefixed with, so two lists of formats in one
   * menu never light up together.
   * @default ''
   */
  keyPrefix?: string;
  /**
   * Whether a format written differently by each journal opens its submenu of
   * styles. A list nested in a work's own submenu does not: three levels of
   * menu are more than a reader picking a reference should have to walk, so it
   * copies in the default style instead.
   * @default true
   */
  styled?: boolean;
}

/**
 * One entry per format the references can be copied in, previewing on hover
 * what each puts on the clipboard.
 * @param props - The references, the feedback, and whether the styles nest.
 * @returns The entries of the copy section.
 */
export function CopyFormatEntries(
  props: CopyFormatEntriesProps,
): ReactElement[] {
  const { references, feedback, keyPrefix = '', styled = true } = props;

  return CITATION_FORMATS.map((format) => {
    if (!styled || !format.styled) {
      const key = `${keyPrefix}${format.id}`;
      return (
        <CopyEntry
          key={format.id}
          references={references}
          format={format}
          state={feedback.stateOf(key)}
          onCopy={() => {
            feedback.copy(key, references, format.id);
          }}
        />
      );
    }

    return (
      <MenuItem
        key={format.id}
        icon="clipboard"
        text={format.label}
        label={format.hint}
      >
        {CITATION_STYLES.map((style) => {
          const key = `${keyPrefix}${format.id}:${style.id}`;
          return (
            <CopyEntry
              key={style.id}
              references={references}
              format={format}
              style={style}
              state={feedback.stateOf(key)}
              onCopy={() => {
                feedback.copy(key, references, format.id, style.id);
              }}
            />
          );
        })}
      </MenuItem>
    );
  });
}
