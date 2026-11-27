/**
 * The route tables and the page shell the seo tests read, each written once.
 */

import type { RouteMeta } from '../routes.ts';

/** A conformer site: its home page and its About. */
export const CONFORMER_ROUTES: RouteMeta[] = [
  { path: '/', title: 'Conformers in 3D', description: 'The home page.' },
  { path: '/about', title: 'About', description: 'What it computes.' },
];

/** A plain site: home and About. */
export const HOME_ROUTES: RouteMeta[] = [
  { path: '/', title: 'Home', description: 'The home page.' },
  { path: '/about', title: 'About', description: 'What it computes.' },
];

/** A site with a section whose addresses all fall under one entry. */
export const SECTION_ROUTES: RouteMeta[] = [
  { path: '/', title: 'Home', description: 'The home page.' },
  {
    path: '/molecules',
    title: 'The ligands',
    description: 'Every chemical component.',
    prefix: true,
  },
  { path: '/molecules/hem', title: 'HEM', description: 'One ligand.' },
];

/** The 2D-to-3D tool, with titles and descriptions of real length. */
export const THREE_D_ROUTES: RouteMeta[] = [
  {
    path: '/',
    title: '2D to 3D — conformers from a drawn structure',
    description: 'Draw a structure and turn it into 3D conformers.',
  },
  {
    path: '/about',
    title: 'About the browser conformer generator',
    description: 'What this tool computes, and how to cite it.',
  },
];

/** A built page, with both of its markers. */
export const PAGE_SHELL = [
  '<!doctype html>',
  '<html lang="en">',
  '  <head>',
  '    <meta charset="utf-8" />',
  '    <!--cheminfo:head-->',
  '  </head>',
  '  <body><div id="root"></div><!--cheminfo:body--></body>',
  '</html>',
].join('\n');
