/**
 * The topics the family's tools are gathered under.
 *
 * A single grid of tiles tells a visitor nothing about which of them is for
 * a first-year student and which is for a research project. The groups are the
 * answer, and they read as a progression: the chemistry a course opens with,
 * the exercises that practise it, then the molecule itself, then what was
 * measured of it, then the work only a project needs — and last the tools that
 * are not chemistry at all.
 */

/** The topics, in the order they are written. */
export type SiteGroupId =
  'basics' | 'practice' | 'structures' | 'spectra' | 'research' | 'computing';

/** One topic the family's tools are gathered under. */
export interface SiteGroup {
  /** The identifier a site names in its `group`. */
  id: SiteGroupId;
  /** The heading the group is written under. */
  label: string;
  /**
   * The line under the heading. It says who the group is for rather than what
   * it contains — the tiles already say that, one tagline each.
   */
  blurb: string;
}

/**
 * Every topic, in the order a menu and a footer write them. A site names one of
 * these in its `group`, and that is the only place the order of the menu is
 * decided; within a topic, sites keep the order they are declared in.
 */
export const SITE_GROUPS: readonly SiteGroup[] = [
  {
    id: 'basics',
    label: 'Chemistry basics',
    blurb: 'Where a course starts, and what you go back to.',
  },
  {
    id: 'practice',
    label: 'Practice',
    blurb:
      'Where a first course is worked through, one graded series at a time.',
  },
  {
    id: 'structures',
    label: 'Structures & notation',
    blurb: 'Draw a molecule, convert it between notations, see it in space.',
  },
  {
    id: 'spectra',
    label: 'Spectra',
    blurb: 'Process a measurement, and work back to the structure behind it.',
  },
  {
    id: 'research',
    label: 'Research & data',
    blurb: 'Specialised work: real datasets, and molecules nobody has made.',
  },
  {
    id: 'computing',
    label: 'Computing & teaching',
    blurb: 'Around the chemistry: build a course, typeset it, parse it.',
  },
];
