import { expect, test } from 'vitest';

import { hasModifier, isApplePlatform, shortcutText } from '../platform.ts';

test('a Mac, an iPad and an iPhone are Apple platforms; Windows and Linux are not', () => {
  expect(
    isApplePlatform(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
    ),
  ).toBe(true);
  expect(isApplePlatform('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)')).toBe(
    true,
  );
  expect(
    isApplePlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'),
  ).toBe(true);
  expect(
    isApplePlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0'),
  ).toBe(false);
  expect(isApplePlatform('Mozilla/5.0 (X11; Linux x86_64) Firefox/131.0')).toBe(
    false,
  );
});

test('a Mac answers ⌘ and not Ctrl, the others Ctrl and not ⌘', () => {
  const command = { metaKey: true, ctrlKey: false };
  const control = { metaKey: false, ctrlKey: true };

  expect(hasModifier(command, true)).toBe(true);
  expect(hasModifier(control, true)).toBe(false);
  expect(hasModifier(command, false)).toBe(false);
  expect(hasModifier(control, false)).toBe(true);
});

test('a shortcut is written ⇧⌘Z on a Mac and Ctrl+⇧+Z elsewhere', () => {
  expect(shortcutText(['⇧', '⌘', 'Z'], true)).toBe('⇧⌘Z');
  expect(shortcutText(['Ctrl', '⇧', 'Z'], false)).toBe('Ctrl+⇧+Z');
});
