import { Switch } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useId } from 'react';

import { HelpIcon } from '../../help/ui/index.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';

/**
 * Where a row says what switching it off does: behind a help glyph beside the
 * label, or on a line of its own under it.
 */
export type SharePartDescriptions = 'help' | 'inline';

export interface SharePartRowProps {
  /** What the row switches, named as the reader sees it on the page. */
  label: string;
  /** What switching it off does, in one sentence. */
  description: string;
  /** Whether the link keeps it. */
  on: boolean;
  /** Where the description is shown. */
  descriptions: SharePartDescriptions;
  /** Called with the state the reader asked for. */
  onChange: (on: boolean) => void;
  /**
   * Called when the pointer enters or leaves the row, so the preview can draw
   * the region it names.
   * @default undefined — the row is not pointed out anywhere
   */
  onPointed?: (pointed: boolean) => void;
}

/**
 * One row of the share dialog: what it is on the left, whether the link keeps
 * it on the right.
 *
 * The state is written inside the switch rather than left to a tick, because a
 * tick means nothing without the heading above the column — and the heading is
 * the first thing a reader scrolls past. A row that says `On` reads correctly
 * on its own, in every language.
 * @param props - See {@link SharePartRowProps}.
 * @returns The row.
 */
export function SharePartRow(props: SharePartRowProps): ReactElement {
  const { label, description, on, descriptions, onChange, onPointed } = props;
  const t = useChromeT();
  const id = useId();
  const labelId = `${id}-label`;

  return (
    <div
      className="share-part"
      onMouseEnter={() => onPointed?.(true)}
      onMouseLeave={() => onPointed?.(false)}
      onFocus={() => onPointed?.(true)}
      onBlur={() => onPointed?.(false)}
    >
      <label className="share-part__label" htmlFor={id} id={labelId}>
        {label}
      </label>
      {descriptions === 'help' ? (
        <HelpIcon content={{ title: label, body: description }} label={label} />
      ) : null}
      <Switch
        id={id}
        className="share-part__switch"
        // Blueprint wraps the input in a label of its own carrying the On/Off
        // text, and a wrapping label beats an `htmlFor` one: without this the
        // switch is named "OnOff" and a screen reader never says what is on.
        aria-labelledby={labelId}
        checked={on}
        innerLabel={t('share.off')}
        innerLabelChecked={t('share.on')}
        onChange={(event) => {
          onChange(event.currentTarget.checked);
        }}
      />
      {descriptions === 'inline' ? (
        <p className="share-part__description">{description}</p>
      ) : null}
    </div>
  );
}
