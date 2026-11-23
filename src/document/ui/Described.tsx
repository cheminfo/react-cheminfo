import type { IconName } from '@blueprintjs/core';
import { Icon } from '@blueprintjs/core';
import type { ReactElement } from 'react';

/** Props of {@link Described}. */
export interface DescribedProps {
  /** The choice's label. */
  label: string;
  /** What choosing it does. */
  description: string;
  /**
   * The icon of what it chooses, e.g. a place, before the label.
   * @default undefined — none
   */
  icon?: IconName;
}

/**
 * A choice's label, with what it does under it in muted type.
 * @param props - See {@link DescribedProps}.
 * @returns The two lines.
 */
export function Described(props: DescribedProps): ReactElement {
  return (
    <span className="save-document-dialog__part">
      <span>
        {props.icon ? (
          <Icon icon={props.icon} size={14} className="described__icon" />
        ) : null}
        {props.label}
      </span>
      <span className="save-document-dialog__description">
        {props.description}
      </span>
    </span>
  );
}
