import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { ShareVocabulary } from '../../core/index.ts';
import { openSealedAddress } from '../../core/index.ts';
import { SealedLinkRefused } from '../SealedLinkRefused.tsx';
import { ShareDialog } from '../ShareDialog.tsx';

const VOCABULARY: ShareVocabulary = {
  parts: [{ key: 'answers', label: 'The answers', description: 'The list.' }],
  params: {},
};

function render(): string {
  return renderToStaticMarkup(
    <ShareDialog
      isOpen
      usePortal={false}
      onClose={() => undefined}
      vocabulary={VOCABULARY}
      title="Exercises"
      baseUrl="https://surge.cheminfo.org/exercises"
      search="formulas=C4H10O"
    />,
  );
}

// In this order: opening sealed addresses is what a page does once, at startup,
// and the dialog follows what the page does.
test('a site that opens no sealed link offers none', () => {
  const html = render();

  expect(html).not.toContain('Protect this link');
});

test('a site that opens sealed links offers to protect the link', async () => {
  await openSealedAddress(undefined);

  const html = render();

  expect(html).toContain('Protect this link');
  expect(html).toContain(
    'The class can neither read nor change what the link sets up',
  );
});

test('a dialog opened on a preset keeps the switch within reach', () => {
  const html = renderToStaticMarkup(
    <ShareDialog
      isOpen
      usePortal={false}
      onClose={() => undefined}
      vocabulary={VOCABULARY}
      presets={[
        {
          key: 'figure',
          label: 'The figure',
          description: 'The figure alone, nothing to answer.',
          hidden: ['answers'],
        },
      ]}
      defaultPreset="figure"
      title="Exercises"
      baseUrl="https://surge.cheminfo.org/exercises"
      search="formulas=C4H10O"
    />,
  );

  expect(html).toContain('The figure alone, nothing to answer.');
  expect(html).toContain('Protect this link');
});

test('a refused link says so, and opens the tool without it', () => {
  const html = renderToStaticMarkup(<SealedLinkRefused href="/exercises" />);

  expect(html).toContain('This link cannot be opened');
  expect(html).toContain('Ask for the link again.');
  expect(html).toContain('href="/exercises"');
  expect(html).toContain('Open the tool without it');
});
