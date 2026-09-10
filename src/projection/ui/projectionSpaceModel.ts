/**
 * The one number the cloud sets differently from the map.
 */

/**
 * How many samples a group needs before it is given a shell.
 *
 * One more than the map asks for, and for the same reason the map asks for
 * three: a shape fitted to the fewest points that can define it describes those
 * points and not the group they came from. Three samples lie on a plane
 * however they are arranged, so three is the number at which a shell is
 * arithmetic rather than a finding.
 */
export const MINIMUM_SHELL_POINTS = 4;
