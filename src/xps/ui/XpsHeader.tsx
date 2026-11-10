import type { ReactNode } from 'react';
import { Header, Toolbar, useFullscreen } from 'react-science/ui';

import { XpsLogo } from './XpsLogo.tsx';
import { useXpsCommandProps } from './xpsCommandContext.tsx';

/**
 * The bar across the top: the mark on the left, the viewer on the right — the
 * same bar as the infrared and mass viewers, so a chemist switching between
 * them looks in one place for what they are in.
 *
 * Nothing that is done to the spectra is here — that is the rail down the left
 * and the panels down the right — only what is asked of the viewer itself. The
 * mark is the About button; a host's own actions on what it keeps — open an
 * example, save a document — follow it, as an application menu follows its
 * icon; and help then full screen close the bar, hard against the right edge.
 * @param props - Component props.
 * @param props.actions - The host's actions, as toolbar items.
 * @returns The header.
 */
export function XpsHeader(props: { actions?: ReactNode }) {
  const { actions } = props;
  const command = useXpsCommandProps();
  const { isFullScreen } = useFullscreen();

  return (
    <Header>
      <Toolbar aria-label="X-ray photoelectron spectrum viewer">
        <Toolbar.Item icon={<XpsLogo size={16} />} {...command('about')} />
        {actions}
      </Toolbar>
      <Toolbar aria-label="X-ray photoelectron spectrum viewer help">
        <Toolbar.Item icon="help" {...command('documentation')} />
        {/* Always the last thing in the bar, hard against the right edge: the
            corner a window is made bigger from is the corner it is looked for
            in, whatever else the header grows. */}
        <Toolbar.Item
          icon="fullscreen"
          active={isFullScreen}
          {...command('fullScreen')}
        />
      </Toolbar>
    </Header>
  );
}
