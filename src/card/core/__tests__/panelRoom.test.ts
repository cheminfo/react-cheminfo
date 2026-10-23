import { expect, test } from 'vitest';

import { roomForPanels } from '../panelRoom.ts';

test('no panel open needs no room', () => {
  expect(roomForPanels([], 120)).toBe(0);
});

test('a dialog needs its own height, margins counted in', () => {
  expect(roomForPanels([{ kind: 'dialog', height: 412.4 }], 30)).toBe(413);
});

test('a popover hangs from its control, with room for its arrow under it', () => {
  expect(roomForPanels([{ kind: 'popover', height: 180 }], 40)).toBe(244);
});

test('a popover placed lower than its control says needs room down to its edge', () => {
  expect(
    roomForPanels([{ kind: 'popover', height: 180, bottom: 300 }], 40),
  ).toBe(308);
  // Placed higher, the control decides.
  expect(
    roomForPanels([{ kind: 'popover', height: 180, bottom: 150 }], 40),
  ).toBe(244);
});

test('the tallest need wins', () => {
  expect(
    roomForPanels(
      [
        { kind: 'popover', height: 100 },
        { kind: 'dialog', height: 320 },
        { kind: 'popover', height: 90, bottom: 280 },
      ],
      60,
    ),
  ).toBe(320);
});
