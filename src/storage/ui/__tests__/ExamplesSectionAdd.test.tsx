// @vitest-environment jsdom
/**
 * An example added to a view holding several goes beside what is on screen,
 * asking nothing, with the site's own words on the button when it has some.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { ExamplesSection } from '../ExamplesSection.tsx';

beforeEach(() => {
  mountRoot();
});

afterEach(() => {
  unmountRoot();
  vi.unstubAllGlobals();
});

const EXAMPLES = [
  { id: 'taxol', name: 'Taxol', description: 'The last two steps' },
  { id: 'aspirin', name: 'Aspirin', description: 'One step' },
];

test('the plus adds that example and opens nothing, even where opening asks first', () => {
  const added: string[] = [];
  const onOpen = vi.fn();
  act(() => {
    root.render(
      <ExamplesSection
        examples={EXAMPLES}
        onOpen={onOpen}
        onAdd={(example) => {
          added.push(example.id);
        }}
        addLabel="Add this plate beside the others"
        openLabel="Show this plate alone"
        confirmOpen={() => 'Replace the plates on screen?'}
      />,
    );
  });
  const add = host.querySelector<HTMLButtonElement>(
    '[aria-label="Add Aspirin to what is on screen"]',
  );

  expect(add?.title).toBe('Add this plate beside the others');
  expect(host.querySelector('.folder-panel__open')?.getAttribute('title')).toBe(
    'Show this plate alone',
  );

  act(() => {
    add?.click();
  });

  expect(added).toStrictEqual(['aspirin']);
  expect(onOpen).not.toHaveBeenCalled();
  expect(document.body.textContent).not.toContain(
    'Replace the plates on screen?',
  );
});
