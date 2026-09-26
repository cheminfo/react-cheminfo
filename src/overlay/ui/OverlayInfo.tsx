import type { PopoverNextProps } from '@blueprintjs/core';
import { PopoverNext } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { OverlayMetrics } from '../core/overlayMetrics.ts';

import { OverlayIconButton } from './OverlayIconButton.tsx';
import { useOverlaySurface } from './overlaySurface.ts';

/** What {@link OverlayInfo} holds. */
export interface OverlayInfoProps {
  /**
   * The explanation, in the reader's own words: what a mark is before what an
   * axis is, one short paragraph rather than a manual.
   */
  children: ReactNode;
  /**
   * What the glyph is called, for the pointer and for a screen reader. Phrase
   * it as the question the reader has, not as the name of a feature.
   * @default the chrome's own line, in the language of the page
   */
  label?: string;
  /**
   * Which side the explanation opens on.
   * @default 'bottom-end'
   */
  placement?: PopoverNextProps['placement'];
  /**
   * Value of the `data-testid` attribute of the glyph.
   * @default undefined
   */
  testId?: string;
}

/**
 * The question mark that hands the figure's own explanation back on request.
 *
 * A figure embedded in somebody else's page cannot spend three lines of that
 * page standing a paragraph under itself, and a paragraph deleted for room is
 * a reader left to guess what they are looking at. So the sentence is kept and
 * the vertical space is not: it waits behind one glyph in the bar, where a
 * reader who wants it can open it and everybody else never pays for it.
 *
 * The glyph is the domain's own icon button, the same one the cog beside it
 * is, so the two read as a pair of marks on the bar rather than as two
 * buttons from different families that happen to sit next to each other.
 * @param props - See {@link OverlayInfoProps}.
 * @returns The glyph and its explanation.
 */
export function OverlayInfo(props: OverlayInfoProps): ReactElement {
  const { children, label } = props;
  const t = useChromeT();
  const name = label ?? t('overlay.whatAmILookingAt');
  const { placement = 'bottom-end', testId } = props;
  const { metrics } = useOverlaySurface();
  const [open, setOpen] = useState(false);

  return (
    <PopoverNext
      placement={placement}
      onInteraction={(next) => setOpen(next)}
      content={<div style={explanationStyle(metrics)}>{children}</div>}
    >
      <OverlayIconButton
        icon="help"
        label={name}
        active={open}
        testId={testId}
        opensMenu
      />
    </PopoverNext>
  );
}

/**
 * The paragraph the glyph opens.
 *
 * It is capped short of the figure's own width, because a sentence that runs
 * the full width of a wide chart is a sentence the eye loses the start of on
 * the way back from the end of each line.
 * @param metrics - The measurements the chrome is drawn from.
 * @returns The explanation's rules.
 */
function explanationStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    maxWidth: 320,
    padding: `${metrics.paddingY + 4}px ${metrics.paddingX + 4}px`,
    color: 'var(--text)',
    fontSize: metrics.labelSize + 1,
    lineHeight: 1.4,
    textWrap: 'pretty',
  };
}
