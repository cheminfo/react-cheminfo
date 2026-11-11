import { expect, test } from 'vitest';

import type { CaptionBoxInput } from '../captionBox.ts';
import { captionBoxPlacement, realignedShift } from '../captionBox.ts';

const CENTRED: CaptionBoxInput = {
  left: 100,
  top: 50,
  zoom: 2,
  size: 10,
  align: 'center',
  verticalAlign: 'baseline',
  rotation: 0,
  shift: 0,
};

test('the box sits on its anchor by its first baseline, centred', () => {
  expect(captionBoxPlacement(CENTRED)).toStrictEqual({
    left: 100,
    top: 31,
    transform: 'translateX(-50%)',
    transformOrigin: '50% 19px',
  });
  expect(captionBoxPlacement({ ...CENTRED, align: 'right' })).toMatchObject({
    transform: 'translateX(-100%)',
    transformOrigin: '100% 19px',
  });
  expect(captionBoxPlacement({ ...CENTRED, align: 'left' })).toMatchObject({
    transform: 'translateX(0%)',
    transformOrigin: '0% 19px',
  });
});

test('by its top, middle or bottom, the box grows away from the anchor', () => {
  expect(
    captionBoxPlacement({ ...CENTRED, verticalAlign: 'top' }),
  ).toMatchObject({ top: 49, transform: 'translateX(-50%)' });
  expect(
    captionBoxPlacement({ ...CENTRED, verticalAlign: 'middle' }),
  ).toMatchObject({ top: 49, transform: 'translateX(-50%) translateY(-50%)' });
  expect(
    captionBoxPlacement({ ...CENTRED, verticalAlign: 'bottom' }),
  ).toMatchObject({ top: 49, transform: 'translateX(-50%) translateY(-100%)' });
});

test('aligned anew, the anchor moves along the line and the box stays put', () => {
  // A box 80 pixels wide, centred, aligned left: the anchor moves 40 pixels
  // back, which is 20 points at two pixels a point.
  const shift = realignedShift('center', 'left', 80, 2);

  expect(shift).toBe(-20);
  expect(
    captionBoxPlacement({ ...CENTRED, align: 'left', shift }),
  ).toMatchObject({ left: 60, top: 31 });

  // Turned a quarter, the line runs down the screen.
  const turned = captionBoxPlacement({
    ...CENTRED,
    align: 'left',
    shift,
    rotation: 90,
  });

  expect(turned.left).toBeCloseTo(100, 9);
  expect(turned.top).toBeCloseTo(-9, 9);
  expect(realignedShift('left', 'right', 80, 2)).toBe(40);
});
