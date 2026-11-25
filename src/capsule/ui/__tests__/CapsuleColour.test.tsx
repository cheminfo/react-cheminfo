import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { FAMILY_TOKEN_VALUES } from '../../../tokens/core/familyTokens.ts';
import { CapsuleFilter } from '../CapsuleFilter.tsx';

/** The ink readable on a light ground: the family's text colour. */
const INK = FAMILY_TOKEN_VALUES['--text'];

test('a capsule given a colour of its own carries it and its ink, and no intent', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter
      multiple
      options={[
        {
          value: 'flasks',
          label: 'Flasks',
          color: '#2563eb',
          intent: 'danger',
        },
        { value: 'adapters', label: 'Adapters', color: '#fde047' },
        { value: 'other', label: 'Other' },
      ]}
      values={['flasks']}
      onChange={() => null}
    />,
  );
  // A coloured capsule writes its style first, before aria-pressed.
  const capsules = html.split(/<span (?=[^>]*aria-pressed)/).slice(1);

  expect(capsules).toHaveLength(3);
  expect(capsules[0]).toContain('colored-capsule');
  expect(capsules[0]).toContain('--capsule:#2563eb;--capsule-ink:#ffffff');
  expect(capsules[0]).not.toContain('bp6-intent-');
  expect(capsules[0]).not.toContain('bp6-minimal');
  expect(capsules[1]).toContain(`--capsule:#fde047;--capsule-ink:${INK}`);
  expect(capsules[1]).toContain('bp6-minimal');
  expect(capsules[2]).not.toContain('colored-capsule');
  expect(capsules[2]).not.toContain('style=');
});
