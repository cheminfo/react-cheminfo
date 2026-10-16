/**
 * The box the molecule canvas and its toolbars are drawn in, which is also the
 * box that fills the screen.
 *
 * A box filling the screen hides everything outside it, and the popovers and
 * tooltips of the toolbars are portalled to `document.body`: while the box
 * fills the screen they are portalled into it instead, the way react-science's
 * `RootLayout` keeps its own menus visible. Otherwise the portal options of the
 * page around the viewer are passed through untouched.
 */

import { PortalContext, PortalProvider } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useCallback, useContext, useState } from 'react';
import { FullScreenProvider, useFullscreen } from 'react-science/ui';

import type { Molecule3DFullscreen } from './Molecule3DToolbar.tsx';

/** Props of {@link Molecule3DStage}. */
export interface Molecule3DStageProps {
  /** Style of the box. */
  style: CSSProperties;
  /**
   * What is drawn in the box, handed whether it fills the screen and the
   * toggle, or `undefined` where the browser cannot fill the screen.
   */
  children: (fullscreen: Molecule3DFullscreen | undefined) => ReactNode;
}

/**
 * The box of the canvas, able to fill the screen.
 * @param props - See {@link Molecule3DStageProps}.
 * @returns The box.
 */
export function Molecule3DStage(props: Molecule3DStageProps): ReactElement {
  return (
    <FullScreenProvider>
      {(fullscreenRef) => <Stage {...props} fullscreenRef={fullscreenRef} />}
    </FullScreenProvider>
  );
}

interface StageProps extends Molecule3DStageProps {
  /** Where `FullScreenProvider` expects the element that fills the screen. */
  fullscreenRef: { current: HTMLDivElement | null };
}

function Stage(props: StageProps): ReactElement {
  const { style, children, fullscreenRef } = props;
  const { isFullScreen, toggle } = useFullscreen();
  const portal = useContext(PortalContext);
  const [canFillScreen] = useState(isFullscreenEnabled);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const stageRef = useCallback(
    (element: HTMLDivElement | null) => {
      fullscreenRef.current = element;
      setStage(element);
    },
    [fullscreenRef],
  );

  // The provider is always there, so entering full screen changes a value
  // rather than the tree, and the canvas inside is never mounted again.
  return (
    <div ref={stageRef} style={style}>
      <PortalProvider
        portalClassName={portal.portalClassName}
        portalContainer={
          isFullScreen && stage !== null ? stage : portal.portalContainer
        }
      >
        {children(canFillScreen ? { active: isFullScreen, toggle } : undefined)}
      </PortalProvider>
    </div>
  );
}

function isFullscreenEnabled(): boolean {
  return typeof document !== 'undefined' && document.fullscreenEnabled;
}
