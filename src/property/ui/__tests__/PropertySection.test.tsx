import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PropertyNumbers, PropertySection } from '../PropertySection.tsx';

test('a table of numbers stands in a group of properties, under its heading, its note under it', () => {
  const html = renderToStaticMarkup(
    <PropertySection title="Values" note="Stored units.">
      <PropertyNumbers
        columns={[
          { key: 'channel', label: 'Channel' },
          { key: 'mean', label: 'Mean' },
        ]}
      >
        <tr>
          <th scope="row">Grey</th>
          <td>42</td>
        </tr>
      </PropertyNumbers>
    </PropertySection>,
  );

  expect(html).toBe(
    '<section class="properties"><h3 class="properties__title">Values</h3><table class="properties__table properties__table--numbers"><thead><tr><th scope="col">Channel</th><th scope="col">Mean</th></tr></thead><tbody><tr><th scope="row">Grey</th><td>42</td></tr></tbody></table><p class="properties__note">Stored units.</p></section>',
  );
});

test('a group without a heading or a note is its content alone', () => {
  expect(
    renderToStaticMarkup(
      <PropertySection>
        <p>panel</p>
      </PropertySection>,
    ),
  ).toBe('<section class="properties"><p>panel</p></section>');
});
