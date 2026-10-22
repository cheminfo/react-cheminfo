/**
 * Atoms and bonds of the displayed molecule emphasised in one colour, for as
 * long as a site keeps pointing at them.
 *
 * Neither of molstar's own markings fits: its hover highlight is erased by the
 * next move of the pointer, and its selection belongs to the measuring tools.
 * This is an overpaint of the model's own representation instead, so it
 * follows the model in every style, survives the hover, and leaves the camera
 * and every other drawing alone.
 *
 * molstar paints an atom and every half-bond leaving it from one element loci,
 * which would tint the C–C bonds of a row that names only C–H ones. So the
 * overpaint has three layers: the atoms, then those half-bonds cleared again,
 * then exactly the bonds the paths name, as bond loci.
 */

import { OrderedSet, SortedArray } from 'molstar/lib/mol-data/int.js';
import type { UnitIndex } from 'molstar/lib/mol-model/structure/structure/element/util.js';
import type { Structure } from 'molstar/lib/mol-model/structure.js';
import {
  Bond,
  StructureElement,
  Unit,
} from 'molstar/lib/mol-model/structure.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects.js';
import type { StateObject } from 'molstar/lib/mol-state/index.js';
import { Overpaint } from 'molstar/lib/mol-theme/overpaint.js';
import type { Color } from 'molstar/lib/mol-util/color/color.js';

import type {
  HighlightedBond,
  Molecule3DHighlight,
} from '../../molecule3d/core/highlight.ts';
import {
  highlightedParts,
  sameHighlights,
} from '../../molecule3d/core/highlight.ts';
import type { AtomReference } from '../../molecule3d/core/measurement.ts';

// Lowercased: they are factories, not constructors.
const elementLoci = StructureElement.Loci;
const bondLoci = Bond.Loci;
const bondLocation = Bond.Location;

/** The loci an overpaint layer of {@link highlightOverpaint} holds. */
type HighlightLoci = StructureElement.Loci | Bond.Loci;

/**
 * The overpaint that emphasises `highlights` on a representation of
 * `structure`: their atoms, and exactly the bonds between consecutive atoms of
 * each path.
 * @param structure - The structure the representation is drawn from.
 * @param highlights - The paths; an atom the structure lacks is skipped.
 * @param color - What they are painted in.
 * @returns The overpaint, empty when no atom is left to paint.
 */
export function highlightOverpaint(
  structure: Structure,
  highlights: readonly Molecule3DHighlight[],
  color: Color,
): Overpaint<HighlightLoci> {
  const { atoms, bonds } = highlightedParts(
    highlights,
    (atom) => unitOf(structure, atom) !== undefined,
  );
  if (atoms.length === 0) return { kind: 'bond-loci', layers: [] };
  const layers: Array<Overpaint.Layer<HighlightLoci>> = [
    { loci: atomsLoci(structure, atoms), color, clear: false },
    { loci: leavingBondsLoci(structure, atoms), color, clear: true },
  ];
  if (bonds.length > 0) {
    layers.push({ loci: pathBondsLoci(structure, bonds), color, clear: false });
  }
  // Not `element-loci`, which molstar would remap layer by layer as atoms, and
  // a bond loci read as atoms is a crash.
  return { kind: 'bond-loci', layers };
}

/**
 * Keeps one representation of the state tree painted with the highlights a
 * site asks for: the one there now, and every one built under the same ref
 * afterwards, so a restyled model or a new conformer comes up already painted.
 */
export class HighlightPainter {
  readonly #plugin: PluginContext;
  readonly #ref: string;
  readonly #unsubscribe: () => void;
  #highlights: readonly Molecule3DHighlight[] = [];
  #color: Color | undefined;

  /**
   * Start following the representation at `representationRef`.
   * @param plugin - The molstar context.
   * @param representationRef - State-tree ref of the representation to paint.
   */
  constructor(plugin: PluginContext, representationRef: string) {
    this.#plugin = plugin;
    this.#ref = representationRef;
    const repaint = (event: { ref: string; obj: StateObject }) => {
      if (event.ref === this.#ref) this.#paint(event.obj);
    };
    const { created, updated } = plugin.state.data.events.object;
    const subscriptions = [
      created.subscribe(repaint),
      updated.subscribe(repaint),
    ];
    this.#unsubscribe = () => {
      for (const subscription of subscriptions) subscription.unsubscribe();
    };
  }

  /**
   * Paint exactly these highlights, in place of the ones painted.
   * @param highlights - The paths; an empty list restores the plain model.
   * @param color - What they are painted in.
   */
  set(highlights: readonly Molecule3DHighlight[], color: Color): void {
    if (color === this.#color && sameHighlights(highlights, this.#highlights)) {
      return;
    }
    this.#highlights = highlights;
    this.#color = color;
    this.#paint(this.#plugin.state.data.cells.get(this.#ref)?.obj);
  }

  /** Stop following the representation. */
  dispose(): void {
    this.#unsubscribe();
  }

  #paint(object: StateObject | undefined): void {
    if (!PluginStateObject.Molecule.Structure.Representation3D.is(object)) {
      return;
    }
    const { repr, sourceData } = object.data;
    const color = this.#color;
    const overpaint =
      color === undefined
        ? Overpaint.Empty
        : highlightOverpaint(sourceData, this.#highlights, color);
    if (
      Overpaint.isEmpty(overpaint) &&
      Overpaint.isEmpty(repr.state.overpaint)
    ) {
      return;
    }
    repr.setState({ overpaint });
    // No commit: the scene keeps its bounds, so the camera is never reframed.
    this.#plugin.canvas3d?.update(repr, true);
  }
}

function unitOf(structure: Structure, atom: AtomReference): Unit | undefined {
  const unit = structure.units[atom.unit];
  if (unit === undefined || atom.element >= unit.elements.length) {
    return undefined;
  }
  return unit;
}

function atomsLoci(
  structure: Structure,
  atoms: readonly AtomReference[],
): StructureElement.Loci {
  const elements: Array<StructureElement.Loci['elements'][number]> = [];
  for (let index = 0; index < structure.units.length; index++) {
    const unit = structure.units[index];
    const indices: number[] = [];
    for (const atom of atoms) {
      if (atom.unit === index) indices.push(atom.element);
    }
    if (unit === undefined || indices.length === 0) continue;
    const sorted = SortedArray.ofUnsortedArray<UnitIndex>(indices);
    elements.push({ unit, indices: OrderedSet.ofSortedArray(sorted) });
  }
  return elementLoci(structure, elements);
}

// Every half-bond leaving the atoms, which an element loci paints as well.
function leavingBondsLoci(
  structure: Structure,
  atoms: readonly AtomReference[],
): Bond.Loci {
  const locations: Bond.Location[] = [];
  const iterator = new Bond.ElementBondIterator();
  for (const atom of atoms) {
    const unit = unitOf(structure, atom);
    if (unit === undefined || !Unit.isAtomic(unit)) continue;
    const index = atom.element as UnitIndex;
    iterator.setElement(structure, unit, index);
    while (iterator.hasNext) {
      const { otherUnit, otherIndex } = iterator.move();
      locations.push(
        bondLocation(structure, unit, index, structure, otherUnit, otherIndex),
      );
    }
  }
  return bondLoci(structure, locations);
}

// molstar draws a bond as two halves, one from each atom.
function pathBondsLoci(
  structure: Structure,
  bonds: readonly HighlightedBond[],
): Bond.Loci {
  const locations: Bond.Location[] = [];
  for (const [first, second] of bonds) {
    const forward = halfBond(structure, first, second);
    const backward = halfBond(structure, second, first);
    if (forward !== undefined && backward !== undefined) {
      locations.push(forward, backward);
    }
  }
  return bondLoci(structure, locations);
}

function halfBond(
  structure: Structure,
  from: AtomReference,
  to: AtomReference,
): Bond.Location | undefined {
  const fromUnit = unitOf(structure, from);
  const toUnit = unitOf(structure, to);
  if (fromUnit === undefined || toUnit === undefined) return undefined;
  const fromIndex = from.element as UnitIndex;
  const toIndex = to.element as UnitIndex;
  return bondLocation(
    structure,
    fromUnit,
    fromIndex,
    structure,
    toUnit,
    toIndex,
  );
}
