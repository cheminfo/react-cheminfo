import { expect, test } from 'vitest';

import type { PanelLayout } from '../panelLayout.ts';
import {
  PANEL_STATUSES,
  isPanelStatus,
  panelStatusOf,
  withPanelStatus,
} from '../panelLayout.ts';

const LAYOUT: PanelLayout = {
  open: ['structure', 'object'],
  folded: ['object'],
  hidden: ['tlc'],
};

test('each panel reads as hidden, available, folded or open', () => {
  expect(panelStatusOf(LAYOUT, 'structure')).toBe('open');
  expect(panelStatusOf(LAYOUT, 'object')).toBe('folded');
  expect(panelStatusOf(LAYOUT, 'glassware')).toBe('available');
  expect(panelStatusOf(LAYOUT, 'tlc')).toBe('hidden');
  expect(
    panelStatusOf({ open: ['tlc'], folded: [], hidden: ['tlc'] }, 'tlc'),
  ).toBe('hidden');
});

test('setting a status moves the panel between the lists, and only it', () => {
  expect(withPanelStatus(LAYOUT, 'glassware', 'folded')).toStrictEqual({
    open: ['structure', 'object', 'glassware'],
    folded: ['object', 'glassware'],
    hidden: ['tlc'],
  });
  expect(withPanelStatus(LAYOUT, 'object', 'open')).toStrictEqual({
    open: ['structure', 'object'],
    folded: [],
    hidden: ['tlc'],
  });
  expect(withPanelStatus(LAYOUT, 'structure', 'hidden')).toStrictEqual({
    open: ['object'],
    folded: ['object'],
    hidden: ['tlc', 'structure'],
  });
  expect(withPanelStatus(LAYOUT, 'tlc', 'available')).toStrictEqual({
    open: ['structure', 'object'],
    folded: ['object'],
    hidden: [],
  });
});

test('a status the panel already has changes nothing', () => {
  expect(withPanelStatus(LAYOUT, 'object', 'folded')).toBe(LAYOUT);
});

test('only the four statuses are statuses', () => {
  expect(PANEL_STATUSES.filter((status) => isPanelStatus(status))).toHaveLength(
    4,
  );
  expect(isPanelStatus('shown')).toBe(false);
  expect(isPanelStatus(undefined)).toBe(false);
});
