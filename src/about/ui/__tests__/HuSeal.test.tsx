import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';

import { providers } from '../../core/providers.ts';
import { AboutProvidedBy } from '../AboutProvidedBy.tsx';
import { HuSeal } from '../HuSeal.tsx';

test('the seal is one labelled image in the university blue, holes kept open', () => {
  const html = renderToStaticMarkup(
    <HuSeal label="HU Berlin — Humboldt-Universität zu Berlin" />,
  );

  expect(html.match(/role="img"/g)).toHaveLength(1);
  expect(html).toContain(
    'aria-label="HU Berlin — Humboldt-Universität zu Berlin"',
  );
  expect(html.match(/<path /g)).toHaveLength(50);
  expect(html).toContain('<g fill="#165096">');
  expect(html).toContain('<g fill-rule="evenodd">');
});

test('the university is named in type until its seal has loaded', async () => {
  const label = 'aria-label="HU Berlin — Humboldt-Universität zu Berlin"';
  const drawn = () =>
    renderToStaticMarkup(
      <AboutProvidedBy
        people={[]}
        team={[]}
        providers={providers(['hu-berlin'])}
      />,
    );
  const first = drawn();

  expect(first).toContain('<span>HU Berlin</span>');
  expect(first).not.toContain(label);

  await vi.waitFor(() => {
    expect(drawn()).toContain(label);
  });
});
