import { errorMessage } from '../../error/core/toError.ts';
import type { DemoMessage } from '../../slides/core/demoProtocol.ts';
import {
  DEMO_DONE,
  DEMO_FAILED,
  DEMO_READY,
  DEMO_STEP,
  readDemoMessage,
} from '../../slides/core/demoProtocol.ts';

import type { DemoActions } from './demoActions.ts';
import { createDemoActions } from './demoActions.ts';
import { createDemoCursor } from './demoCursor.ts';
import { keepKeyboardOutside, tolerateDemoPointer } from './demoEvents.ts';

/** One step of a demo: what the line of the slide says to do, done. */
export type DemoStep = (actions: DemoActions) => Promise<void>;

/** A demo a tool plays on a steps slide. */
export interface Demo {
  /** Put the tool back where the demo starts: an empty page, say. */
  reset: () => Promise<void> | void;
  /** The steps, one per line of the slide that plays them, in order. */
  steps: readonly DemoStep[];
}

/**
 * Play a demo on the steps a slide asks for.
 *
 * The slide framing the tool says which step it is on, and the tool is
 * brought there: the next step is played from where the last one left the
 * tool; any other — a step back, a jump, the same step again — puts the tool
 * back where the demo starts and replays the steps before it at once, so every
 * step starts from the same place however it was reached. A step still
 * playing when the slide moves is stopped where it is.
 *
 * Only the page framing the tool is heard. A page opened on its own hears
 * itself, which is how a test plays a demo through.
 * @param name - The demo's name, as `?demo=` writes it.
 * @param demo - The demo.
 * @returns Stops the demo and takes its cursor off the page.
 */
export function serveDemo(name: string, demo: Demo): () => void {
  tolerateDemoPointer();
  keepKeyboardOutside();
  const host = globalThis.parent;
  const cursor = createDemoCursor(document);
  // The queue plays one step at a time, so two steps never write it at once.
  let played = UNKNOWN;
  const remember = (step: number): void => {
    played = step;
  };
  let running: AbortController | undefined;
  let queue = Promise.resolve();

  function post(message: DemoMessage): void {
    host.postMessage(message, '*');
  }

  async function play(step: number, signal: AbortSignal): Promise<void> {
    if (signal.aborted) return;
    try {
      if (step >= demo.steps.length) {
        throw new Error(`The demo "${name}" has no step ${step + 1}.`);
      }
      if (played !== step - 1) {
        remember(UNKNOWN);
        cursor.label(null);
        await demo.reset();
        for (let index = 0; index < step; index++) {
          // eslint-disable-next-line no-await-in-loop -- each step starts where the one before left the tool
          await demo.steps[index]?.(
            createDemoActions({ cursor, signal, fast: true }),
          );
          remember(index);
        }
      }
      cursor.label(step + 1);
      await demo.steps[step]?.(
        createDemoActions({ cursor, signal, fast: false }),
      );
      remember(step);
      post({ type: DEMO_DONE, step });
    } catch (error) {
      remember(UNKNOWN);
      if (!signal.aborted) {
        post({ type: DEMO_FAILED, step, reason: errorMessage(error) });
      }
    }
  }

  function onMessage(event: MessageEvent): void {
    if (event.source !== host) return;
    const message = readDemoMessage(event.data);
    if (message?.type !== DEMO_STEP) return;
    running?.abort();
    const controller = new AbortController();
    running = controller;
    queue = queue.then(() => play(message.step, controller.signal));
  }

  globalThis.addEventListener('message', onMessage);
  post({ type: DEMO_READY, demo: name, steps: demo.steps.length });

  return () => {
    globalThis.removeEventListener('message', onMessage);
    running?.abort();
    cursor.remove();
  };
}

/** No step is known to have been played through, so the next one resets. */
const UNKNOWN = -2;
