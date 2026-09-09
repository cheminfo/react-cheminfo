import type { ScaleSettings } from '../core/settings.ts';
import { SCALE_METHODS } from '../core/settingsProblems.ts';

/** The stretch of x a scaling is measured over. */
export type ScaleRange = NonNullable<ScaleSettings['range']>;

/** What each scaling is called, in the order the processor's switch lists them. */
const METHOD_LABELS: Readonly<Record<string, string>> = {
  min: 'Smallest value',
  max: 'Largest value',
  minmax: 'Both ends',
  integration: 'Integral',
};

/** The method menu: leaving the spectra alone, then the only four that run. */
export const SCALE_METHOD_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: '', label: 'None — every spectrum is left as it is' },
  ...SCALE_METHODS.map((method) => ({
    value: method,
    label: METHOD_LABELS[method] ?? method,
  })),
];

/**
 * The method menu with whatever the settings actually hold in it.
 *
 * A menu that does not carry the held value draws the first option instead, so
 * a settings object saying `MAX` — or saying something the processor throws on
 * — would be shown as `None` while meaning nothing of the sort. The held
 * spelling is added rather than corrected, because the panel reports what the
 * settings say and never quietly rewrites them.
 * @param method - What the settings hold.
 * @returns The None prompt and the four scalings, plus the held one when the
 * menu lacks it.
 */
export function scaleMethodOptions(
  method: string | undefined,
): ReadonlyArray<{ value: string; label: string }> {
  if (method === undefined || method === '') return SCALE_METHOD_OPTIONS;
  for (const option of SCALE_METHOD_OPTIONS) {
    if (option.value === method) return SCALE_METHOD_OPTIONS;
  }
  const known = METHOD_LABELS[method.toLowerCase()];
  return [
    ...SCALE_METHOD_OPTIONS,
    {
      value: method,
      label:
        known === undefined
          ? `${method} — not a scaling the processor knows`
          : `${method} — ${known}`,
    },
  ];
}

/**
 * The scaling with another method, or with none when `None` is picked.
 *
 * A picked `None` drops the key rather than writing an empty string, because
 * the processor reads any falsy method as "do not scale" and a key that is
 * there but empty reads, to anyone looking at the settings, as a mistake.
 * @param value - How every spectrum is scaled.
 * @param method - What was picked.
 * @returns A new scaling.
 */
export function withScaleMethod(
  value: ScaleSettings,
  method: string,
): ScaleSettings {
  const next: ScaleSettings = { ...value };
  if (method === '') delete next.method;
  else next.method = method;
  return next;
}

/**
 * The scaling with another reference, or with none when the box was emptied.
 * @param value - How every spectrum is scaled.
 * @param targetID - What was picked or typed.
 * @returns A new scaling.
 */
export function withScaleTarget(
  value: ScaleSettings,
  targetID: string,
): ScaleSettings {
  const next: ScaleSettings = { ...value };
  if (targetID === '') delete next.targetID;
  else next.targetID = targetID;
  return next;
}

/**
 * The scaling measured over another window, dropping what is not set.
 * @param value - How every spectrum is scaled.
 * @param patch - The bounds that changed.
 * @returns A new scaling, without a window at all once every bound is cleared.
 */
export function withScaleRange(
  value: ScaleSettings,
  patch: ScaleRange,
): ScaleSettings {
  const merged: ScaleRange = { ...value.range, ...patch };
  const range: ScaleRange = {};
  if (merged.from !== undefined) range.from = merged.from;
  if (merged.to !== undefined) range.to = merged.to;
  if (merged.fromIndex !== undefined) range.fromIndex = merged.fromIndex;
  if (merged.toIndex !== undefined) range.toIndex = merged.toIndex;

  const next: ScaleSettings = { ...value };
  if (Object.keys(range).length === 0) delete next.range;
  else next.range = range;
  return next;
}
