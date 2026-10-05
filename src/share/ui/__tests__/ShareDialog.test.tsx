import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { SharePreset, ShareVocabulary } from '../../core/index.ts';
import { integerParam } from '../../core/index.ts';
import { ShareDialog } from '../ShareDialog.tsx';

const PARAMS = { count: integerParam({ min: 1, max: 100, default: null }) };

const VOCABULARY: ShareVocabulary<typeof PARAMS> = {
  parts: [
    {
      key: 'tabs',
      label: 'The tab bar',
      description: 'The tabs in the site header.',
      inHeader: true,
    },
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

test('the dialog names the page it is handing out, in its title', () => {
  const html = render();

  // The page was named in a sentence under the buttons, which cost a row of a
  // dialog whose preview wants every one of them.
  expect(html).toContain('Share or embed — Exercises');
  expect(html).not.toContain('A link to');
});

test('every part is offered, worded positively, as a switch saying its state', () => {
  const html = render();
  const boxes = html.match(/type="checkbox"/g) ?? [];

  expect(boxes).toHaveLength(4);
  expect(html).toContain('Show on the page');
  expect(html).toContain('The other sets');
  expect(html).toContain('Give up and see the answer');
  // The state is written in the switch, so a row reads correctly with the
  // heading above it scrolled away.
  expect(html.match(/bp6-switch-inner-text">On</g)).toHaveLength(4);
  expect(html.match(/bp6-switch-inner-text">Off</g)).toHaveLength(4);
});

test('a switch is named after the part, not after its own On and Off', () => {
  const html = render();

  // Blueprint wraps the input in a label of its own carrying the On/Off text,
  // and a wrapping label beats an `htmlFor` one: without the explicit link the
  // switch is named "OnOff" and a screen reader never says what is on.
  const named = html.match(/aria-labelledby="[^"]+-label"/g) ?? [];

  expect(named).toHaveLength(4);

  const [, labelId] =
    /id="([^"]+-label)"[^>]*>The other sets</.exec(html) ?? [];

  expect(labelId).toBeDefined();
  expect(html).toContain(`aria-labelledby="${labelId}"`);
});

test('a part says what switching it off does, under its own label', () => {
  const html = render();

  expect(html).toContain(
    '<p class="share-part__description">The capsules that walk from one set to the next.</p>',
  );
  expect(html).not.toContain('aria-label="The other sets"');
});

test('a dialog short on room puts the descriptions behind a help glyph', () => {
  const html = render({ partDescriptions: 'help' });

  expect(html).toContain(
    'aria-label="The other sets" class="bp6-icon bp6-icon-help help-icon"',
  );
  expect(html).not.toContain('share-part__description');
});

test('an embedded draft does not offer the parts of the header it drops', () => {
  const html = render();
  const boxes = html.match(/type="checkbox"/g) ?? [];

  expect(boxes).toHaveLength(4);
  expect(html).not.toContain('The tab bar');
});

test('the full site offers the parts of its header', () => {
  const html = render({ search: 'hide=tabs,menu' });
  const boxes = html.match(/type="checkbox"/g) ?? [];

  expect(boxes).toHaveLength(5);
  expect(html).toContain('The tab bar');
  expect(html).toContain(`${BASE}?hide=tabs,menu`);
});

test('embedding keeps what the draft says about a header part, without writing it', () => {
  const html = render({
    search: 'embed=1&hide=tabs,menu',
    children: (draft) => (
      <span>{`hidden:${draft.config.hidden.join(',')}`}</span>
    ),
  });

  expect(html).toContain('<span>hidden:tabs,menu</span>');
  expect(html).toContain(`${BASE}?embed=1&amp;hide=menu`);
  expect(html).not.toContain('hide=tabs');
  expect(html).not.toContain('The tab bar');
});

test('a vocabulary with no part to switch off offers no list', () => {
  const html = render({ vocabulary: { parts: [], params: PARAMS } });

  expect(html).not.toContain('Show on the page');
  expect(html).toContain('Layout');
});

test('the frame is handed over rather than printed', () => {
  const html = render({ frameTitle: 'SMILES — Exercises', frameHeight: 800 });

  expect(html).toContain('Copy the iframe');
  expect(html).not.toContain('&lt;iframe');
  // The name the frame carries is the one the preview opens under.
  expect(html).toContain('title="SMILES — Exercises"');
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

const PRESETS: ReadonlyArray<SharePreset<typeof PARAMS>> = [
  {
    key: 'practice',
    label: 'Practice set',
    description: 'Ten exercises, with the answers left out.',
    hidden: ['menu', 'answers'],
    params: { count: 10 },
  },
  {
    key: 'site',
    label: 'Whole site',
    description: 'Every part, header included.',
    embed: false,
  },
];

function tabTitles(html: string): string[] {
  const titles: string[] = [];
  for (const match of html.matchAll(
    /<div[^>]*role="tab"[^>]*>(?<title>[^<]*)<\/div>/g,
  )) {
    const selected = match[0].includes('aria-selected="true"');
    titles.push(`${match.groups?.title ?? ''}${selected ? ' *' : ''}`);
  }
  return titles;
}

test('without presets the dialog has no tabs', () => {
  expect(tabTitles(render())).toStrictEqual([]);
});

test('presets are tabs, followed by a Custom tab holding the boxes', () => {
  const html = render({ presets: PRESETS });
  const boxes = html.match(/type="checkbox"/g) ?? [];

  expect(tabTitles(html)).toStrictEqual([
    'Practice set',
    'Whole site',
    'Custom *',
  ]);
  expect(boxes).toHaveLength(4);
  expect(html).toContain(`${BASE}?embed=1&amp;hide=hints`);
});

test('a page already configured as a preset opens on that preset', () => {
  const html = render({
    presets: PRESETS,
    search: 'embed=1&hide=answers,menu&count=10',
  });

  expect(tabTitles(html)).toStrictEqual([
    'Practice set *',
    'Whole site',
    'Custom',
  ]);
  expect(html).toContain('Ten exercises, with the answers left out.');
  expect(html).not.toContain('type="checkbox"');
  expect(html).toContain(`${BASE}?embed=1&amp;hide=menu,answers&amp;count=10`);
});

test('a page not yet configured opens on the default preset', () => {
  const html = render({ presets: PRESETS, defaultPreset: 'practice' });

  expect(tabTitles(html)).toStrictEqual([
    'Practice set *',
    'Whole site',
    'Custom',
  ]);
  expect(html).toContain(`${BASE}?embed=1&amp;hide=menu,answers&amp;count=10`);
});

test('a configured page keeps its own configuration over the default preset', () => {
  const html = render({
    presets: PRESETS,
    defaultPreset: 'practice',
    search: 'hide=hints',
  });

  expect(tabTitles(html)).toStrictEqual([
    'Practice set',
    'Whole site',
    'Custom *',
  ]);
  expect(html).toContain(`${BASE}?hide=hints`);
});

test('the three things one does with the link come before the options', () => {
  const html = render({ search: 'set=alkanes' });
  const bar = html.indexOf('share-linkbar');
  const panes = html.indexOf('share-dialog__panes');

  expect(bar).toBeGreaterThan(-1);
  expect(panes).toBeGreaterThan(bar);
  expect(html).toContain('Copy the link');
  expect(html).toContain('Open in a new tab');
  expect(html).toContain('Copy the iframe');
  expect(html).not.toContain('share-linkbar__url');
});

test('the preview loads the link the options are writing', () => {
  const html = render({ search: 'set=alkanes' });

  expect(html).toContain(
    `<iframe class="share-preview__frame" src="${BASE}?set=alkanes&amp;embed=1&amp;hide=hints"`,
  );
});

test('a tool whose page is too heavy to load twice switches the preview off', () => {
  const html = render({ preview: false });

  expect(html).not.toContain('share-preview__frame');
  expect(html).toContain('share-dialog__panes--single');
  expect(html).toContain('Show on the page');
});

test('the preview offers the screens the link will be opened on', () => {
  const html = render();

  expect(html).toContain('This window');
  expect(html).toContain('Mobile');
  expect(html).toContain('Laptop');
  expect(html).toContain('HD');
});

test('the preview is drawn as a window of its own, so it never passes for the site', () => {
  const html = render({ search: 'set=alkanes' });
  const label = html.indexOf('share-preview__label');
  const frame = html.indexOf('share-preview__frame');

  expect(label).toBeGreaterThan(-1);
  expect(frame).toBeGreaterThan(label);
  expect(html).toContain('Preview');
  expect(html).toContain('share-preview__chrome');
  expect(html).toContain(
    'smiles.cheminfo.org/exercises?set=alkanes&amp;embed=1&amp;hide=hints',
  );
});

test('a screen is picked by its glyph, which says what it lays the page out at', () => {
  const html = render();

  expect(html).toContain('title="Mobile · 390 × 844"');
  expect(html).toContain('title="HD · 1920 × 1080"');
});
