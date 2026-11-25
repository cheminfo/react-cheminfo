// @vitest-environment jsdom
import { expect, test } from 'vitest';

import { helpCardMayOpen, watchPresses } from '../pointerIntent.ts';

function element(tag: string): HTMLElement {
  const made = document.createElement(tag);
  document.body.append(made);
  return made;
}

/**
 * The browser's events for the pointer crossing onto a target: its boundary
 * event, then the mouse's, as every engine sends them.
 * @param target - Where the pointer lands.
 * @returns The mouse's event, the one React builds its entering from.
 */
function crossOnto(target: Element): MouseEvent {
  target.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
  const over = new MouseEvent('mouseover', { bubbles: true });
  target.dispatchEvent(over);
  return over;
}

function pointer(type: 'pointermove' | 'pointerdown', target: Element): void {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true }));
}

test('an entering opens a card once the pointer has moved since it crossed, and until it presses', () => {
  let presses = 0;
  const stop = watchPresses(() => {
    presses++;
  });
  const count = element('button');
  const icon = document.createElement('span');
  count.append(icon);
  const entering = (nativeEvent: Event) => ({
    type: 'mouseenter',
    target: icon,
    nativeEvent,
  });

  const shifted = crossOnto(icon);
  const beforeMoving = helpCardMayOpen(entering(shifted));
  pointer('pointermove', count);
  const afterMoving = helpCardMayOpen(entering(shifted));
  pointer('pointerdown', icon);
  const afterPressing = helpCardMayOpen(entering(shifted));
  const comeBack = crossOnto(icon);
  pointer('pointermove', icon);

  expect([
    beforeMoving,
    afterMoving,
    afterPressing,
    helpCardMayOpen(entering(comeBack)),
    helpCardMayOpen({ type: 'mouseenter', target: icon }),
    helpCardMayOpen(undefined),
    presses,
  ]).toStrictEqual([false, true, false, true, false, false, 1]);

  stop();
  pointer('pointerdown', icon);

  expect(presses).toBe(1);

  count.remove();
});
