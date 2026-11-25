import { expect, test } from 'vitest';

import {
  panelStickyHeaderStyle,
  panelToolbarStyle,
  statusBarStyle,
} from '../../../core.ts';

test('a panel’s toolbar row, its table heading and its status bar draw their edges in the family’s border and surface tokens', () => {
  expect([
    panelToolbarStyle.borderBottom,
    panelStickyHeaderStyle.borderBottom,
    panelStickyHeaderStyle.background,
    statusBarStyle.borderTop,
  ]).toStrictEqual([
    '1px solid var(--border)',
    '1px solid var(--border)',
    'var(--surface)',
    '1px solid var(--border)',
  ]);
});
