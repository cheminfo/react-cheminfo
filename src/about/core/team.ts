import type { CreditEntry, CreditId } from '../../credits/core/credits.ts';

/** Where someone works, named and linked after what they do. */
export interface Organisation {
  /** Its name, as it writes it. */
  name: string;
  /** Its home page. */
  href: string;
}

/** What one of the family's people does for every site that lists them. */
export type FamilyRole = 'coordinates' | 'design' | 'tooling';

/** Someone the About of every site lists, or of every site using their work. */
export interface FamilyPerson {
  /** Their name, as they write it. */
  name: string;
  /** What they do. */
  role: FamilyRole;
  /**
   * Where they do it.
   * @default undefined
   */
  organisation?: Organisation;
  /**
   * The credited work a site uses for them to be listed.
   * @default undefined — listed on every site
   */
  when?: CreditId;
  /**
   * Works they maintain, named in their role on a site crediting them.
   * @default []
   */
  maintains?: readonly CreditId[];
}

/** One line of the list under "Provided by". */
export interface TeamMember {
  /** Their name, as they write it. */
  name: string;
  /**
   * What the site says they did.
   * @default undefined
   */
  role?: string;
  /**
   * What one of the family's people does here, and where.
   * @default undefined
   */
  family?: {
    role: FamilyRole;
    organisation?: Organisation;
    /** The credited works they maintain, by name. */
    works: readonly string[];
  };
}

const ZAKODIUM: Organisation = {
  name: 'Zakodium',
  href: 'https://www.zakodium.com',
};

/**
 * The people every About lists first, in this order: who had the idea and
 * coordinates, who maintains the design library, who maintains the tooling.
 */
export const FAMILY_PEOPLE: readonly FamilyPerson[] = [
  { name: 'Luc Patiny', role: 'coordinates' },
  {
    name: 'Daniel Kostro',
    role: 'design',
    organisation: ZAKODIUM,
    when: 'react-science',
  },
  {
    name: 'Michaël Zasso',
    role: 'tooling',
    organisation: ZAKODIUM,
    maintains: ['openchemlib'],
  },
];

/**
 * The list under "Provided by": the family's people, each on a site where
 * they apply, then whoever else the site names with a role.
 * @param named - The people and contributors the site names.
 * @param borrowed - The works the site credits.
 * @returns The list, in order.
 */
export function aboutTeam(
  named: readonly AboutTeamEntry[],
  borrowed: readonly CreditEntry[],
): TeamMember[] {
  const credited = new Map(borrowed.map((entry) => [entry.id, entry.name]));
  const team: TeamMember[] = [];
  for (const person of FAMILY_PEOPLE) {
    const { name, role, organisation, when, maintains = [] } = person;
    if (when !== undefined && !credited.has(when)) continue;
    const works: string[] = [];
    for (const id of maintains) {
      const work = credited.get(id);
      if (work !== undefined) works.push(work);
    }
    team.push({
      name,
      family:
        organisation === undefined
          ? { role, works }
          : { role, organisation, works },
    });
  }
  for (const person of named) {
    if (person.role === undefined) continue;
    if (team.some((member) => member.name === person.name)) continue;
    team.push({ name: person.name, role: person.role });
  }
  return team;
}

/**
 * Whether a site lists someone as one of the family's people, whose role every
 * site shows alike: always, or because it credits the work they maintain.
 * @param name - The name.
 * @param credited - The ids of the works the site credits.
 * @returns True when the family's line is the one the site shows.
 */
export function isFamilyPerson(
  name: string,
  credited: readonly string[],
): boolean {
  return FAMILY_PEOPLE.some(
    (person) =>
      person.name === name &&
      (person.when === undefined || credited.includes(person.when)),
  );
}

/** A person a site names, as the list reads them. */
interface AboutTeamEntry {
  name: string;
  role?: string;
}
