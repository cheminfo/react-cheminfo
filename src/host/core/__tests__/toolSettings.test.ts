import { expect, test } from 'vitest';

import { readSettingFields } from '../toolSettings.ts';

test('a choice, a switch and a number are read as the tool described them', () => {
  expect(
    readSettingFields([
      {
        key: 'style',
        label: 'Style',
        description: 'How the atoms and bonds are drawn.',
        type: 'choice',
        choices: [
          { value: 'ball', label: 'Ball and stick' },
          { value: 'stick', label: 'Sticks' },
        ],
      },
      { key: 'surface', label: 'Surface', type: 'toggle' },
      { key: 'spin', label: 'Spin', type: 'toggle', on: 'yes', off: 'no' },
      {
        key: 'share',
        label: 'Inside',
        type: 'number',
        min: 0.1,
        max: 0.95,
        step: 0.05,
        unit: '%',
      },
    ]),
  ).toStrictEqual([
    {
      key: 'style',
      label: 'Style',
      description: 'How the atoms and bonds are drawn.',
      type: 'choice',
      choices: [
        { value: 'ball', label: 'Ball and stick' },
        { value: 'stick', label: 'Sticks' },
      ],
    },
    { key: 'surface', label: 'Surface', type: 'toggle' },
    { key: 'spin', label: 'Spin', type: 'toggle', on: 'yes', off: 'no' },
    {
      key: 'share',
      label: 'Inside',
      type: 'number',
      min: 0.1,
      max: 0.95,
      step: 0.05,
      unit: '%',
    },
  ]);
});

test('a field that is not well formed is left out, and so is a second one for a setting', () => {
  expect(
    readSettingFields([
      'surface',
      { key: '', label: 'Nameless', type: 'toggle' },
      { key: 'style', label: 'Style', type: 'choice', choices: [] },
      { key: 'style', label: 'Style', type: 'choice', choices: [{ value: 1 }] },
      { key: 'spin', label: 'Spin', type: 'toggle', on: '1', off: '1' },
      { key: 'zoom', label: 'Zoom', type: 'number', min: 3, max: 1 },
      { key: 'tint', label: 'Tint', type: 'colour' },
      { key: 'level', label: 'Level', type: 'number', step: -1, min: 'low' },
      { key: 'level', label: 'Again', type: 'toggle' },
    ]),
  ).toStrictEqual([{ key: 'level', label: 'Level', type: 'number' }]);
  expect(readSettingFields({ key: 'style' })).toStrictEqual([]);
  expect(readSettingFields(undefined)).toStrictEqual([]);
});

test('long labels and descriptions are cut, and so are lists too long to draw', () => {
  const [field] = readSettingFields([
    {
      key: 'conformer',
      label: 'x'.repeat(200),
      description: 'y'.repeat(500),
      type: 'choice',
      choices: Array.from({ length: 100 }, (_, index) => ({
        value: String(index),
        label: `Conformer ${index + 1}`,
      })),
    },
  ]);

  expect(field?.label).toHaveLength(80);
  expect(field?.description).toHaveLength(300);
  expect(field?.type === 'choice' ? field.choices : []).toHaveLength(64);
});
