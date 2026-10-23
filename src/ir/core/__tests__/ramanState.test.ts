import { expect, test } from 'vitest';

import {
  irCommandEntryLabel,
  irCommandLabel,
  irCommands,
} from '../irCommands.ts';
import { irReducer } from '../irReducer.ts';
import { createIrState } from '../irState.ts';
import { irCommandOffered, irCommandsFor } from '../irTechniqueCommands.ts';

test('an infrared viewer opens on transmittance', () => {
  const { settings } = createIrState();

  expect(settings.technique).toBe('infrared');
  expect(settings.mode).toBe('transmittance');
  expect(
    createIrState({ settings: { mode: 'absorbance' } }).settings.mode,
  ).toBe('absorbance');
});

test('a Raman viewer opens on intensity, whatever mode it is handed', () => {
  expect(
    createIrState({ settings: { technique: 'raman' } }).settings,
  ).toStrictEqual({
    technique: 'raman',
    mode: 'intensity',
    pickBands: true,
    picking: { minRelativeHeight: 0.02, minPeakWidth: 4 },
    showAssignments: false,
    labelLimit: 12,
    assignmentTolerance: 5,
  });
  expect(
    createIrState({ settings: { technique: 'raman', mode: 'absorbance' } })
      .settings.mode,
  ).toBe('intensity');
});

test('the technique is fixed, and a mode it does not offer is refused', () => {
  const raman = createIrState({ settings: { technique: 'raman' } });

  const asked = irReducer(raman, {
    type: 'setSettings',
    settings: { technique: 'infrared', mode: 'transmittance' },
  });

  expect(asked.settings.technique).toBe('raman');
  expect(asked.settings.mode).toBe('intensity');
  expect(
    irReducer(createIrState(), {
      type: 'setSettings',
      settings: { mode: 'intensity' },
    }).settings.mode,
  ).toBe('transmittance');
});

test('a workspace saved from an infrared viewer leaves a Raman one Raman', () => {
  const raman = createIrState({ settings: { technique: 'raman' } });

  const restored = irReducer(raman, {
    type: 'loadState',
    state: {
      settings: { technique: 'infrared', mode: 'absorbance', labelLimit: 5 },
    },
  });

  expect(restored.settings.technique).toBe('raman');
  expect(restored.settings.mode).toBe('intensity');
  // The rest of the workspace is taken as it was saved.
  expect(restored.settings.labelLimit).toBe(5);
});

test('a Raman viewer offers neither the mode toggle nor the assignments', () => {
  expect(irCommandsFor('infrared')).toBe(irCommands);
  expect(Object.keys(irCommandsFor('raman'))).toStrictEqual([
    'about',
    'documentation',
    'fullScreen',
    'readTool',
    'boxTool',
    'zoomIn',
    'zoomOut',
    'resetZoom',
    'togglePicking',
    'exportImage',
    'clear',
  ]);
  expect(irCommandOffered('raman', 'toggleMode')).toBe(false);
  expect(irCommandOffered('raman', 'toggleAssignments')).toBe(false);
  expect(irCommandOffered('raman', 'zoomIn')).toBe(true);
  expect(irCommandOffered('infrared', 'toggleMode')).toBe(true);
  expect(irCommandOffered('infrared', 'toggleAssignments')).toBe(true);
});

test('a Raman command keeps its key and drops the infrared wording', () => {
  const { readTool, zoomIn } = irCommandsFor('raman');

  expect(readTool).toStrictEqual({
    title: 'Read',
    shortcut: { keys: ['r'] },
    description:
      'A drag narrows the Raman shift axis. Released past the baseline, it takes the intensity axis with it.',
    gestures: [{ title: 'Over the chart', shortcuts: ['Drag'] }],
  });
  expect(zoomIn?.gestures).toStrictEqual([
    { title: 'Over the chart', shortcuts: ['Scroll wheel'] },
  ]);
  expect(irCommandsFor('raman').about?.title).toBe('About the Raman viewer');
  expect(irCommandEntryLabel(readTool ?? irCommands.readTool)).toBe('Read (r)');
  expect(irCommandLabel('about')).toBe('About the infrared viewer');
});
