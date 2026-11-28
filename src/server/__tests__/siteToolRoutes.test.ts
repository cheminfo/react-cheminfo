import type { AppResource, ToolList } from 'cheminfo-mcp-server';
import { expect, test } from 'vitest';

import { OUTSIDE_SITE } from '../../ecosystem/core/__tests__/outsideSite.ts';
import { siteToolRoutes, siteViewUri } from '../siteToolRoutes.ts';

const ADDRESSES = {
  siteUrl: 'https://equilibrium.cheminfo.org/',
  publicUrl: 'https://equilibrium.c6h6.org/',
};

const NO_TOOLS: ToolList<undefined> = [];

const EXAMPLES = [
  {
    question: 'What is the pH of 0.1 M acetic acid?',
    expect: '2.88',
    tools: ['solutionPh'],
  },
];

/**
 * The first view of the routes.
 * @param resources - What the routes are given.
 * @returns The view.
 */
function firstView(resources: unknown): AppResource {
  return (resources as readonly AppResource[])[0] as AppResource;
}

test('a site’s routes are named after its host, framed on its page and open to every origin', () => {
  const options = siteToolRoutes({
    site: 'equilibrium',
    addresses: ADDRESSES,
    version: '1.2.3',
    instructions: 'Acid/base chemistry in water.',
    tools: NO_TOOLS,
    examples: EXAMPLES,
    view: { description: 'The answer drawn by equilibrium.cheminfo.org.' },
  });
  const view = firstView(options.resources);

  expect(options.resources).toHaveLength(1);
  expect(options.name).toBe('equilibrium.cheminfo.org');
  expect(options.version).toBe('1.2.3');
  expect(options.instructions).toBe('Acid/base chemistry in water.');
  expect(options.tools).toBe(NO_TOOLS);
  expect(options.examples).toBe(EXAMPLES);
  expect(options.allowedOrigins).toBe('*');
  expect(view.uri).toBe('ui://equilibrium/page');
  expect(view.name).toBe('equilibrium.cheminfo.org');
  expect(view.description).toBe(
    'The answer drawn by equilibrium.cheminfo.org.',
  );
  expect(view.csp).toStrictEqual({
    frameDomains: [
      'https://equilibrium.c6h6.org',
      'https://equilibrium.cheminfo.org',
    ],
  });
});

test('the name, the view’s address and its height are the site’s to set', () => {
  const options = siteToolRoutes({
    site: 'isomers',
    name: 'surge',
    addresses: {
      siteUrl: 'https://isomers.cheminfo.org/',
      publicUrl: 'https://isomers.cheminfo.org/',
    },
    version: '0.1.0',
    tools: NO_TOOLS,
    view: {
      description: 'The isomers of a formula.',
      uri: 'ui://surge/page',
      height: 700,
    },
    bodyLimit: 4000,
    allowedOrigins: ['https://mcp.cheminfo.org'],
  });
  const view = firstView(options.resources);

  expect(options.resources).toHaveLength(1);
  expect(options.name).toBe('surge');
  expect(options.bodyLimit).toBe(4000);
  expect(options.allowedOrigins).toStrictEqual(['https://mcp.cheminfo.org']);
  expect(view.uri).toBe('ui://surge/page');
  expect(view.name).toBe('isomers.cheminfo.org');
  expect(view.csp).toStrictEqual({
    frameDomains: ['https://isomers.cheminfo.org'],
  });
  expect(view.html).toContain('700');
});

test('a site outside the family names its view after its own record', () => {
  expect(siteViewUri(OUTSIDE_SITE)).toBe('ui://spectra/page');
  expect(siteViewUri('pdb')).toBe('ui://pdb/page');
  expect(siteViewUri('chemcalc')).toBe('ui://chemcalc/page');
  expect(
    siteToolRoutes({
      site: OUTSIDE_SITE,
      addresses: {
        siteUrl: 'https://spectra.cheminfo.org/',
        publicUrl: 'https://spectra.cheminfo.org/',
      },
      version: '1.0.0',
      tools: NO_TOOLS,
      view: { description: 'A predicted spectrum.' },
    }).name,
  ).toBe('spectra.cheminfo.org');
});
