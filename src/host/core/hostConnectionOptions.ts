/**
 * What a tool's side of the host protocol runs with: the window it talks
 * through, what it says of itself, and what it serves.
 */

import type { CitedWork } from '../../citation/core/works.ts';

import type { FigurePage } from './answerGet.ts';
import type { HostOutputs } from './hostOutputs.ts';
import type { HostSettings } from './hostSettings.ts';
import type { ToolInterface } from './protocol.ts';
import type { LoadedInput } from './selectInputs.ts';
import type { ToolHelp } from './toolCredits.ts';

/** What a window `message` event carries, as far as the protocol reads it. */
export interface HostMessageEvent {
  data: unknown;
  source: unknown;
  ports: readonly MessagePort[];
}

/** Where the connection runs, and what it serves. */
export interface HostConnectionOptions {
  /** The page to introduce the tool to: the parent frame, or the opener. */
  host: { postMessage: (message: unknown, targetOrigin: string) => void };
  /** Subscribe to this window's messages; the returned function unsubscribes. */
  listen: (listener: (event: HostMessageEvent) => void) => () => void;
  /** What the tool takes and gives, as `hello` announces it. */
  tool: ToolInterface;
  /** The tool's origin, as `hello` states it. */
  origin: string;
  /** The build that is running, as the About states it, or `null`. */
  build: unknown;
  /**
   * The works the About asks to be cited for, as `hello` states them.
   * @default undefined — `hello` names none
   */
  cite?: readonly CitedWork[];
  /**
   * Help on the page, as `hello` states it.
   * @default undefined — `hello` carries none
   */
  help?: ToolHelp;
  /**
   * Show the inputs of a new document. Throwing, or rejecting, means they
   * could not be read: the error's message goes back to the host, and the
   * document is not marked as applied.
   */
  load: (inputs: readonly LoadedInput[]) => void | Promise<void>;
  /**
   * Where the values of the tool's outputs are read, for `get` and for the
   * `output` sent when one the host accepted changes.
   * @default undefined — nothing goes back
   */
  outputs?: HostOutputs;
  /**
   * What the page shows, in the site's own format, written into every picture
   * handed back so the site opens it again with nothing computed anew.
   * @default undefined — the pictures cannot be opened again
   */
  state?: FigurePage['state'];
  /**
   * What a host may set while the tool is open, and where the values are read.
   * @default undefined — the tool has no settings, and says nothing of them
   */
  settings?: HostSettings;
  /**
   * How long the outputs must stay still before a change is sent, in
   * milliseconds.
   * @default OUTPUT_DELAY
   */
  outputDelay?: number;
}
