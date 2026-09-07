import { expect, test } from 'vitest';

import { parseHexColor, toHexColor } from '../hex.ts';
import { hsvToRgb, rgbToHsv, wrapHue } from '../hsv.ts';

test('the three primaries sit a third of a turn apart', () => {
  expect(rgbToHsv(parseHexColor('#ff0000'))).toStrictEqual({
    hue: 0,
    saturation: 1,
    value: 1,
  });
  expect(rgbToHsv(parseHexColor('#00ff00')).hue).toBe(120);
  expect(rgbToHsv(parseHexColor('#0000ff')).hue).toBe(240);
});

test('a grey has no hue and no saturation, only a value', () => {
  expect(rgbToHsv(parseHexColor('#808080'))).toStrictEqual({
    hue: 0,
    saturation: 0,
    value: 128 / 255,
  });
  expect(rgbToHsv(parseHexColor('#000000'))).toStrictEqual({
    hue: 0,
    saturation: 0,
    value: 0,
  });
});

test('a colour survives the trip through the wheel and back', () => {
  for (const color of ['#3fa9d1', '#fde725', '#440154', '#b45309', '#ffffff']) {
    expect(toHexColor(hsvToRgb(rgbToHsv(parseHexColor(color))))).toBe(color);
  }
});

test('the hue is wrapped rather than clamped, so a scale may run past a turn', () => {
  expect(wrapHue(370)).toBe(10);
  expect(wrapHue(-30)).toBe(330);
  expect(wrapHue(360)).toBe(0);
  expect(wrapHue(Number.NaN)).toBe(0);
  expect(toHexColor(hsvToRgb({ hue: 480, saturation: 1, value: 1 }))).toBe(
    '#00ff00',
  );
});

test('a saturation or a value outside the range is brought back into it', () => {
  expect(toHexColor(hsvToRgb({ hue: 0, saturation: 5, value: 5 }))).toBe(
    '#ff0000',
  );
  expect(toHexColor(hsvToRgb({ hue: 0, saturation: -1, value: -1 }))).toBe(
    '#000000',
  );
});
