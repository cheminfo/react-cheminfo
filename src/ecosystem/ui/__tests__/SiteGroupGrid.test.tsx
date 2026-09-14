import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { SITE_GROUPS } from '../../core/groups.ts';
import { EcosystemLinks } from '../EcosystemLinks.tsx';
import { EcosystemMenu } from '../EcosystemMenu.tsx';

test('the footer and the open menu never write the same heading id twice', () => {
  const html = renderToStaticMarkup(
    <>
      <EcosystemLinks currentSiteId="tex" />
      <EcosystemMenu currentSiteId="tex" />
    </>,
  );

  const ids = [...html.matchAll(/<h3 id="(?<id>[^"]+)"/g)].map(
    (match) => match.groups?.id,
  );

  expect(ids).toHaveLength(SITE_GROUPS.length * 2);
  expect(new Set(ids).size).toBe(SITE_GROUPS.length * 2);
});

test('each topic section is labelled by its own heading', () => {
  const html = renderToStaticMarkup(<EcosystemMenu />);

  const labelled = [...html.matchAll(/aria-labelledby="(?<id>[^"]+)"/g)].map(
    (match) => match.groups?.id,
  );
  const headings = [...html.matchAll(/<h3 id="(?<id>[^"]+)"/g)].map(
    (match) => match.groups?.id,
  );

  expect(labelled).toHaveLength(SITE_GROUPS.length);
  expect(labelled).toStrictEqual(headings);
});

test('every topic says who it is for, in the footer as in the menu', () => {
  const footer = renderToStaticMarkup(<EcosystemLinks />);
  const menu = renderToStaticMarkup(<EcosystemMenu />);

  for (const group of SITE_GROUPS) {
    expect(footer).toContain(`>${group.blurb}</p>`);
    expect(menu).toContain(`>${group.blurb}</p>`);
  }
});
