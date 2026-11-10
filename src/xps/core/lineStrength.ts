/**
 * Which core levels an element is actually identified by.
 *
 * Ranking candidate levels by how near they sit to a peak and by nothing else
 * gives answers no analyst would accept: the reference table holds 1185 levels
 * over about 1500 eV, so somewhere within a couple of eV of any peak there is
 * always a minor line of some rare element. A cellulose C 1s at 285.9 eV comes
 * back as terbium 4p3/2, which is 0.14 eV away, while carbon — 1.9 eV away and
 * the only sensible answer — is pushed down the list.
 *
 * What separates them is not the energy but the line. A photoelectron spectrum
 * is read from the strong lines: the 1s of the light elements, and the
 * j = l + ½ component of the outermost strong subshell for the rest. Those are
 * the lines a handbook tabulates and a survey scan is assigned from. A 4p or a
 * 4s is a real level with a real binding energy and a cross-section one or two
 * orders of magnitude smaller — present in the table, and not what anybody
 * identifies an element by.
 *
 * So candidates are ordered by strength first and by distance within it. This
 * is a statement about which lines are strong, not about which elements are
 * plausible: nothing here knows that cellulose is unlikely to contain astatine,
 * and the weaker candidates are still offered, just below the ones that are
 * worth reading first.
 */

/**
 * The lines an element is normally identified by: the 1s of the light
 * elements, and the strong spin-orbit component of the outermost subshell for
 * the heavier ones. The unsplit forms are here because the table writes some
 * levels without a j.
 */
const PRINCIPAL_LINES = new Set([
  '1s',
  '2p3/2',
  '2p',
  '3d5/2',
  '3d',
  '4f7/2',
  '4f',
]);

/**
 * The weaker partner of a principal line, and the s and d levels still strong
 * enough to be quoted. Read second, and often read as confirmation of a
 * principal line rather than on their own.
 */
const SECONDARY_LINES = new Set([
  '2p1/2',
  '3d3/2',
  '4f5/2',
  '2s',
  '3p3/2',
  '3p',
  '4d5/2',
  '4d',
]);

/** How strong a line is, lowest first: 0 principal, 1 secondary, 2 minor. */
export type LineStrength = 0 | 1 | 2;

/**
 * How strongly a core level shows in a photoelectron spectrum.
 *
 * Three tiers rather than a cross-section, because a cross-section depends on
 * the photon energy and this does not: the ordering of the lines of one element
 * is the same on an Al Kα and a Mg Kα source, and the ordering is all that is
 * being asked for.
 * @param orbital - The level as the reference table writes it: `1s`, `2p3/2`.
 * @returns `0` for a principal line, `1` for a secondary one, `2` otherwise.
 */
export function lineStrength(orbital: string): LineStrength {
  if (PRINCIPAL_LINES.has(orbital)) return 0;
  if (SECONDARY_LINES.has(orbital)) return 1;
  return 2;
}
