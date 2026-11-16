import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { EDITOR_TOOLBAR_WIDTH } from '../core/editorToolbarGeometry.ts';

/**
 * The box a site's guide is drawn in over an empty canvas: beside the toolbar
 * and under the buttons in the corner, so it never covers either.
 *
 * The box itself lets the pointer through; `<EmptyGuide>` takes it back only on
 * its own buttons, links and figures, so a stroke can start on the words.
 * @param props - What the guide shows.
 * @param props.children - The site's guide.
 * @returns The box and the guide in it.
 */
export function StructureEditorGuide(props: {
  children: ReactNode;
}): ReactElement {
  return (
    <div data-testid="structure-editor-guide" style={GUIDE_STYLE}>
      {props.children}
    </div>
  );
}

/**
 * Under the open, export and help buttons in the corner: 4 px from the top, a
 * small button 24 px tall, and 4 px under it.
 */
const CORNER_CLEARANCE = 32;

const GUIDE_STYLE: CSSProperties = {
  position: 'absolute',
  inset: `${CORNER_CLEARANCE}px 0 0 ${EDITOR_TOOLBAR_WIDTH}px`,
  pointerEvents: 'none',
};
