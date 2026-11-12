import type { ReactElement } from 'react';

/** Props of {@link Described}. */
export interface DescribedProps {
  /** The choice's label. */
  label: string;
  /** What choosing it does. */
  description: string;
}

/**
 * A choice's label, with what it does under it in muted type.
 * @param props - See {@link DescribedProps}.
 * @returns The two lines.
 */
export function Described(props: DescribedProps): ReactElement {
  return (
    <span className="save-document-dialog__part">
      <span>{props.label}</span>
      <span className="save-document-dialog__description">
        {props.description}
      </span>
    </span>
  );
}
