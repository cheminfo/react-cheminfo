import type { ProviderEntry, ProviderId } from './providers.ts';
import type { Organisation } from './team.ts';

/** One person who made a site. */
export interface AboutPerson {
  /** Their name, as they write it. */
  name: string;
  /**
   * What they contributed, in one line. `{organisation}` in it is where the
   * link to their organisation goes.
   * @default undefined
   */
  role?: string;
  /**
   * Where they did it, which needs `{organisation}` in the role.
   * @default undefined
   */
  organisation?: Organisation;
  /**
   * The institution of `providedBy` they belong to, whose row their name is
   * drawn in. A site naming a single institution leaves it out.
   * @default undefined
   */
  affiliation?: ProviderId;
}

/** One row of an About: an institution, and the people who belong to it. */
export interface AffiliationRow {
  /** The institution, absent from the row of people placed at none. */
  provider?: ProviderEntry;
  /** Who belongs to it, in the order the site names them. */
  people: AboutPerson[];
}

/**
 * Sort the people an About names into a row per institution. On a site naming
 * one institution everybody belongs to it unless they say otherwise, and
 * nobody is ever dropped: those placed nowhere get a last row without a logo.
 * @param people - Who the site names, in display order.
 * @param providers - The institutions it names, in display order.
 * @returns The rows, one per institution.
 */
export function affiliationRows(
  people: readonly AboutPerson[],
  providers: readonly ProviderEntry[],
): AffiliationRow[] {
  const rows: AffiliationRow[] = providers.map((provider) => ({
    provider,
    people: [],
  }));
  const unplaced: AboutPerson[] = [];
  for (const person of people) {
    const row =
      person.affiliation === undefined && rows.length === 1
        ? rows[0]
        : rows.find(({ provider }) => provider?.id === person.affiliation);
    if (row === undefined) {
      unplaced.push(person);
    } else {
      row.people.push(person);
    }
  }
  if (unplaced.length > 0) rows.push({ people: unplaced });
  return rows;
}

/**
 * What is wrong with where a record places its people.
 * @param people - Who the site names.
 * @param providedBy - The institutions it names.
 * @returns One message per person out of place, empty when none is.
 */
export function affiliationProblems(
  people: readonly AboutPerson[],
  providedBy: readonly ProviderId[],
): string[] {
  const problems: string[] = [];
  for (const { name, affiliation } of people) {
    if (affiliation === undefined) {
      if (providedBy.length > 1) {
        problems.push(
          `${name} has no \`affiliation\`: a site naming several institutions says which one each person belongs to.`,
        );
      }
    } else if (!providedBy.includes(affiliation)) {
      problems.push(
        `${name} belongs to \`${affiliation}\`, which is not in \`providedBy\`: the row their name is drawn in does not exist.`,
      );
    }
  }
  return problems;
}
