import { expect, test } from 'vitest';

import type { RouteMeta } from '../routes.ts';
import { structuredDataScript } from '../structuredData.ts';

const ROUTES: RouteMeta[] = [
  { path: '/', title: 'Conformers in 3D', description: 'The home page.' },
];

const OPTIONS = { site: '3d', routes: ROUTES } as const;

test('the block says what the tool is, and that it is free', () => {
  expect(structuredDataScript(OPTIONS)).toBe(
    `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "3d.cheminfo.org",
  "url": "https://3d.cheminfo.org/",
  "description": "Conformers in 3D from a structure you draw.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Any modern browser",
  "browserRequirements": "Requires JavaScript",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  },
  "isAccessibleForFree": true,
  "publisher": {
    "@type": "Organization",
    "name": "cheminfo"
  }
}
</script>`,
  );
});

test('a site describes itself in its own words, in its own currency', () => {
  const script = structuredDataScript({
    ...OPTIONS,
    category: 'ScienceApplication',
    operatingSystem: 'Any',
    description:
      'Enumerate every constitutional isomer of a molecular formula in the browser.',
    browserRequirements: 'Requires WebAssembly',
    currency: 'USD',
  });

  expect(script).toContain(
    '"description": "Enumerate every constitutional isomer of a molecular formula in the browser."',
  );
  expect(script).toContain('"applicationCategory": "ScienceApplication"');
  expect(script).toContain('"operatingSystem": "Any"');
  expect(script).toContain('"browserRequirements": "Requires WebAssembly"');
  expect(script).toContain('"priceCurrency": "USD"');
  expect(script).toContain('"isAccessibleForFree": true');
});

test('a mounted deployment names the address it answers on', () => {
  expect(
    structuredDataScript({
      ...OPTIONS,
      origin: 'https://learn.cheminfo.org/surge/',
    }),
  ).toContain('"url": "https://learn.cheminfo.org/surge/"');
});

test('the structured data cannot close its own script tag', () => {
  const script = structuredDataScript({
    ...OPTIONS,
    operatingSystem: '</script><script>alert(1)</script>',
  });

  expect(script).not.toContain('<script>alert(1)');
  expect(script).toContain(String.raw`\u003c/script>`);
});
