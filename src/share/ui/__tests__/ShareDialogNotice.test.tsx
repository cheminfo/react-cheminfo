import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { ShareVocabulary } from '../../core/index.ts';
import { ShareDialog } from '../ShareDialog.tsx';

const VOCABULARY: ShareVocabulary = {
  parts: [
    { key: 'files', label: 'The file bar', description: 'Open and Save.' },
  ],
  params: {},
};

const LEFT_OUT = 'This image is on your computer, so a link cannot carry it.';

function render(notice?: string): string {
  return renderToStaticMarkup(
    <ShareDialog
      isOpen
      usePortal={false}
      onClose={() => undefined}
      vocabulary={VOCABULARY}
      title="Workbench"
      baseUrl="https://image.cheminfo.org/"
      search=""
      notice={notice === undefined ? undefined : <p>{notice}</p>}
    />,
  );
}

test('a notice stands first in the options, above the frame switch and the parts, in view as the dialog opens', () => {
  const html = render(LEFT_OUT);
  const options = html.slice(html.indexOf('class="share-dialog__options"'));

  expect([
    options.indexOf(LEFT_OUT) > 0,
    options.indexOf(LEFT_OUT) < options.indexOf('The file bar'),
    options.indexOf('share-dialog__notice') < options.indexOf('bp6-switch'),
    render().includes('share-dialog__notice'),
  ]).toStrictEqual([true, true, true, false]);
});
