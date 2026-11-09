/**
 * The messages between a steps slide and the tool it frames.
 *
 * The slide names the demo in the address it frames (`?demo=reflux`), so the
 * tool knows which script to load before any message arrives; after that the
 * slide only ever says which step it is on. The tool owns its scripts, because
 * they drive its own controls, and its end-to-end suite plays every one of
 * them: a demo that no longer works fails the build rather than a lecture.
 */

/** The parameter naming the demo a framed tool plays. */
export const DEMO_PARAM = 'demo';

/** Slide to tool: bring the tool to this step, and play it. */
export const DEMO_STEP = 'cheminfo:demo-step';
/** Tool to slide: the demo is listening, and has this many steps. */
export const DEMO_READY = 'cheminfo:demo-ready';
/** Tool to slide: the step has been played. */
export const DEMO_DONE = 'cheminfo:demo-done';
/** Tool to slide: the step could not be played, and why. */
export const DEMO_FAILED = 'cheminfo:demo-failed';

/** A message of the demo protocol. */
export type DemoMessage =
  | { type: typeof DEMO_STEP; step: number }
  | { type: typeof DEMO_READY; demo: string; steps: number }
  | { type: typeof DEMO_DONE; step: number }
  | { type: typeof DEMO_FAILED; step: number; reason: string };

/**
 * Read a posted message as one of the demo protocol.
 *
 * Messages arrive from any frame on the page — a tool's host connection, an
 * embed height, an extension — so anything not shaped exactly like one of ours
 * is ignored rather than trusted.
 * @param data - The `data` of a `message` event.
 * @returns The message, or `null` when it is not one of the protocol.
 */
export function readDemoMessage(data: unknown): DemoMessage | null {
  if (typeof data !== 'object' || data === null) return null;
  const message = data as Record<string, unknown>;
  const { type } = message;
  if (type === DEMO_READY) {
    const { demo, steps } = message;
    if (typeof demo !== 'string' || !isStep(steps)) return null;
    return { type, demo, steps };
  }
  const { step } = message;
  if (!isStep(step)) return null;
  if (type === DEMO_STEP || type === DEMO_DONE) return { type, step };
  if (type === DEMO_FAILED) {
    const { reason } = message;
    return { type, step, reason: typeof reason === 'string' ? reason : '' };
  }
  return null;
}

/**
 * The demo an address names.
 * @param search - The query string, with or without its `?`.
 * @returns The demo's name, or `null` when the address names none.
 */
export function readDemoName(search: string): string | null {
  const name = new URLSearchParams(search).get(DEMO_PARAM)?.trim();
  return name === undefined || name === '' ? null : name;
}

function isStep(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}
