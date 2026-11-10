import { expect, test } from 'vitest';

import type { XpsCommandId } from '../xpsCommands.ts';
import {
  matchXpsCommand,
  xpsCommand,
  xpsCommands,
  xpsShortcutLabels,
} from '../xpsCommands.ts';

/**
 * A key press, as the matcher is handed one.
 * @param key - The `event.key` of the press.
 * @param modifiers - The modifiers held down with it, none by default.
 * @param modifiers.ctrlKey - Whether the control key was held.
 * @param modifiers.metaKey - Whether the command key was held.
 * @param modifiers.altKey - Whether the alt key was held.
 * @returns The press.
 */
function press(
  key: string,
  modifiers: { ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean } = {},
) {
  return {
    key,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    ...modifiers,
  };
}

test('the window keys, and the initial of each layer', () => {
  expect(matchXpsCommand(press('f'))).toBe('resetZoom');
  expect(matchXpsCommand(press('h'))).toBe('documentation');
  expect(matchXpsCommand(press('+'))).toBe('zoomIn');
  expect(matchXpsCommand(press('='))).toBe('zoomIn');
  expect(matchXpsCommand(press('-'))).toBe('zoomOut');
  expect(matchXpsCommand(press('_'))).toBe('zoomOut');
  expect(matchXpsCommand(press('r'))).toBe('showRegions');
  expect(matchXpsCommand(press('c'))).toBe('showComponents');
  expect(matchXpsCommand(press('l'))).toBe('showLabels');
});

test('a key that asks for nothing, and the modifiers that spoil one', () => {
  expect(matchXpsCommand(press('q'))).toBeNull();
  expect(matchXpsCommand(press('c', { ctrlKey: true }))).toBeNull();
  expect(matchXpsCommand(press('f', { metaKey: true }))).toBeNull();
  expect(matchXpsCommand(press('f', { altKey: true }))).toBeNull();
});

test('the tooltip shows the key the matcher fires on', () => {
  expect(xpsShortcutLabels('resetZoom')).toStrictEqual(['f']);
  expect(xpsShortcutLabels('zoomIn')).toStrictEqual(['+']);
  expect(xpsShortcutLabels('zoomOut')).toStrictEqual(['-']);
  expect(xpsShortcutLabels('showComponents')).toStrictEqual(['c']);
  expect(xpsShortcutLabels('clear')).toStrictEqual([]);
  expect(xpsShortcutLabels('about')).toStrictEqual([]);
});

test('closing every spectrum is offered by a button and by no key at all', () => {
  expect(xpsCommand('clear').shortcut).toBeUndefined();
  expect(xpsCommand('about').shortcut).toBeUndefined();
  expect(xpsCommand('fullScreen').shortcut).toBeUndefined();
});

test('the window commands say the gesture that does the same thing', () => {
  expect(xpsCommand('zoomIn').gestures).toStrictEqual([
    { title: 'Over the chart', shortcuts: ['Scroll wheel'] },
  ]);
  expect(xpsCommand('zoomOut').gestures).toStrictEqual([
    { title: 'Over the chart', shortcuts: ['Scroll wheel'] },
  ]);
  expect(xpsCommand('resetZoom').gestures).toStrictEqual([
    { title: 'On the chart', shortcuts: ['Double click'] },
  ]);
});

test('no two commands answer to the same key', () => {
  const taken = new Set<string>();
  for (const id of Object.keys(xpsCommands) as XpsCommandId[]) {
    const { shortcut } = xpsCommand(id);
    if (!shortcut) continue;
    for (const key of shortcut.keys) {
      expect(taken.has(key), `${key} is asked for twice`).toBe(false);

      taken.add(key);
    }
  }

  expect(taken.size).toBe(11);
});

test('every command the viewer offers is one of these thirteen', () => {
  expect(Object.keys(xpsCommands)).toStrictEqual([
    'about',
    'documentation',
    'fullScreen',
    'zoomIn',
    'zoomOut',
    'resetZoom',
    'toggleAxis',
    'toggleNormalise',
    'showRegions',
    'showComponents',
    'showLabels',
    'exportImage',
    'clear',
  ]);
});

test('every command is called something a tooltip can be titled with', () => {
  for (const id of Object.keys(xpsCommands) as XpsCommandId[]) {
    expect(xpsCommand(id).title.length).toBeGreaterThan(0);
  }
});
