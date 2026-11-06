import type { CreditEntry, CreditId } from '../../credits/core/credits.ts';

/** Where someone works, named and linked after what they do. */
export interface Organisation {
  /** Its name, as it writes it. */
  name: string;
  /** Its home page. */
  href: string;
}

/** What one of the family's people does for every site that lists them. */
export type FamilyRole = 'coordinates' | 'design' | 'interface' | 'tooling';

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

/** One line of the list under "Provided by" or "Who made it". */
export interface TeamMember {
  /** Their name, as they write it. */
  name: string;
  /**
   * What the site says they did.
   * @default undefined
   */
  role?: string;
  /**
   * Where they did it, drawn at `{organisation}` in the role.
   * @default undefined
   */
  organisation?: Organisation;
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

/** Someone who maintains what a site made with others runs on. */
export interface FamilyMaintainer {
  /** Their name, as they write it. */
  name: string;
  /** Where they do it. */
  organisation: Organisation;
  /** The works they maintain, named on a site crediting them. */
  maintains: readonly CreditId[];
  /**
   * Whether they maintain the tooling every site is built with, which lists
   * them whatever the site credits.
   * @default false
   */
  tooling?: boolean;
}

/** One line of the list under "Who maintains what it runs on". */
export interface MaintainerLine {
  /** Their name, as they write it. */
  name: string;
  /** Where they do it. */
  organisation: Organisation;
  /** The credited works they maintain, by name. */
  works: readonly string[];
  /** Whether they maintain the tooling this site is built with. */
  tooling: boolean;
}

/** Who coordinates the family, and whose line is the family's on most sites. */
export const COORDINATOR = 'Luc Patiny';

const ZAKODIUM: Organisation = {
  name: 'Zakodium',
  href: 'https://www.zakodium.com',
};

/**
 * The people every About lists first, in this order: who had the idea and
 * coordinates, who maintains the design library, who maintains the tooling.
 */
export const FAMILY_PEOPLE: readonly FamilyPerson[] = [
  { name: COORDINATOR, role: 'coordinates' },
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

/** Who maintains what a site made with others runs on, in the order listed. */
export const FAMILY_MAINTAINERS: readonly FamilyMaintainer[] = [
  {
    name: 'Daniel Kostro',
    organisation: ZAKODIUM,
    maintains: ['react-science'],
  },
  {
    name: 'Michaël Zasso',
    organisation: ZAKODIUM,
    maintains: ['openchemlib', 'react-ocl', 'react-science'],
    tooling: true,
  },
];

/**
 * Whether a site was made with somebody besides the family's coordinator. Only
 * then would the people keeping its libraries going read as its authors, so
 * only then do they leave the list of who made it.
 * @param named - The people and contributors the site names.
 * @param leads - The people whose work the site is.
 * @returns True when anyone else is named with a role.
 */
export function isMadeWithOthers(
  named: readonly AboutTeamEntry[],
  leads: readonly AboutTeamEntry[] = [],
): boolean {
  return (
    leads.length > 0 ||
    named.some(
      (person) => person.role !== undefined && person.name !== COORDINATOR,
    )
  );
}

/**
 * The list under the names. On a site made with others it is who made it, in
 * the order the site names them. Otherwise it is the family's people, each on a
 * site where they apply.
 * @param named - The people and contributors the site names.
 * @param borrowed - The works the site credits.
 * @param leads - The people whose work the site is, listed first.
 * @returns The list, in order.
 */
export function aboutTeam(
  named: readonly AboutTeamEntry[],
  borrowed: readonly CreditEntry[],
  leads: readonly AboutTeamEntry[] = [],
): TeamMember[] {
  if (isMadeWithOthers(named, leads)) return makers(named, leads);
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
  return team;
}

/**
 * The list under "Who maintains what it runs on", on a site made with others:
 * each maintainer where the site credits their work, and for the tooling.
 * @param named - The people and contributors the site names.
 * @param borrowed - The works the site credits.
 * @param leads - The people whose work the site is.
 * @returns The list, in order, empty on a site with no such section.
 */
export function aboutMaintainers(
  named: readonly AboutTeamEntry[],
  borrowed: readonly CreditEntry[],
  leads: readonly AboutTeamEntry[] = [],
): MaintainerLine[] {
  if (!isMadeWithOthers(named, leads)) return [];
  const credited = new Map(borrowed.map((entry) => [entry.id, entry.name]));
  const lines: MaintainerLine[] = [];
  for (const maintainer of FAMILY_MAINTAINERS) {
    const { name, organisation, maintains, tooling = false } = maintainer;
    const works: string[] = [];
    for (const id of maintains) {
      const work = credited.get(id);
      if (work !== undefined) works.push(work);
    }
    if (works.length > 0 || tooling) {
      lines.push({ name, organisation, works, tooling });
    }
  }
  return lines;
}

function makers(
  named: readonly AboutTeamEntry[],
  leads: readonly AboutTeamEntry[],
): TeamMember[] {
  const team: TeamMember[] = [...leads];
  if (leads.length === 0) {
    team.push({
      name: COORDINATOR,
      family: { role: 'coordinates', works: [] },
    });
  } else if (!named.some(isCoordinatorWithRole)) {
    team.push({ name: COORDINATOR, family: { role: 'interface', works: [] } });
  }
  for (const person of named) {
    if (person.role === undefined) continue;
    if (team.some((member) => member.name === person.name)) continue;
    team.push(person);
  }
  return team;
}

function isCoordinatorWithRole(person: AboutTeamEntry): boolean {
  return person.name === COORDINATOR && person.role !== undefined;
}

/** A person a site names, as the list reads them. */
interface AboutTeamEntry {
  name: string;
  role?: string;
  organisation?: Organisation;
}
