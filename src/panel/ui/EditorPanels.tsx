/**
 * The panels beside a figure editor's canvas and the rail that opens them, as
 * every editor of the family wires them to its panel state: the stack shows
 * the panels on screen, folded as the state says, and the rail lists the
 * panels offered, lit when open.
 */

import type { ComponentType, ReactElement } from 'react';

import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

import type { RailPanel } from './PanelRail.tsx';
import { PanelRail } from './PanelRail.tsx';
import type { PanelDescriptor } from './SidePanelStack.tsx';
import { SidePanelStack } from './SidePanelStack.tsx';

/** One panel of an editor, typed by the editor's own ids. */
export interface EditorPanel<P extends string> extends PanelDescriptor {
  /** Which panel, as the editor's panel state names it. */
  id: P;
}

/** What {@link EditorPanelStack} is given. */
export interface EditorPanelStackProps<P extends string> {
  /** Every panel, in the order the rail lists them. */
  panels: ReadonlyArray<EditorPanel<P>>;
  /** The body of each panel, a component reading the site's own state. */
  bodies: Readonly<Record<P, ComponentType>>;
  /** The panels on screen: `panels.visible()`. */
  shown: readonly P[];
  /** The panels on screen drawn folded: `panels.visibleFolded()`. */
  folded: readonly P[];
  /**
   * Close a panel, from its header's cross: `panels.toggle`.
   * @param panel - The panel.
   */
  onClose: (panel: P) => void;
  /**
   * Fold the panels given, as the stack reports them: `panels.setFolded`.
   * @param panels - The open panels drawn folded.
   */
  onFolded: (panels: readonly string[]) => void;
  /**
   * Whether a panel offers to fill the screen.
   * @default every panel does, where the browser can fill the screen
   */
  fillScreen?: (panel: EditorPanel<P>) => boolean;
  /**
   * Whether the panels are printed with the page; by default a printed page
   * carries none of them.
   * @default false
   */
  print?: boolean;
}

/**
 * The open panels of an editor, one over the other, each a share of the
 * height under the family's headers.
 * @param props - See {@link EditorPanelStackProps}.
 * @returns The stack.
 */
export function EditorPanelStack<P extends string>(
  props: EditorPanelStackProps<P>,
): ReactElement {
  const { panels, bodies, shown, folded, onClose, onFolded } = props;
  const { fillScreen, print = false } = props;
  return (
    <div
      className={joinClassNames(
        'editor-panel-stack',
        print ? undefined : 'no-print',
      )}
    >
      <SidePanelStack
        panels={panels}
        openPanelIds={shown}
        onClose={onClose}
        foldedPanelIds={folded}
        onFoldedPanelIdsChange={onFolded}
        fillScreen={fillScreen}
      >
        {(panel) => <PanelBody body={bodies[panel.id]} />}
      </SidePanelStack>
    </div>
  );
}

/** What {@link EditorPanelRail} is given. */
export interface EditorPanelRailProps<P extends string> {
  /** Every panel, in the order the rail lists them. */
  panels: ReadonlyArray<RailPanel<P>>;
  /**
   * The panels the rail lists, in any order: what the page and the workspace
   * offer, and a panel on screen because somebody asked for it by name.
   * @default every panel
   */
  offered?: readonly P[];
  /** The panels on screen, lit on the rail: `panels.visible()`. */
  shown: readonly P[];
  /**
   * Open a panel or close it: `panels.toggle`.
   * @param panel - The panel.
   */
  onToggle: (panel: P) => void;
}

/**
 * The rail of an editor's panel buttons, at its right edge.
 * @param props - See {@link EditorPanelRailProps}.
 * @returns The rail.
 */
export function EditorPanelRail<P extends string>(
  props: EditorPanelRailProps<P>,
): ReactElement {
  const { panels, offered, shown, onToggle } = props;
  const listed: Array<RailPanel<P>> = [];
  for (const panel of panels) {
    if (offered === undefined || offered.includes(panel.id)) {
      listed.push(panel);
    }
  }
  return <PanelRail panels={listed} openIds={shown} onToggle={onToggle} />;
}

function PanelBody(props: { body: ComponentType }): ReactElement {
  const { body: Body } = props;
  return <Body />;
}
