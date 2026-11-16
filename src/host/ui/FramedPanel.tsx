import type { ReactElement, ReactNode } from 'react';
import { Toolbar } from 'react-science/ui';

import { PanelEmpty } from '../../panel/ui/PanelMessage.tsx';
import { PanelSettingsButton } from '../../panel/ui/PanelSettingsButton.tsx';
import type { PanelSettings } from '../../panel/ui/usePanelSettings.ts';
import type { ToolDocument } from '../core/connectToolTypes.ts';
import type { HostItem } from '../core/protocol.ts';

import { FramedToolNotice } from './FramedToolNotice.tsx';
import { FramedToolUtilities } from './FramedToolUtilities.tsx';
import type { FramedTool } from './framedToolTypes.ts';
import { useFramedTool } from './useFramedTool.ts';

/** What a panel's actions are given of the tool it frames. */
export type FramedToolAccess = Omit<FramedTool, 'attachFrame'>;

/** Props of {@link FramedPanel}. */
export interface FramedPanelProps {
  /** The tool's address, framed: `?embed=1` and whatever page it opens on. */
  url: string;
  /** The host of the page that frames it, as the protocol announces it. */
  host: string;
  /** The framed site's host, as the utilities name it: `chembio.cheminfo.org`. */
  name: string;
  /** What the panel holds, for the frame's title and the toolbars' labels. */
  title: string;
  /** What the tool is handed, or `null` while there is nothing. */
  document: ToolDocument | null;
  /**
   * What the panel says while there is no document, in place of the tool.
   * @default undefined — the tool is shown with no document
   */
  empty?: string;
  /**
   * The panel's own actions on the tool, at the start of its toolbar.
   * @default undefined — none
   */
  actions?: (tool: FramedToolAccess) => ReactNode;
  /**
   * More of the toolbar, after the actions: a status, a notice.
   * @default undefined — nothing
   */
  trailing?: (tool: FramedToolAccess) => ReactNode;
  /**
   * What comes first in the toolbar, before the actions: a search button.
   * @default undefined — nothing
   */
  leading?: ReactNode;
  /**
   * Whether the utilities offer the tool's About.
   * @default true
   */
  about?: boolean;
  /**
   * Called with what the tool sends unasked, for the outputs the document's
   * `accept` names: a compound picked in a search.
   * @default undefined — nothing is listened for
   */
  onOutput?: (items: readonly HostItem[]) => void;
  /**
   * The panel's own settings, behind the gear at the end of its toolbar.
   * @default undefined — no gear
   */
  settings?: {
    /** The panel's name, for the gear's label. */
    panel: string;
    /** The fields, shown in place of the tool while the gear is open. */
    content: ReactNode;
    /** What `usePanelSettings` returned for them. */
    controls: PanelSettings;
  };
  /**
   * Called when the browser would not open the tool in a new tab.
   * @default undefined — nothing is said
   */
  onBlocked?: () => void;
}

/**
 * A sibling site framed in a panel, under a toolbar: the panel's own actions
 * first, then the tool's utilities — its page in a new tab, its help, how to
 * cite it, its About — and the panel's settings last. What the tool sends is
 * handed to `onOutput`; a tool that cannot be used says why in place of
 * itself.
 * @param props - See {@link FramedPanelProps}.
 * @returns The panel's body.
 */
export function FramedPanel(props: FramedPanelProps): ReactElement {
  const { url, host, name, title, document, empty } = props;
  const { actions, trailing, leading, about = true, onOutput } = props;
  const { settings, onBlocked } = props;
  const { attachFrame, ...tool } = useFramedTool({
    url,
    host,
    document,
    onOutput,
  });
  const shownSettings = settings?.controls.isOpen ? settings : undefined;
  const waiting = empty !== undefined && document === null;

  return (
    <div className="panel-body panel-body--toolbar framed-panel">
      <div className="panel-toolbar">
        {leading}
        <Toolbar aria-label={`${title}: actions`}>{actions?.(tool)}</Toolbar>
        {trailing?.(tool)}
        <div className="framed-panel__view">
          <Toolbar aria-label={`${title}: view`}>
            <FramedToolUtilities
              url={url}
              name={name}
              tool={tool.tool}
              host={host}
              document={document?.items.length ? document : null}
              about={about}
              onBlocked={onBlocked}
            />
          </Toolbar>
          {settings === undefined ? null : (
            <div className="panel-toolbar__end">
              <PanelSettingsButton
                panel={settings.panel}
                {...settings.controls}
              />
            </div>
          )}
        </div>
      </div>
      {shownSettings !== undefined ? (
        <div className="framed-panel__settings">{shownSettings.content}</div>
      ) : waiting ? (
        <div className="framed-panel__note">
          <PanelEmpty>{empty}</PanelEmpty>
        </div>
      ) : (
        <FramedToolNotice
          tool={tool}
          url={url}
          className="framed-panel__note"
        />
      )}
      <iframe
        ref={attachFrame}
        className="framed-panel__frame"
        title={title}
        allow="fullscreen; clipboard-write"
        hidden={waiting || shownSettings !== undefined}
      />
    </div>
  );
}
