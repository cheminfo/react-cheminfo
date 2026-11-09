/**
 * A viewer's state written down as JSON, and read back: what a site keeps in
 * a figure of the chart, or in a document, so the chart opens again exactly as
 * it was — the spectra with their bands, the one selected, the window shown,
 * and how they are read.
 *
 * The value axes are written as plain lists, since JSON has no typed array; a
 * value that is no finite number — the absorbance of a band at zero
 * transmittance — is written `null` and read back as `NaN`, which the chart
 * skips alike. What passes in a session is left out: the tool in hand, which
 * panels are open, the last error. What is read comes from a file, from
 * anywhere, so it is checked, and a record that does not hold together is
 * refused whole.
 */

import { isPlainRecord } from '../../state/core/mergeStored.ts';

import type { IrBand } from './irBand.ts';
import type {
  IrDomain,
  IrMeta,
  IrMode,
  IrOrigin,
  IrSpectrum,
} from './irSpectrum.ts';
import type { IrSettings, IrState, PartialIrState } from './irState.ts';
import { isIrWindow } from './irState.ts';
import type { IrTechnique } from './irTechnique.ts';
import { IR_TECHNIQUES } from './irTechnique.ts';
import type { PickBandsOptions } from './pickBands.ts';

/** The value axes a spectrum may carry, each one value per wavenumber. */
const VALUE_AXES = ['absorbance', 'transmittance', 'intensity'] as const;

/** The ways a spectrum is read: the same three, by name. */
const MODES: readonly IrMode[] = VALUE_AXES;

/** One spectrum, as a record writes it. */
export interface IrSpectrumRecord extends Omit<
  IrSpectrum,
  'wavenumber' | 'excludeFromDomain' | (typeof VALUE_AXES)[number]
> {
  /** The wavenumbers, in cm⁻¹, ascending. */
  wavenumber: Array<number | null>;
  /**
   * Absorbance at each wavenumber.
   * @default undefined
   */
  absorbance?: Array<number | null>;
  /**
   * Percent transmittance at each wavenumber.
   * @default undefined
   */
  transmittance?: Array<number | null>;
  /**
   * Intensity at each Raman shift.
   * @default undefined
   */
  intensity?: Array<number | null>;
}

/** A viewer's state, as JSON holds it. */
export interface IrViewerRecord {
  /** The spectra, in the order they were loaded, each with its bands. */
  spectra: IrSpectrumRecord[];
  /** The spectrum the panels acted on, `null` for none. */
  selectedId: string | null;
  /** The window shown, `null` while the chart showed what fits. */
  domain: IrDomain | null;
  /** How the spectra were read, the technique included. */
  settings: IrSettings;
}

/**
 * Write a viewer's state down, to be opened again.
 * @param state - The state, as the viewer's handle gives it.
 * @returns The record, which `JSON.stringify` writes whole.
 */
export function irViewerRecord(state: IrState): IrViewerRecord {
  const spectra: IrSpectrumRecord[] = [];
  for (const spectrum of state.data.spectra) {
    const {
      wavenumber,
      absorbance,
      transmittance,
      intensity,
      excludeFromDomain,
      ...rest
    } = spectrum;
    const record: IrSpectrumRecord = {
      ...rest,
      wavenumber: numberList(wavenumber),
    };
    if (absorbance) record.absorbance = numberList(absorbance);
    if (transmittance) record.transmittance = numberList(transmittance);
    if (intensity) record.intensity = numberList(intensity);
    spectra.push(record);
  }
  const { selectedId, domain } = state.view;
  return { spectra, selectedId, domain, settings: { ...state.settings } };
}

/**
 * Read a record written by {@link irViewerRecord} back into the state a
 * viewer's handle takes.
 * @param value - The record, from anywhere.
 * @returns The state, its `settings.technique` saying which viewer it is for.
 * @throws {Error} When it is no record of a viewer's state.
 */
export function readIrViewerRecord(
  value: unknown,
): PartialIrState & { settings: Partial<IrSettings> } {
  if (!isPlainRecord(value) || !Array.isArray(value.spectra)) {
    throw new Error('This holds no spectra to open.');
  }
  const spectra: IrSpectrum[] = [];
  for (const item of value.spectra) spectra.push(readSpectrum(item));
  const ids = new Set(spectra.map((spectrum) => spectrum.id));
  const { selectedId, domain, settings } = value;
  return {
    data: { spectra },
    view: {
      selectedId:
        typeof selectedId === 'string' && ids.has(selectedId)
          ? selectedId
          : (spectra[0]?.id ?? null),
      domain: readDomain(domain),
    },
    settings: readSettings(settings),
  };
}

function numberList(values: Float64Array): Array<number | null> {
  const list = new Array<number | null>(values.length);
  for (let index = 0; index < values.length; index++) {
    const number = values[index] as number;
    list[index] = Number.isFinite(number) ? number : null;
  }
  return list;
}

function readNumbers(value: unknown, length?: number): Float64Array {
  if (
    !Array.isArray(value) ||
    (length !== undefined && value.length !== length)
  ) {
    throw new Error('A spectrum of this record does not hold together.');
  }
  const numbers = new Float64Array(value.length);
  for (let index = 0; index < value.length; index++) {
    const item: unknown = value[index];
    if (item !== null && typeof item !== 'number') {
      throw new Error(
        'A spectrum of this record holds something not a number.',
      );
    }
    numbers[index] = item ?? Number.NaN;
  }
  return numbers;
}

function readSpectrum(value: unknown): IrSpectrum {
  if (
    !isPlainRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.name !== 'string' ||
    typeof value.color !== 'string'
  ) {
    throw new Error('A spectrum of this record is not named.');
  }
  const wavenumber = readNumbers(value.wavenumber);
  const spectrum: IrSpectrum = {
    id: value.id,
    name: value.name,
    color: value.color,
    wavenumber,
    meta: readMeta(value.meta),
    origin: readOrigin(value.origin),
    visible: value.visible !== false,
  };
  for (const axis of VALUE_AXES) {
    if (value[axis] !== undefined) {
      spectrum[axis] = readNumbers(value[axis], wavenumber.length);
    }
  }
  if (Array.isArray(value.bands)) {
    spectrum.bands = readBands(value.bands, value.id);
    if (value.bandsByHand === true) spectrum.bandsByHand = true;
  }
  return spectrum;
}

function readBands(value: readonly unknown[], spectrumId: string): IrBand[] {
  const bands: IrBand[] = [];
  for (const item of value) {
    if (
      !isPlainRecord(item) ||
      typeof item.wavenumber !== 'number' ||
      (item.strength !== 'w' && item.strength !== 'm' && item.strength !== 'S')
    ) {
      continue;
    }
    const band: IrBand = {
      spectrumId,
      wavenumber: item.wavenumber,
      strength: item.strength,
    };
    for (const axis of VALUE_AXES) {
      const number = item[axis];
      if (typeof number === 'number') band[axis] = number;
    }
    bands.push(band);
  }
  return bands;
}

function readMeta(value: unknown): IrMeta | null {
  if (!isPlainRecord(value) || !Array.isArray(value.fields)) return null;
  const fields: IrMeta['fields'] = [];
  for (const field of value.fields) {
    if (
      isPlainRecord(field) &&
      typeof field.label === 'string' &&
      typeof field.value === 'string'
    ) {
      fields.push({ label: field.label, value: field.value });
    }
  }
  return {
    title: typeof value.title === 'string' ? value.title : null,
    fields,
  };
}

function readOrigin(value: unknown): IrOrigin {
  const formats = ['jcamp', 'spc', 'text', 'wdf', 'calculated'];
  const origin: IrOrigin = { format: 'text' };
  if (!isPlainRecord(value)) return origin;
  if (typeof value.format === 'string' && formats.includes(value.format)) {
    origin.format = value.format as IrOrigin['format'];
  }
  if (typeof value.fileName === 'string') origin.fileName = value.fileName;
  if (Number.isSafeInteger(value.blockIndex)) {
    origin.blockIndex = value.blockIndex as number;
  }
  if (isMode(value.recorded)) origin.recorded = value.recorded;
  return origin;
}

function isMode(value: unknown): value is IrMode {
  return MODES.includes(value as IrMode);
}

function readDomain(value: unknown): IrDomain | null {
  if (!isPlainRecord(value)) return null;
  const { x, y } = value;
  if (!isPair(x) || !isPair(y)) return null;
  const domain: IrDomain = { x: [x[0], x[1]], y: [y[0], y[1]] };
  return isIrWindow(domain) ? domain : null;
}

function isPair(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  );
}

function readSettings(value: unknown): Partial<IrSettings> {
  const settings: Partial<IrSettings> = {};
  if (!isPlainRecord(value)) return settings;
  if (IR_TECHNIQUES.includes(value.technique as IrTechnique)) {
    settings.technique = value.technique as IrTechnique;
  }
  if (isMode(value.mode)) settings.mode = value.mode;
  for (const key of ['pickBands', 'showAssignments'] as const) {
    if (typeof value[key] === 'boolean') settings[key] = value[key];
  }
  for (const key of ['labelLimit', 'assignmentTolerance'] as const) {
    if (typeof value[key] === 'number') settings[key] = value[key];
  }
  if (isPlainRecord(value.picking)) {
    const picking: PickBandsOptions = {};
    for (const key of [
      'from',
      'to',
      'minRelativeHeight',
      'minPeakWidth',
      'limit',
    ] as const) {
      const number = value.picking[key];
      if (typeof number === 'number' && Number.isFinite(number)) {
        picking[key] = number;
      }
    }
    settings.picking = picking;
  }
  return settings;
}
