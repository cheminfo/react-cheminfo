import { STEPS_LAYOUT } from './slideSteps.ts';

/**
 * The layouts the generic slide draws under their own name; any other name
 * the player does not know is drawn as `content`.
 */
export const GENERIC_SLIDE_LAYOUTS: ReadonlySet<string> = new Set([
  'content',
  'title',
  'quote',
  'thanks',
]);

/**
 * Every layout the player draws itself, for any deck on any site: a deck may
 * ask for these without the site registering anything. A site's own layout of
 * the same name replaces the player's.
 */
export const PLAYER_LAYOUTS: ReadonlySet<string> = new Set([
  ...GENERIC_SLIDE_LAYOUTS,
  'section',
  'embed',
  STEPS_LAYOUT,
  'end',
]);
