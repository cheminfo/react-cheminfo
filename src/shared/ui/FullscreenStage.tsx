/**
 * A box that can fill the screen: the 3D canvas and its toolbars, a side panel.
 *
 * A box filling the screen hides everything outside it, and the popovers and
 * tooltips of what it holds are portalled to `document.body`: while the box
 * fills the screen they are portalled into it instead, the way react-science's
 * `RootLayout` keeps its own menus visible. Otherwise the portal options of the
 * page around the box are passed through untouched.
 */

import { PortalContext, PortalProvider } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useCallback, useContext, useState } from 'react';
import { FullScreenProvider, useFullscreen } from 'react-science/ui';

import { canFillScreen } from './canFillScreen.ts';

/** Whether a box fills the screen, and how to change that. */
export interface StageFullscreen {
  /** Whether the box fills the screen. */
  active: boolean;
  /** Fill the screen, or leave it. */
  toggle: () => void;
}

/** Props of {@link FullscreenStage}. */
export interface FullscreenStageProps {
  /**
   * Style of the box, or a function handed whether the box fills the screen,
   * for a box shaped differently while it does.
   */
  style: CSSProperties | ((fillsScreen: boolean) => CSSProperties);
  /**
   * Called with the box once it is mounted, and with `null` once it is gone.
   * It must keep its identity across renders.
   * @default undefined
   */
  onStage?: (element: HTMLDivElement | null) => void;
  /**
   * What is drawn in the box, handed whether it fills the screen and the
   * toggle, or `undefined` where the browser cannot fill the screen.
   */
  children: (fullscreen: StageFullscreen | undefined) => ReactNode;
}

/**
 * The box, able to fill the screen.
 * @param props - See {@link FullscreenStageProps}.
 * @returns The box.
 */
export function FullscreenStage(props: FullscreenStageProps): ReactElement {
  return (
    <FullScreenProvider>
      {(fullscreenRef) => <Stage {...props} fullscreenRef={fullscreenRef} />}
    </FullScreenProvider>
  );
}

interface StageProps extends FullscreenStageProps {
  /** Where `FullScreenProvider` expects the element that fills the screen. */
  fullscreenRef: { current: HTMLDivElement | null };
}

function Stage(props: StageProps): ReactElement {
  const { style, onStage, children, fullscreenRef } = props;
  const { isFullScreen, toggle } = useFullscreen();
  const portal = useContext(PortalContext);
  const [canFill] = useState(canFillScreen);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const stageRef = useCallback(
    (element: HTMLDivElement | null) => {
      fullscreenRef.current = element;
      setStage(element);
      onStage?.(element);
    },
    [fullscreenRef, onStage],
  );

  // The provider is always there, so entering full screen changes a value
  // rather than the tree, and what the box holds is never mounted again.
  return (
    <div
      ref={stageRef}
      style={typeof style === 'function' ? style(isFullScreen) : style}
    >
      <PortalProvider
        portalClassName={portal.portalClassName}
        portalContainer={
          isFullScreen && stage !== null ? stage : portal.portalContainer
        }
      >
        {children(canFill ? { active: isFullScreen, toggle } : undefined)}
      </PortalProvider>
    </div>
  );
}
