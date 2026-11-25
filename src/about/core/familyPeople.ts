import type { FamilyMaintainer, FamilyPerson, Organisation } from './team.ts';

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
