/**
 * One panel's body: its own actions in a row under the header, at the left,
 * then what it shows, which scrolls inside the panel.
 */

import type { ReactElement, ReactNode } from 'react';

import {
  panelBodyStyle,
  panelStyle,
  panelToolbarStyle,
} from '../core/panelStyles.ts';

/** What a panel's body holds. */
export interface PanelFrameProps {
  /**
   * The panel's own actions, in a row under its header.
   * @default none, and no row
   */
  toolbar?: ReactNode;
  /**
   * What a test finds the panel by.
   * @default none
   */
  testId?: string;
  /** What the panel shows. */
  children: ReactNode;
}

/**
 * A panel's body: its toolbar, kept off a print, over what it shows.
 * @param props - What the panel holds.
 * @returns The body.
 */
export function PanelFrame(props: PanelFrameProps): ReactElement {
  const { toolbar, testId, children } = props;
  return (
    <div style={panelStyle} data-testid={testId}>
      {toolbar ? (
        <div style={panelToolbarStyle} className="no-print">
          {toolbar}
        </div>
      ) : null}
      <div style={panelBodyStyle}>{children}</div>
    </div>
  );
}
