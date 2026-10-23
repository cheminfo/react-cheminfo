import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { IrCommandId } from '../../core/irCommands.ts';
import { IR_MODE_RULES } from '../../core/irMode.ts';
import type { IrTechnique } from '../../core/irTechnique.ts';
import { IR_TECHNIQUE_RULES } from '../../core/irTechnique.ts';
import { irCommandsFor } from '../../core/irTechniqueCommands.ts';
import type { IrText } from '../useIrText.ts';
import { useIrText } from '../useIrText.ts';

/**
 * The words of a viewer, as an English page reads them.
 * @param technique - What was measured.
 * @returns The words.
 */
function textOf(technique: IrTechnique): IrText {
  const read: IrText[] = [];
  function Probe() {
    read.push(useIrText(technique));
    return null;
  }
  renderToStaticMarkup(<Probe />);
  const [text] = read;
  if (text === undefined) throw new Error('the probe did not render');
  return text;
}

test('an infrared viewer keeps its English words', () => {
  const text = textOf('infrared');

  expect([
    text.xTitle,
    text.yTitle('transmittance'),
    text.tools,
    text.viewer,
    text.viewerHelp,
    text.mark,
    text.documentation,
    text.command('about')?.title,
  ]).toStrictEqual([
    'wavenumber (cm⁻¹)',
    'transmittance (%)',
    'Infrared spectrum tools',
    'Infrared spectrum viewer',
    'Infrared spectrum viewer help',
    'Infrared viewer',
    'Using the infrared viewer',
    'About the infrared viewer',
  ]);
  expect(text.chart('absorbance')).toBe(
    'Infrared spectrum read as absorbance, wavenumber running from high at the left to low at the right. Drag across it to zoom the wavenumber axis, drag past the baseline to take the value axis with it, turn the wheel to scale the value axis, and double click to fit everything again.',
  );
});

test('the English catalog says of Raman what the core records say', () => {
  const text = textOf('raman');

  expect(text.xTitle).toBe(IR_TECHNIQUE_RULES.raman.xTitle);
  expect(text.yTitle('intensity')).toBe(IR_MODE_RULES.intensity.title);

  // Every command reads, through the catalog, exactly what its table says.
  const table = irCommandsFor('raman');
  for (const id of Object.keys(table) as IrCommandId[]) {
    expect(text.command(id)).toStrictEqual(table[id]);
  }

  expect(text.command('toggleMode')).toBeUndefined();
});
