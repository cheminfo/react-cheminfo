/**
 * A molstar colour theme showing the polar ends of a molecule: red over the
 * positive end — cations, and the hydrogens bonded to nitrogen or oxygen —
 * blue over the negative end — anions, nitrogen and oxygen — and grey over the
 * rest.
 */

import type { Location } from 'molstar/lib/mol-model/location.js';
import type {
  ElementIndex,
  Structure,
} from 'molstar/lib/mol-model/structure.js';
import { StructureElement, Unit } from 'molstar/lib/mol-model/structure.js';
import { ColorThemeCategory } from 'molstar/lib/mol-theme/color/categories.js';
import type { ColorTheme } from 'molstar/lib/mol-theme/color.js';
import type { ThemeDataContext } from 'molstar/lib/mol-theme/theme.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition.js';

import { SURFACE_CHARGE_COLORS } from '../core/settings.ts';

/** Registry name of the theme. */
export const POLARITY_COLOR_THEME = 'molecule3d-polarity';

const POLARITY_PARAMS = {};

type PolarityParams = typeof POLARITY_PARAMS;

const POSITIVE = Color.fromHexStyle(SURFACE_CHARGE_COLORS.positive);
const NEGATIVE = Color.fromHexStyle(SURFACE_CHARGE_COLORS.negative);
const NEUTRAL = Color.fromHexStyle(SURFACE_CHARGE_COLORS.neutral);

/** The theme provider, registered on a plugin by {@link registerPolarityTheme}. */
export const polarityColorThemeProvider: ColorTheme.Provider<
  PolarityParams,
  typeof POLARITY_COLOR_THEME
> = {
  name: POLARITY_COLOR_THEME,
  label: 'Polarity',
  category: ColorThemeCategory.Atom,
  factory: polarityColorTheme,
  getParams: () => POLARITY_PARAMS,
  defaultValues: PD.getDefaultValues(POLARITY_PARAMS),
  isApplicable: (context: ThemeDataContext) => context.structure !== undefined,
};

/**
 * Make the theme available to a plugin. Idempotent.
 * @param registry - The plugin's structure colour theme registry.
 */
export function registerPolarityTheme(registry: ColorTheme.Registry): void {
  if (!registry.has(polarityColorThemeProvider)) {
    registry.add(polarityColorThemeProvider);
  }
}

function polarityColorTheme(
  context: ThemeDataContext,
  props: PD.Values<PolarityParams>,
): ColorTheme<PolarityParams> {
  const signs =
    context.structure === undefined
      ? new Int8Array(0)
      : atomSigns(context.structure);
  function color(location: Location): Color {
    if (!StructureElement.Location.is(location)) return NEUTRAL;
    const sign = signs[location.element];
    if (sign === 1) return POSITIVE;
    if (sign === -1) return NEGATIVE;
    return NEUTRAL;
  }
  return {
    factory: polarityColorTheme,
    granularity: 'group',
    preferSmoothing: true,
    color,
    props,
    description: 'Positive end in red, negative end in blue, the rest in grey.',
  };
}

/**
 * The sign of every atom's partial charge, as far as the structure tells it.
 * A formal charge decides first; otherwise nitrogen and oxygen are negative
 * and a hydrogen bonded to either is positive.
 * @param structure - The atoms, with their bonds and formal charges.
 * @returns 1, -1 or 0 at the model index of every atom.
 */
function atomSigns(structure: Structure): Int8Array {
  let size = 0;
  for (const unit of structure.units) {
    size = Math.max(size, unit.model.atomicHierarchy.atoms._rowCount);
  }
  const signs = new Int8Array(size);
  for (const unit of structure.units) {
    if (!Unit.isAtomic(unit)) continue;
    const { elements, model, bonds } = unit;
    const { type_symbol: symbols, pdbx_formal_charge: charges } =
      model.atomicHierarchy.atoms;
    const { offset, b } = bonds;
    for (let index = 0; index < elements.length; index++) {
      const element = elements[index] as ElementIndex;
      const charge = charges.value(element);
      if (charge !== 0) {
        signs[element] = charge > 0 ? 1 : -1;
        continue;
      }
      const symbol = symbols.value(element);
      if (symbol === 'N' || symbol === 'O') {
        signs[element] = -1;
        continue;
      }
      if (symbol !== 'H') continue;
      const end = offset[index + 1] ?? 0;
      for (let bond = offset[index] ?? end; bond < end; bond++) {
        const neighbour = symbols.value(elements[b[bond] ?? 0] as ElementIndex);
        if (neighbour === 'N' || neighbour === 'O') {
          signs[element] = 1;
          break;
        }
      }
    }
  }
  return signs;
}
