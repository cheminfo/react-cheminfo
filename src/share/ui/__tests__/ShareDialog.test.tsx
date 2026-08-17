import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { ShareVocabulary } from '../../core/index.ts';
import { integerParam } from '../../core/index.ts';
import { ShareDialog } from '../ShareDialog.tsx';

const PARAMS = { count: integerParam({ min: 1, max: 100, default: null }) };

const VOCABULARY: ShareVocabulary<typeof PARAMS> = {
  parts: [
    {
      key: 'menu',
      label: 'The other sets',
      description: 'The capsules that walk from one set to the next.',
    },
    {
      key: 'hints',
      label: 'Hints',
      description: 'The hint ladder, revealed one rung at a time.',
      hiddenByDefault: true,
    },
    {
      key: 'answers',
      label: 'Give up and see the answer',
      description: 'The correction.',
    },
  ],
  params: PARAMS,
};

const BASE = 'https://smiles.cheminfo.org/exercises';

function render(
  props: Partial<Parameters<typeof ShareDialog<typeof PARAMS>>[0]> = {},
): string {
  return renderToStaticMarkup(
    <ShareDialog
      isOpen
      usePortal={false}
      onClose={() => undefined}
      vocabulary={VOCABULARY}
      title="Exercises"
      baseUrl={BASE}
      search=""
      {...props}
    />,
  );
}

test('the dialog opens framed, on the parts a host page has no use for', () => {
  const html = render({ search: 'set=alkanes' });

  expect(html).toContain('Share or embed');
  expect(html).toContain(`${BASE}?set=alkanes&amp;embed=1&amp;hide=hints`);
});

test('a page already running a configuration opens on that one', () => {
  const html = render({ search: '?embed=0&hide=menu' });

  expect(html).toContain(`${BASE}?hide=menu`);
  expect(html).not.toContain('embed=1');
  expect(html).not.toContain('hide=hints');
});

test('a hide key this version does not know is ignored', () => {
  const html = render({ search: 'hide=diagram' });

  expect(html).toContain(`${BASE}?embed=1&amp;hide=hints`);
  expect(html).not.toContain('diagram');
});

test('a number a link carries beyond the maximum is clamped', () => {
  const html = render({ search: 'count=4000' });

  expect(html).toContain(`${BASE}?count=100`);
  expect(html).not.toContain('count=4000');
});

test('every part is offered, worded positively, with what hiding it does', () => {
  const html = render();
  const boxes = html.match(/type="checkbox"/g) ?? [];

  expect(boxes).toHaveLength(4);
  expect(html).toContain('Show on the page');
  expect(html).toContain('The other sets');
  expect(html).toContain('The capsules that walk from one set to the next.');
  expect(html).toContain('Give up and see the answer');
});

test('a vocabulary with no part to switch off offers no list', () => {
  const html = render({ vocabulary: { parts: [], params: PARAMS } });

  expect(html).not.toContain('Show on the page');
  expect(html).toContain('Layout');
});

test('the frame is named, sized, and loads the link', () => {
  const html = render({
    frameTitle: 'SMILES — Exercises',
    frameHeight: 800,
  });

  expect(html).toContain('title=&quot;SMILES — Exercises&quot;');
  expect(html).toContain('height=&quot;800&quot;');
  expect(html).toContain('width=&quot;100%&quot;');
});

test('the query and the fragment of the address it is given are dropped', () => {
  const html = render({
    baseUrl: `${BASE}?old=1#step-3`,
    search: 'set=amines',
  });

  expect(html).toContain(`${BASE}?set=amines&amp;embed=1`);
  expect(html).not.toContain('old=1');
  expect(html).not.toContain('step-3');
});

test('the extra section is handed the draft the dialog holds', () => {
  const html = render({
    search: 'hide=menu',
    children: (draft) => (
      <span>{`embed:${String(draft.config.embed)} count:${String(draft.config.params.count)}`}</span>
    ),
  });

  expect(html).toContain('<span>embed:false count:null</span>');
});

test('a section given as markup is rendered as it is', () => {
  const html = render({ children: <p>Pick the exercises</p> });

  expect(html).toContain('<p>Pick the exercises</p>');
});

test('a closed dialog holds no draft, so nothing survives into the next opening', () => {
  const html = render({ isOpen: false, search: 'hide=menu' });

  expect(html).not.toContain('Share or embed');
  expect(html).not.toContain('type="checkbox"');
  expect(html).not.toContain(BASE);
});
