import { expect, test } from 'vitest';

import { PANEL_PARAM, readPanelList } from '../panelParam.ts';

type Panel = 'structure' | 'name';

function isPanel(name: string): name is Panel {
  return name === 'structure' || name === 'name';
}

test('the panels a link names are read each once, in its order', () => {
  expect(PANEL_PARAM).toBe('panel');
  expect(readPanelList(' predict, spectra,,predict ')).toStrictEqual([
    'predict',
    'spectra',
  ]);
  expect(readPanelList(undefined)).toStrictEqual([]);
});

test('a name no panel carries is skipped', () => {
  expect(readPanelList('name,gone,structure,name', isPanel)).toStrictEqual([
    'name',
    'structure',
  ]);
});
