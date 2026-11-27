/**
 * The bar across the top of every spectrum viewer: the mark on the left, the
 * viewer on the right.
 *
 * Nothing that is done to the spectra is here — that is the rail down the left
 * and the panels down the right — only what is asked of the viewer itself. The
 * mark is the About button, so a chemist switching between the viewers looks
 * in one place for what they are in. A host's own actions on what it keeps —
 * open an example, save a document — follow the mark, as an application menu
 * follows its icon; help then full screen close the bar, hard against the
 * right edge.
 */

import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { Header, Toolbar, useFullscreen } from 'react-science/ui';

/** The commands the header itself runs. */
export type EditorHeaderCommand = 'about' | 'documentation' | 'fullScreen';

/** What a viewer's command helper spreads onto one toolbar item. */
export type EditorCommandItem = Omit<
  ComponentProps<typeof Toolbar.Item>,
  'icon'
>;

/** Props of {@link EditorHeader}. */
export interface EditorHeaderProps {
  /** The viewer's mark, at 16 px: the About button. */
  logo: ReactElement;
  /** What the left half of the bar is called. */
  label: string;
  /** What the right half is called. */
  helpLabel: string;
  /**
   * The props of the item running a command, from the viewer's own helper.
   * @param id - The command.
   * @returns The item's props.
   */
  command: (id: EditorHeaderCommand) => EditorCommandItem;
  /**
   * The host's actions, as toolbar items, drawn after the mark.
   * @default undefined
   */
  actions?: ReactNode;
  /**
   * The viewer's own items before help, such as its settings.
   * @default undefined
   */
  extra?: ReactNode;
}

/**
 * The header.
 * @param props - See {@link EditorHeaderProps}.
 * @returns The bar.
 */
export function EditorHeader(props: EditorHeaderProps): ReactElement {
  const { logo, label, helpLabel, command, actions, extra } = props;
  const { isFullScreen } = useFullscreen();

  return (
    <Header>
      <Toolbar aria-label={label}>
        <Toolbar.Item icon={logo} {...command('about')} />
        {actions}
      </Toolbar>
      <Toolbar aria-label={helpLabel}>
        {extra}
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
