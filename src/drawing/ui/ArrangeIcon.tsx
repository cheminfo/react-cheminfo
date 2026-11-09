import { Classes } from '@blueprintjs/core';
import type { ReactElement } from 'react';

/**
 * The icon of a row or a column: boxes of different sizes centred on one line,
 * with equal gaps, drawn as Blueprint draws its alignment icons.
 * @param props - The icon.
 * @param props.along - Which way the line runs.
 * @returns The icon, at Blueprint's 16 px.
 */
export function ArrangeIcon(props: { along: 'row' | 'column' }): ReactElement {
  return (
    <svg
      className={Classes.ICON}
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="currentColor"
      aria-hidden
    >
      <g transform={props.along === 'column' ? 'rotate(90 8 8)' : undefined}>
        <rect x="0" y="7.25" width="16" height="1.5" rx="0.75" />
        <rect x="1" y="2" width="3.5" height="12" rx="1" />
        <rect x="6.25" y="4.5" width="3.5" height="7" rx="1" />
        <rect x="11.5" y="3.5" width="3.5" height="9" rx="1" />
      </g>
    </svg>
  );
}
