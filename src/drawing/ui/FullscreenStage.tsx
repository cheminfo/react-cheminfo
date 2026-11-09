import { PortalContext, PortalProvider } from '@blueprintjs/core';
import type { ReactElement, ReactNode, RefObject } from 'react';
import { use, useCallback, useState } from 'react';
import { FullScreenProvider, useFullscreen } from 'react-science/ui';

/** What the stage is drawn with. */
export interface FullscreenStageProps {
  /** The class of the box that fills the screen. */
  className: string;
  /** What the box holds; `useFullscreen()` inside it toggles the box. */
  children: ReactNode;
}

/**
 * The editor's box, able to fill the screen through react-science's
 * `FullScreenProvider`.
 *
 * A box filling the screen hides everything outside it, and Blueprint portals
 * its menus, tooltips and dialogs to `document.body`: while the box fills the
 * screen they are portalled into it instead, as react-cheminfo's
 * `Molecule3DStage` does.
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

function Stage(
  props: FullscreenStageProps & {
    fullscreenRef: RefObject<HTMLDivElement | null>;
  },
): ReactElement {
  const { className, children, fullscreenRef } = props;
  const { isFullScreen } = useFullscreen();
  const portal = use(PortalContext);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const stageRef = useCallback(
    (element: HTMLDivElement | null) => {
      fullscreenRef.current = element;
      setStage(element);
    },
    [fullscreenRef],
  );

  // The provider is always there, so entering full screen changes a value
  // rather than the tree, and the editor inside is never mounted again.
  return (
    <div ref={stageRef} className={className}>
      <PortalProvider
        portalClassName={portal.portalClassName}
        portalContainer={
          isFullScreen && stage !== null ? stage : portal.portalContainer
        }
      >
        {children}
      </PortalProvider>
    </div>
  );
}
