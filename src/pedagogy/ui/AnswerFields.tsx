import { FormGroup, InputGroup } from '@blueprintjs/core';
import type { KeyboardEvent, ReactElement } from 'react';
import { useId } from 'react';

import type { AnswerField, Answers } from '../core/series.ts';

/** What {@link AnswerFields} needs. */
export interface AnswerFieldsProps {
  /** The boxes the question asks for, in the order they are filled. */
  fields: readonly AnswerField[];
  /** What is typed in them so far. */
  answers: Answers;
  /** Called with the key of a box and its new text on every keystroke. */
  onChange: (key: string, value: string) => void;
  /** Called on Enter, which checks the answer. */
  onSubmit: () => void;
}

/**
 * The boxes a question asks the student to fill, side by side, each with the
 * keyboard its value wants on a phone and every autocorrection switched off.
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
