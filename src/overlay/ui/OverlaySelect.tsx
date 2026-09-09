import { HTMLSelect } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { OverlayControlProps, OverlayOption } from './OverlayRow.tsx';
import { OverlayRow } from './OverlayRow.tsx';
import { OverlayValueMenu } from './OverlayValueMenu.tsx';
import { useOverlayPanelShape } from './overlayPanelContext.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/** How a picker is drawn. */
export type OverlaySelectAppearance = 'field' | 'quiet';

/** What {@link OverlaySelect} needs. Use it past four choices. */
export interface OverlaySelectProps<
  TValue extends string = string,
> extends OverlayControlProps {
  /** The current choice. */
  value: TValue;
  /** What may be chosen, in the order offered. */
  options: ReadonlyArray<OverlayOption<TValue>>;
  /** Called with the new choice. */
  onChange: (value: TValue) => void;
  /**
   * Whether the picker is drawn as a form field or as a quiet button showing
   * only its value.
   *
   * A settings panel gets `quiet` on its own, because a bordered field beside
   * borderless switches and steppers is the one shape in the panel that draws
   * the eye, and it draws it to whichever setting happens to be a list.
   * @default 'quiet' inside an OverlayPanel, 'field' anywhere else
   */
  appearance?: OverlaySelectAppearance;
}

/**
 * The picker a card reaches for once the choices stop fitting side by side.
 *
 * The options are written out rather than handed to Blueprint's shorthand,
 * because a choice that does not apply has to keep its place in the list and
 * say why the pointer cannot take it — and the shorthand has nowhere to put
 * that sentence.
 * @param props - See {@link OverlaySelectProps}.
 * @returns The caption, its help, and the picker.
 */
export function OverlaySelect<TValue extends string = string>(
  props: OverlaySelectProps<TValue>,
): ReactElement {
  const {
    value,
    options,
    onChange,
    label,
    help,
    hideLabel = false,
    disabled = false,
    testId,
  } = props;
  const { metrics } = useOverlaySurface();
  const panel = useOverlayPanelShape();
  const { appearance = panel === undefined ? 'field' : 'quiet' } = props;

  if (appearance === 'quiet') {
    // The menu goes INSIDE the row rather than replacing it: the row is what
    // holds the name column and hangs the help off it, and a panel whose rows
    // do not all have that column is not a grid.
    return (
      <OverlayRow
        label={label}
        help={help}
        hideLabel={hideLabel}
        disabled={disabled}
      >
        <OverlayValueMenu
          label={label}
          value={value}
          options={options}
          onChange={onChange}
          showKey={false}
          disabled={disabled}
          testId={testId}
        />
      </OverlayRow>
    );
  }

  return (
    <OverlayRow
      label={label}
      help={help}
      hideLabel={hideLabel}
      disabled={disabled}
    >
      <HTMLSelect
        value={value}
        disabled={disabled}
        large={metrics.blueprintSize === 'large'}
        aria-label={label}
        data-testid={testId}
        onChange={(event) => onChange(event.currentTarget.value as TValue)}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            title={option.title}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </HTMLSelect>
    </OverlayRow>
  );
}
