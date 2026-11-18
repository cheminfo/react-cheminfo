/**
 * Crystal structures: a CIF read, its asymmetric unit expanded by the space
 * group, and the cell turned into whole, symmetry-independent molecules with
 * Cartesian coordinates — or into the network a salt, a mineral or a metal is.
 *
 * Its own door because it carries the 230 space groups and a CIF reader, which
 * a page that never opens a crystal must not download. It loads neither React
 * nor openchemlib nor molstar, so a Node batch reading a whole database imports
 * it as it is.
 */

export * from './crystal/core/index.ts';
