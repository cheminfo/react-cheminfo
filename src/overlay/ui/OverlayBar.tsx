import type { IconName } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import type { OverlayPlacement } from '../core/overlayPlacement.ts';

import { OverlayBarCard } from './OverlayBarCard.tsx';
import { OverlayBarStrip } from './OverlayBarStrip.tsx';
import { overlayBarFolded, useFoldReport } from './overlayBarShape.ts';
import { OVERLAY_RESTING_OPACITY } from './overlayStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/** What {@link OverlayBar} needs. */
export interface OverlayBarProps {
  /**
   * The controls that stay on screen. Keep it to one or two in a floating
   * card: a third is already a panel, and a panel over a figure hides the
   * figure. A stretched bar holds its tab strip here, at the start of the row.
   */
  children: ReactNode;
  /**
   * What sits at the far end of the row: the controls belonging to whatever
   * the figure is currently showing. They are the first thing to go when the
   * figure is too narrow for both ends, folding in behind the button.
   * @default undefined — the bar's end holds only its glyphs
   */
  end?: ReactNode;
  /**
   * The glyph-sized tools that act on the figure rather than change how it is
   * drawn — saving it as a file, printing it. They ride beside the `?` at the
   * end of the row and, on a stretched bar, never fold: a tool is one button
   * wide already, and a reader who cannot find the one that takes the figure
   * away concludes the figure cannot be taken away.
   * @default undefined — the bar carries no tools
   */
  tools?: ReactNode;
  /**
   * The one control drawn at the end whatever the width — the `?` opening the
   * figure's own explanation. It never folds, because a reader short of room
   * is exactly the reader who has not been told what they are looking at.
   * @default undefined — the bar carries no glyph
   */
  info?: ReactNode;
  /**
   * What opens behind the button at the end of the bar — everything an expert
   * changes and a reader never does. This is where a control goes unless
   * somebody argued for putting it in the strip.
   * @default undefined — the bar carries no button
   */
  more?: ReactNode;
  /**
   * Where it sits. Pick the corner the data leaves emptiest, which
   * `emptiestCorner` answers from the points themselves, or `stretch` for the
   * settings bar of an embedded figure, which spans the width above it.
   * @default 'top-right'
   */
  placement?: OverlayPlacement;
  /**
   * What the group of controls is called, for a reader arriving by tab and for
   * the button the bar folds into.
   * @default 'Options'
   */
  label?: string;
  /**
   * How opaque the bar is while nothing is pointing at the figure. Never below
   * about 0.6: a control the reader cannot see is a control they will not look
   * for, and only the ground fades — the text is always at full strength. `1`
   * pins it, which is what a figure about to be screenshotted wants. A
   * stretched bar ignores it: its ground is chrome rather than something laid
   * over the picture, and chrome that fades reads as a fault.
   * @default 0.74
   */
  restingOpacity?: number;
  /**
   * Whether the bar is reduced to a button opening the same controls in a
   * popover. Left out, it folds on its own once the figure is narrower than
   * `collapseBelow`.
   * @default undefined — the bar decides from the figure's width
   */
  collapsed?: boolean;
  /**
   * Whether it starts folded, for a bar the reader may open and close.
   * @default false
   */
  defaultCollapsed?: boolean;
  /**
   * Called when the reader opens or closes it.
   * @default undefined
   */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * Figure width, in pixels, under which the bar folds on its own.
   * @default 420
   */
  collapseBelow?: number;
  /**
   * Blueprint glyph of the button that opens the rest. A cog rather than an
   * ellipsis, because once the bar folds that button holds every control and
   * not only the second tier.
   * @default 'cog'
   */
  moreIcon?: IconName;
  /**
   * Whether what opens behind that button is drawn with the card's own padding
   * around it. Turn it off when `more` is an {@link OverlayPanel}, which
   * brings its own: nested inside a padded surface a panel's header rule stops
   * short of both edges and reads as a mis-drawn line rather than as a header.
   * @default true
   */
  morePadded?: boolean;
  /**
   * Value of the `data-testid` attribute of the card, for the end-to-end tests.
   * @default undefined
   */
  testId?: string;
}

/**
 * The controls of a figure: a small card floating in one of its corners, or
 * one bar spanning the width above it.
 *
 * Which of the two it is, is the whole of the decision made here — the shapes
 * themselves are drawn by {@link OverlayBarCard} and {@link OverlayBarStrip},
 * because a card that hides in a corner and a strip that spans the width agree
 * on what they hold and on nothing about how they sit. A stretched bar is what
 * an embedded figure wants, where a floating card would spend the host's page
 * twice — once on the chrome and once on the data the chrome is covering.
 * @param props - See {@link OverlayBarProps}.
 * @returns The bar.
 */
export function OverlayBar(props: OverlayBarProps): ReactElement {
  const { children, end, tools, info, more } = props;
  const { placement = 'top-right' } = props;
  const { label = 'Options', restingOpacity = OVERLAY_RESTING_OPACITY } = props;
  const { collapsed, defaultCollapsed = false, onCollapsedChange } = props;
  const { collapseBelow = 420, moreIcon = 'cog', testId } = props;
  const { morePadded = true } = props;
  const { width } = useOverlaySurface();
  const [startedFolded] = useState(defaultCollapsed);

  const folded = overlayBarFolded({
    collapsed,
    startedFolded,
    width,
    collapseBelow,
  });
  useFoldReport(
    folded,
    collapsed === undefined ? onCollapsedChange : undefined,
  );

  if (placement === 'stretch') {
    return (
      <OverlayBarStrip
        end={end}
        tools={tools}
        info={info}
        more={more}
        placement={placement}
        label={label}
        moreIcon={moreIcon}
        morePadded={morePadded}
        folded={folded}
        testId={testId}
      >
        {children}
      </OverlayBarStrip>
    );
  }

  return (
    <OverlayBarCard
      end={end}
      tools={tools}
      info={info}
      more={more}
      placement={placement}
      label={label}
      moreIcon={moreIcon}
      morePadded={morePadded}
      folded={folded}
      restingOpacity={restingOpacity}
      testId={testId}
    >
      {children}
    </OverlayBarCard>
  );
}
