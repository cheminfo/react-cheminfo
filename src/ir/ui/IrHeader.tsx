import { Header, Toolbar, useFullscreen } from 'react-science/ui';

import { IrLogo } from './IrLogo.tsx';
import { useIrCommandProps } from './irCommandContext.tsx';

/**
 * The bar across the top: the mark on the left, the viewer on the right.
 *
 * Nothing that is done to the spectra is here — that is the rail down the left
 * and the panels down the right — only what is asked of the viewer itself. The
 * mark is the About button, in the corner `react-mass` and `react-glycan` put
 * theirs in, so a chemist switching between the three tools looks in one place
 * for what they are in; and help then full screen close the bar, hard against
 * the right edge, in all three.
 * @returns The header.
 */
export function IrHeader() {
  const command = useIrCommandProps();
  const { isFullScreen } = useFullscreen();

  return (
    <Header>
      <Toolbar aria-label="Infrared spectrum viewer">
        <Toolbar.Item icon={<IrLogo size={16} />} {...command('about')} />
      </Toolbar>
      <Toolbar aria-label="Infrared spectrum viewer help">
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
