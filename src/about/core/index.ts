export type { AboutContent, ResolvedAbout } from './about.ts';
export { aboutProblems, resolveAbout } from './about.ts';
export type { AboutPerson, AffiliationRow } from './affiliations.ts';
export { affiliationProblems, affiliationRows } from './affiliations.ts';
export type { ProviderEntry, ProviderId } from './providers.ts';
export { PROVIDERS, providers } from './providers.ts';
export type {
  FamilyMaintainer,
  FamilyPerson,
  FamilyRole,
  MaintainerLine,
  Organisation,
  TeamMember,
} from './team.ts';
export {
  COORDINATOR,
  FAMILY_MAINTAINERS,
  FAMILY_PEOPLE,
  aboutMaintainers,
  aboutTeam,
  isMadeWithOthers,
} from './team.ts';
