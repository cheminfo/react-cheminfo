/**
 * What the pointer rests on, as a line of text.
 *
 * Every drawing our sites make carries a label already — `C1 sp³ σ to H5 (+)`,
 * `C3 along [111]` — but molstar's own UI is not mounted, so nothing shows
 * them. This turns the plugin's hover behaviour into that one string, which the
 * canvas renders itself.
 */

import type { Loci } from 'molstar/lib/mol-model/loci.js';
import { isEmptyLoci, isEveryLoci } from 'molstar/lib/mol-model/loci.js';
import {
  Bond,
  StructureElement,
  StructureProperties,
} from 'molstar/lib/mol-model/structure.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { lociLabel } from 'molstar/lib/mol-theme/label.js';

/**
 * Report whatever the pointer rests on.
 * @param plugin - The molstar context.
 * @param listener - Called with the loci, or `null` when the pointer is over
 * nothing. The pointer over the background reports an empty loci, whose label
 * is the word "Nothing" — a sentence, not an absence — so it arrives as `null`.
 * @returns The unsubscribe function.
 */
export function subscribeHover(
  plugin: PluginContext,
  listener: (loci: Loci | null) => void,
): () => void {
  const subscription = plugin.behaviors.interaction.hover.subscribe((event) => {
    const { loci } = event.current;
    listener(isEmptyLoci(loci) || isEveryLoci(loci) ? null : loci);
  });
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * The one line a loci is worth, in molstar's own words.
 * @param loci - What the pointer is over.
 * @returns The label, stripped of the markup molstar writes into it, or `null`
 * when there is nothing to say.
 */
export function lociText(loci: Loci): string | null {
  if (isEmptyLoci(loci) || isEveryLoci(loci)) return null;
  const label = stripMarkup(lociLabel(loci, { granularity: 'element' }));
  return label === '' ? null : label;
}

/**
 * The atoms a loci holds, in words a reader wants.
 *
 * molstar names one after the row it parsed — `xyz | Model 0 | Instance 1_555 |
 * A | MOL 1 | O [idx 1]` — which is the address of a line in a file we wrote to
 * hand it the atoms, and says nothing a student wants. The element and which
 * atom of the scene it is do: the two hydrogens of water can then be told apart.
 * @param loci - What the pointer rests on: an atom, or the two ends of a bond.
 * @returns `O 1`, `Si 4 — O 8`, or `null` when the loci holds no atom.
 */
export function atomText(loci: Loci): string | null {
  const atoms = StructureElement.Loci.is(loci)
    ? loci
    : Bond.isLoci(loci)
      ? Bond.toStructureElementLoci(loci)
      : null;
  if (atoms === null) return null;
  const names: string[] = [];
  StructureElement.Loci.forEachLocation(atoms, (location) => {
    names.push(
      atomName(
        String(StructureProperties.atom.type_symbol(location)),
        StructureProperties.atom.sourceIndex(location),
      ),
    );
  });
  return names.length === 0 ? null : names.join(' — ');
}

/**
 * What a site calls one atom of its scene.
 *
 * molstar upper-cases an element symbol on its way in, so the atom it hands
 * back from an `Si` it was given is an `SI`, which is not how anybody writes
 * silicon. The number is which atom of the scene it is, counting from one.
 * @param element - Its element symbol, in any case.
 * @param index - Its place in the file the viewer was handed, from zero.
 * @returns `O 1`, `Si 4`.
 */
export function atomName(element: string, index: number): string {
  const symbol =
    element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
  return `${symbol} ${index + 1}`;
}

/**
 * Molstar's label providers return HTML, and a readout is plain text.
 * @param label
 */
function stripMarkup(label: string): string {
  return label
    .replaceAll(/<[^>]*>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll(/\s+/g, ' ')
    .trim();
}
