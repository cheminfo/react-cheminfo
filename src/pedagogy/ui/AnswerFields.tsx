import { FormGroup, InputGroup } from '@blueprintjs/core';
import type { KeyboardEvent, ReactElement } from 'react';
import { useId } from 'react';

import type { AnswerField, Answers } from '../core/series.ts';

import { AnswerChoices } from './AnswerChoices.tsx';

/** What {@link AnswerFields} needs. */
export interface AnswerFieldsProps {
  /** The boxes the question asks for, in the order they are filled. */
  fields: readonly AnswerField[];
  /** What is typed in them so far. */
  answers: Answers;
  /**
   * Called with the key of a box and its new text on every keystroke, or with
   * the key of a pick and the value of the answer picked.
   */
  onChange: (key: string, value: string) => void;
  /** Called on Enter, which checks the answer. */
  onSubmit: () => void;
}

/**
 * The boxes a question asks the student to fill, side by side, each with the
 * keyboard its value wants on a phone and every autocorrection switched off. A
 * field that offers its answers is a row of buttons instead, one of which is
 * picked.
 * @param props - The fields, what is typed in them, and what to do on a change.
 * @returns The boxes.
 */
export function AnswerFields(props: AnswerFieldsProps): ReactElement {
  const { fields, answers, onChange, onSubmit } = props;
  const prefix = useId();

  function submitOnEnter(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') onSubmit();
  }

  return (
    <div className="series-answers">
      {fields.map((field) => {
        const id = `${prefix}-${field.key}`;
        if (field.choices !== undefined) {
          return (
            <FormGroup
              key={field.key}
              label={<span id={id}>{field.label}</span>}
              className="series-answers__field series-answers__field--choices"
            >
              <AnswerChoices
                choices={field.choices}
                value={answers[field.key] ?? ''}
                onChange={(value) => {
                  onChange(field.key, value);
                }}
                onSubmit={onSubmit}
                labelledBy={id}
              />
            </FormGroup>
          );
        }
        return (
          <FormGroup
            key={field.key}
            label={field.label}
            labelFor={id}
            className="series-answers__field"
          >
            <InputGroup
              id={id}
              value={answers[field.key] ?? ''}
              placeholder={field.placeholder}
              onValueChange={(value) => {
                onChange(field.key, value);
              }}
              onKeyDown={submitOnEnter}
              inputMode={field.inputMode ?? 'decimal'}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </FormGroup>
        );
      })}
    </div>
  );
}
