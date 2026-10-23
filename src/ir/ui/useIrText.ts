/**
 * The words of the viewer that change with what was measured, in the language
 * the page is written in.
 *
 * Infrared's are not in the chrome's catalog: they are read from the core
 * records, so an infrared viewer reads the same in every language. Raman's are
 * in the catalog, each key written out rather than built, so a key the catalog
 * lacks fails the type check instead of rendering raw.
 */

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { IrCommand, IrCommandId } from '../core/irCommands.ts';
import { boxZoomOnly, yAxisTitle } from '../core/irMode.ts';
import type { IrMode } from '../core/irSpectrum.ts';
import type { IrTechnique } from '../core/irTechnique.ts';
import { IR_TECHNIQUE_RULES } from '../core/irTechnique.ts';
import { irCommandsFor } from '../core/irTechniqueCommands.ts';

/** The words that change with what was measured. */
export interface IrText {
  /** What the horizontal axis is called. */
  xTitle: string;
  /** What the value axis is called in a mode. */
  yTitle: (mode: IrMode) => string;
  /** What the chart is and what can be done to it, for whoever cannot see it. */
  chart: (mode: IrMode) => string;
  /** The accessible name of the tool rail. */
  tools: string;
  /** The accessible name of the header. */
  viewer: string;
  /** The accessible name of the header's help group. */
  viewerHelp: string;
  /** The accessible name of the mark. */
  mark: string;
  /** The title of the documentation dialog. */
  documentation: string;
  /** A command as the viewer words it, `undefined` for one it does not offer. */
  command: (id: IrCommandId) => IrCommand | undefined;
}

/**
 * The words of a viewer of one technique.
 * @param technique - What was measured.
 * @returns The words, in the language of the page where the catalog has them.
 */
export function useIrText(technique: IrTechnique): IrText {
  const t = useChromeT();
  return technique === 'raman' ? ramanText(t) : infraredText(t);
}

/**
 * The words of an infrared viewer, from the core records.
 * @param t - The chrome's formatter, for a value axis the catalog names.
 * @returns The words.
 */
function infraredText(t: Translate<ChromeKey>): IrText {
  const { name, xTitle } = IR_TECHNIQUE_RULES.infrared;
  const opening = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  const commands = irCommandsFor('infrared');
  return {
    xTitle,
    yTitle: (mode) => modeTitle(t, mode),
    chart: (mode) => infraredChartLabel(opening, mode),
    tools: `${opening} spectrum tools`,
    viewer: `${opening} spectrum viewer`,
    viewerHelp: `${opening} spectrum viewer help`,
    mark: `${opening} viewer`,
    documentation: `Using the ${name} viewer`,
    command: (id) => commands[id],
  };
}

/**
 * The words of a Raman viewer, all of them from the catalog.
 * @param t - The chrome's formatter.
 * @returns The words.
 */
function ramanText(t: Translate<ChromeKey>): IrText {
  const commands = irCommandsFor('raman');
  return {
    xTitle: t('ir.raman.xTitle'),
    yTitle: (mode) => modeTitle(t, mode),
    chart: () => t('ir.raman.chart'),
    tools: t('ir.raman.tools'),
    viewer: t('ir.raman.viewer'),
    viewerHelp: t('ir.raman.viewerHelp'),
    mark: t('ir.raman.mark'),
    documentation: t('ir.raman.documentation'),
    command: (id) => translated(t, commands[id], RAMAN_COMMAND_KEYS[id]),
  };
}

/**
 * What the value axis is called, translated where the catalog has the axis.
 * @param t - The chrome's formatter.
 * @param mode - Which value axis.
 * @returns The title.
 */
function modeTitle(t: Translate<ChromeKey>, mode: IrMode): string {
  const key = MODE_KEYS[mode];
  return key === undefined ? yAxisTitle(mode) : t(key);
}

/**
 * The infrared chart's accessible name. The gestures differ by mode, so the
 * sentence does too — a label promising the wheel to a reader who cannot watch
 * it fail to do anything is worse than no label at all.
 * @param opening - The technique's name, as a sentence opens on it.
 * @param mode - Which value axis is being drawn.
 * @returns The label.
 */
function infraredChartLabel(opening: string, mode: IrMode): string {
  const axis = `${opening} spectrum read as ${yAxisTitle(mode)}, wavenumber running from high at the left to low at the right.`;
  return boxZoomOnly(mode)
    ? `${axis} Drag a rectangle over it to zoom to that rectangle, and double click to fit everything again.`
    : `${axis} Drag across it to zoom the wavenumber axis, drag past the baseline to take the value axis with it, turn the wheel to scale the value axis, and double click to fit everything again.`;
}

/**
 * A command with its words read from the catalog where it has them.
 * @param t - The chrome's formatter.
 * @param entry - The command as its table words it.
 * @param keys - The catalog keys of its title and description, if any.
 * @returns The command, translated.
 */
function translated(
  t: Translate<ChromeKey>,
  entry: IrCommand | undefined,
  keys: CommandKeys | undefined,
): IrCommand | undefined {
  if (entry === undefined || keys === undefined) return entry;
  return {
    ...entry,
    ...(keys.title === undefined ? {} : { title: t(keys.title) }),
    ...(keys.description === undefined
      ? {}
      : { description: t(keys.description) }),
  };
}

/** Where a command's words are kept in the catalog. */
interface CommandKeys {
  /**
   * Its title's key.
   * @default the table's title
   */
  title?: ChromeKey;
  /**
   * Its description's key.
   * @default the table's description
   */
  description?: ChromeKey;
}

/** The value axes the catalog has a name for. */
const MODE_KEYS: Partial<Record<IrMode, ChromeKey>> = {
  intensity: 'ir.mode.intensity',
};

/** The catalog keys of every command a Raman viewer words its own way. */
const RAMAN_COMMAND_KEYS: Partial<Record<IrCommandId, CommandKeys>> = {
  about: { title: 'ir.raman.about' },
  documentation: { description: 'ir.raman.command.documentation' },
  readTool: { description: 'ir.raman.command.readTool' },
  boxTool: { description: 'ir.raman.command.boxTool' },
  zoomIn: { description: 'ir.raman.command.zoomIn' },
  togglePicking: { description: 'ir.raman.command.togglePicking' },
};
