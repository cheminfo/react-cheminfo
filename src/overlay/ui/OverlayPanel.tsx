import type { ReactElement, ReactNode } from 'react';
import { useId, useMemo, useState } from 'react';

import type { HelpContent } from '../../help/ui/HelpBody.tsx';
import { HelpIcon } from '../../help/ui/HelpIcon.tsx';

import type { OverlayPanelShape } from './overlayPanelContext.ts';
import { OverlayPanelContext } from './overlayPanelContext.ts';
import {
  overlayPanelBodyStyle,
  overlayPanelFooterStyle,
  overlayPanelHeaderStyle,
  overlayPanelHintStyle,
  overlayPanelResetStyle,
  overlayPanelSurfaceStyle,
  overlayPanelTitleStyle,
} from './overlayPanelStyles.ts';
import { overlayNameColumnWidth } from './overlayRowStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/** What {@link OverlayPanel} holds. */
export interface OverlayPanelProps {
  /**
   * Which figure these settings belong to: `Map`, `What differs`. A viewer
   * shows four figures behind one cog, and a panel that never names itself
   * leaves the reader guessing which of them they are about to change.
   */
  title: string;
  /** The rows and sections, each an {@link OverlayRow} or an {@link OverlayGroup}. */
  children: ReactNode;
  /**
   * Called when the reader asks for the settings the figure came with. There
   * has to be a way back from a configuration nobody understands any more.
   * @default undefined — no way back is offered
   */
  onReset?: () => void;
  /**
   * What that way back reads.
   * @default 'Reset'
   */
  resetLabel?: string;
  /**
   * What the whole figure is, in a sentence, behind a question mark beside the
   * title. This is the one glyph the domain still allows, because the figure
   * has no name of its own in the panel to hang its explanation off — every
   * control below does, and none of them may have one.
   * @default undefined
   */
  help?: HelpContent;
  /**
   * What the figure can be *told to do*, drawn at the foot under a hairline —
   * `Clear selection`, `Zoom to selection`, each an {@link OverlayAction}.
   *
   * Commands are not settings and must never be given a row. A row says what
   * the figure currently is; a command changes it once and leaves nothing
   * behind, and a reader running down a column of settings takes anything in
   * that column for one — which is how `Clear selection` gets pressed by
   * somebody who was only reading.
   * @default undefined — no footer is drawn
   */
  actions?: ReactNode;
  /**
   * The line at the foot of the body that teaches the convention. Nothing in
   * the panel says that the dotted names are offering anything, so one
   * sentence says it once. Pass `''` for a panel whose names carry no help at
   * all, where the line would be a promise the panel does not keep.
   * @default 'Hover a name for what it does.'
   */
  hint?: string;
  /**
   * Width of the name column, in pixels. Widen it here rather than per row,
   * for a panel whose names are longer than eight characters.
   * @default derived from the type size — 88 at the compact size
   */
  nameWidth?: number;
  /**
   * Value of the `data-testid` attribute of the panel.
   * @default undefined
   */
  testId?: string;
}

/**
 * The settings behind a figure's cog.
 *
 * The four panels of a viewer cannot be allowed to drift apart, so the parts
 * that are the same in all of them — the title, the way back, the grid the
 * rows sit in, the sentence teaching the help convention, the commands kept
 * out of the settings — are settled once here rather than assembled per
 * figure. What a panel is handed is its rows; everything around them it draws
 * itself.
 *
 * It brings its own padding, so it belongs in a popover or a card that has
 * none. Nested inside a padded surface its header rule stops short of both
 * edges, which reads as a mis-drawn line rather than as a header.
 * @param props - See {@link OverlayPanelProps}.
 * @returns The panel.
 */
export function OverlayPanel(props: OverlayPanelProps): ReactElement {
  const { title, children, onReset, resetLabel = 'Reset', help } = props;
  const { actions, hint = DEFAULT_HINT, nameWidth, testId } = props;
  const { metrics } = useOverlaySurface();
  const titleId = useId();
  const [resetHovered, setResetHovered] = useState(false);

  const width = nameWidth ?? overlayNameColumnWidth(metrics);
  const shape = useMemo<OverlayPanelShape>(
    () => ({ nameWidth: width }),
    [width],
  );

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      data-testid={testId}
      style={overlayPanelSurfaceStyle(metrics)}
    >
      <div style={overlayPanelHeaderStyle(metrics)}>
        <span style={overlayPanelTitleStyle(metrics)}>
          <span id={titleId}>{title}</span>
          {help === undefined ? null : (
            <HelpIcon content={help} size={metrics.fontSize} />
          )}
        </span>
        {onReset === undefined ? null : (
          <button
            type="button"
            style={overlayPanelResetStyle(metrics, resetHovered)}
            onClick={onReset}
            onPointerEnter={() => setResetHovered(true)}
            onPointerLeave={() => setResetHovered(false)}
            onFocus={() => setResetHovered(true)}
            onBlur={() => setResetHovered(false)}
          >
            {resetLabel}
          </button>
        )}
      </div>
      <div style={overlayPanelBodyStyle(metrics)}>
        <OverlayPanelContext.Provider value={shape}>
          {children}
        </OverlayPanelContext.Provider>
        {hint === '' ? null : (
          <p style={overlayPanelHintStyle(metrics)}>{hint}</p>
        )}
      </div>
      {actions === undefined ? null : (
        <div style={overlayPanelFooterStyle(metrics)}>{actions}</div>
      )}
    </div>
  );
}

/**
 * The sentence that teaches the convention.
 *
 * It names the gesture rather than the mark, because a reader who has noticed
 * the dotted underlines has already asked this question and one who has not
 * would not recognise a description of them.
 */
const DEFAULT_HINT = 'Hover a name for what it does.';
