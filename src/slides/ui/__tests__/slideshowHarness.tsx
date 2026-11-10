/**
 * A player on the page, its slide held by the site the way a site holds it in
 * the address, and the keys and clicks a presenter sends it.
 *
 * Shared by the two files that drive it — moving through the talk, and what
 * the other keys and the bar do — so the talk and the harness are written
 * once.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import type { Talk } from '../../core/index.ts';

import type { PlayerProbeProps } from './PlayerProbe.tsx';
import { PlayerProbe } from './PlayerProbe.tsx';

/** Four slides; the second walks three steps, and the first has notes. */
export const TALK: Talk = {
  meta: { title: 'Reflux' },
  slides: [
    { layout: 'content', body: '## One', notes: 'Say one.' },
    { layout: 'steps', body: '## Two\n\n- a\n- b\n- c' },
    { layout: 'content', body: '## Three' },
    { layout: 'content', body: '## Four' },
  ],
};

/** Every slide the player asked the site for, in order. */
export const asked: number[] = [];

let host: HTMLDivElement | null = null;
let root: Root | null = null;

/** What a test may hand the player: the slide it opens on, and the rest. */
type MountProps = Partial<Omit<PlayerProbeProps, 'talk' | 'onAsk'>>;

/**
 * Put the player on the page.
 * @param props - The slide it opens on (the first when left unsaid), and
 * anything else it is handed.
 */
export function mountPlayer(props: MountProps = {}): void {
  const { start = 0, ...rest } = props;
  asked.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root?.render(
      <PlayerProbe
        {...rest}
        talk={TALK}
        start={start}
        onAsk={(next) => asked.push(next)}
      />,
    ),
  );
}

/** Take the player off the page. */
export function unmountPlayer(): void {
  act(() => root?.unmount());
  host?.remove();
  host = null;
  root = null;
}

/**
 * The element of the player matching a selector.
 * @param selector - What to look for.
 * @returns The element, or `null` when the player draws none.
 */
export function find(selector: string): HTMLElement | null {
  return host?.querySelector<HTMLElement>(selector) ?? null;
}

/**
 * Press a key, as the document hears it.
 * @param key - The `event.key`.
 * @param init - Any modifier held, and where the focus is.
 * @param target - What has the focus.
 * @returns Whether the player kept the key from the page.
 */
export function press(
  key: string,
  init: KeyboardEventInit = {},
  target: EventTarget = document.body,
): boolean {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event.defaultPrevented;
}

/**
 * Click an element of the player.
 * @param selector - Which one.
 */
export function click(selector: string): void {
  act(() => {
    find(selector)?.click();
  });
}

/**
 * Where the presentation stands, as the screen shows it.
 * @returns The counter, and the step lit on a steps slide (`-1` elsewhere).
 */
export function shown(): [string, number] {
  const steps = [...(host?.querySelectorAll('.slide-step') ?? [])];
  const lit = steps.findIndex((step) =>
    step.classList.contains('slide-step--current'),
  );
  return [find('.slideshow-counter')?.textContent ?? '', lit];
}
