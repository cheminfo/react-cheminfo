import { Button } from '@blueprintjs/core';
import type { KeyboardEvent, ReactElement } from 'react';
import { useRef } from 'react';

import { handleOverlayPillKey } from '../../overlay/ui/overlayPillKeys.ts';
import type { AnswerChoice } from '../core/series.ts';

import { InlineText } from './InlineText.tsx';

/** What {@link AnswerChoices} needs. */
export interface AnswerChoicesProps {
  /** The answers on offer, in the order they are shown. */
  choices: readonly AnswerChoice[];
  /** The `value` of the answer picked so far, or an empty string. */
  value: string;
  /** Called with the `value` of the answer picked. */
  onChange: (value: string) => void;
  /** Called on Enter, which checks the answer as it does in a box. */
  onSubmit: () => void;
  /** The id of the element naming the field, which names the group. */
  labelledBy: string;
}

/**
 * The answers a field offers, as a row of buttons of which one is checked.
 *
 * The row is one stop of the Tab key, on the answer picked or else on the
 * first. The arrows move the pick along the row, Space picks the answer the
 * focus is on, and Enter checks the whole answer, as it does in a box. Each
 * button reads as authored prose, so `{{Cu(2+)}}` is drawn as a formula.
 * @param props - See {@link AnswerChoicesProps}.
 * @returns The row.
 */
export function AnswerChoices(props: AnswerChoicesProps): ReactElement {
  const { choices, value, onChange, onSubmit, labelledBy } = props;
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  let checked = -1;
  for (let index = 0; index < choices.length; index++) {
    if (choices[index]?.value === value) checked = index;
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="series-answers__choices"
      onKeyDownCapture={(event) => {
        if (takeEnter(event)) onSubmit();
      }}
      onKeyUpCapture={takeEnter}
      onKeyDown={(event) => {
        let focused = checked;
        for (let index = 0; index < choices.length; index++) {
          if (buttons.current[index] === event.target) focused = index;
        }
        handleOverlayPillKey(event, {
          length: choices.length,
          selectedIndex: focused,
          onSelect: (index) => {
            const choice = choices[index];
            if (choice === undefined) return;
            buttons.current[index]?.focus();
            onChange(choice.value);
          },
        });
      }}
    >
      {choices.map((choice, index) => {
        const isChecked = index === checked;
        return (
          <Button
            key={choice.value}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            role="radio"
            aria-checked={isChecked}
            tabIndex={index === Math.max(checked, 0) ? 0 : -1}
            className="toggle-button"
            variant={isChecked ? 'solid' : 'outlined'}
            intent={isChecked ? 'primary' : 'none'}
            onClick={() => {
              onChange(choice.value);
            }}
          >
            <InlineText text={choice.label} />
          </Button>
        );
      })}
    </div>
  );
}

/**
 * Take Enter before a button of the row sees it: a Blueprint button clicks
 * itself when Enter is released, which would pick the focused answer after the
 * answer was already checked.
 * @param event - A key pressed or released in the row.
 * @returns Whether the key was Enter, and is now the row's alone.
 */
function takeEnter(event: KeyboardEvent<HTMLDivElement>): boolean {
  if (event.key !== 'Enter') return false;
  event.preventDefault();
  event.stopPropagation();
  return true;
}
