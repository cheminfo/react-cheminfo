/**
 * What `useFramedTool` takes and gives: the frame and the document a
 * host hands over, and the tool as the host page then sees it.
 */

import type { LoadOutcome, ToolDocument } from '../core/connectTool.ts';
import type {
  HostItem,
  ToolSettingField,
  ToolSettings,
} from '../core/protocol.ts';
import type { ToolHello } from '../core/toolMessages.ts';

/** What `useFramedTool` frames, and what it hands over. */
export interface FramedToolOptions {
  /**
   * The address the frame opens, `?embed=1` included. Its origin is the only
   * one talked to.
   */
  url: string;
  /** How the host introduces itself to the tool. */
  host: string;
  /**
   * The document to show, or `null` while there is none. It is handed over
   * whenever its `document` changes, and never twice in a row — and only while
   * the frame can be seen: a frame in a collapsed panel or a hidden tab is
   * handed the latest document when it shows again, so the tool computes
   * nothing nobody looks at.
   */
  document: ToolDocument | null;
  /**
   * How long the tool has to say `hello` before it counts as unavailable, in
   * milliseconds.
   * @default HELLO_TIMEOUT
   */
  helloTimeout?: number;
  /**
   * Told of the values the tool sends unasked about the document on screen —
   * what its visitor just picked — and never of those it already held when it
   * showed the document.
   * @default undefined
   */
  onOutput?: (items: readonly HostItem[]) => void;
}

/** Whether the tool answered: still loading, talking, or silent past the wait. */
export type FramedToolStatus = 'connecting' | 'connected' | 'unavailable';

/** A framed tool, as the host page sees it. */
export interface FramedTool {
  /**
   * The callback ref of the `<iframe>`, rendered with the hook and given no
   * `src` of its own: the address is set once this page listens, so the
   * tool's `hello` cannot be missed.
   */
  attachFrame: (element: HTMLIFrameElement | null) => void;
  /**
   * Show the frame on the whole screen, from a click; Esc brings it back.
   * Rejects where the browser will not.
   */
  fullscreen: () => Promise<void>;
  /** Whether the tool answered. */
  status: FramedToolStatus;
  /** What the tool said it takes and gives, once it has. */
  tool: ToolHello | null;
  /** What became of the document on screen, once the tool answered. */
  outcome: LoadOutcome | null;
  /**
   * The values the document's `accept` names, by output key: those the tool
   * held once it showed the document, then every change it sent.
   */
  outputs: ReadonlyMap<string, HostItem>;
  /** Ask for the current value of some outputs; rejects with the tool's reason. */
  get: (keys: readonly string[]) => Promise<HostItem[]>;
  /**
   * What the tool says its settings are, whoever changed them last: a host's
   * controls show these rather than what was last asked. `null` for a tool
   * that has none, or has not said yet, so a host offers no control for them.
   */
  settings: ToolSettings | null;
  /**
   * How the tool says a host draws a control for each of its settings, in
   * order — `<ToolSettingControls>` draws them. Empty for a tool that
   * describes none, so a host draws only the controls it knows.
   */
  settingFields: readonly ToolSettingField[];
  /**
   * Change some of the tool's settings, without reloading it.
   * @param settings - The settings that change.
   */
  setSettings: (settings: ToolSettings) => void;
}
