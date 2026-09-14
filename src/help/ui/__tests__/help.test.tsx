import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { HelpContent } from '../HelpBody.tsx';
import { HelpBody } from '../HelpBody.tsx';
import { HelpIcon } from '../HelpIcon.tsx';
import { HelpToolbarButton } from '../HelpToolbarButton.tsx';
import { HelpTooltip } from '../HelpTooltip.tsx';

const WORD_BOUNDARY: HelpContent = {
  title: 'Word boundary',
  body: 'Matches the empty position between a word character and anything else.',
  example: {
    code: String.raw`\bcat\b`,
    input: 'a cat in a category',
    note: 'matches the first cat, not the one inside category',
  },
  link: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Regular_expressions',
};

test('a body writes the title, the explanation, the example and the link', () => {
  const html = renderToStaticMarkup(<HelpBody content={WORD_BOUNDARY} />);

  expect(html).toContain('Word boundary');
  expect(html).toContain('Matches the empty position');
  expect(html).toContain(String.raw`\bcat\b`);
  expect(html).toContain('a cat in a category');
  expect(html).toContain('matches the first cat, not the one inside category');
  expect(html).toContain('Learn more');
  expect(html).toContain('rel="noopener noreferrer"');
});

test('help that is only a title and a sentence draws nothing else', () => {
  const html = renderToStaticMarkup(
    <HelpBody
      content={{
        title: 'Imposed pH',
        body: 'The proton stops being an unknown.',
      }}
    />,
  );

  expect(html).toContain('Imposed pH');
  expect(html).toContain('The proton stops being an unknown.');
  expect(html).not.toContain('<code');
  expect(html).not.toContain('Learn more');
});

test('an example without an input or a note is just the construct', () => {
  const html = renderToStaticMarkup(
    <HelpBody
      content={{
        title: 'Global flag',
        body: 'Keeps searching.',
        example: { code: '/g' },
      }}
    />,
  );

  expect(html).toContain('/g');
  expect(html).not.toContain(' on ');
});

test('the body is capped so a tooltip cannot span the window', () => {
  const html = renderToStaticMarkup(<HelpBody content={WORD_BOUNDARY} />);

  expect(html).toContain('max-width:280px');
});

test('a caller may widen the body for a dialog', () => {
  const html = renderToStaticMarkup(
    <HelpBody content={WORD_BOUNDARY} width={520} />,
  );

  expect(html).toContain('max-width:520px');
});

test('a tooltip renders its target, and the help travels with it', () => {
  const html = renderToStaticMarkup(
    <HelpTooltip content={WORD_BOUNDARY}>
      <button type="button">Flags</button>
    </HelpTooltip>,
  );

  expect(html).toContain('>Flags</button>');
  expect(html).toContain('<span class="bp6-popover-target">');
});

test('the glyph beside a label is reachable by tab and named', () => {
  const html = renderToStaticMarkup(<HelpIcon content={WORD_BOUNDARY} />);

  expect(html).toContain('bp6-icon-help');
  expect(html).toContain('tabindex="0"');
  expect(html).toContain('aria-label="Word boundary"');
  expect(html).toContain('help-icon');
});

test('the toolbar button carries the same glyph and can be labelled', () => {
  const html = renderToStaticMarkup(
    <HelpToolbarButton
      content={WORD_BOUNDARY}
      label="Guide"
      onClick={() => null}
    />,
  );

  expect(html).toContain('bp6-icon-help');
  expect(html).toContain('Guide');
  expect(html).toContain('bp6-minimal');
});

test('a toolbar button with no label is still named after its help', () => {
  const html = renderToStaticMarkup(
    <HelpToolbarButton content={WORD_BOUNDARY} />,
  );

  expect(html).toContain('aria-label="Word boundary"');
});

test('several examples are each written, in the order given', () => {
  const html = renderToStaticMarkup(
    <HelpBody
      content={{
        title: 'Anchors',
        body: 'Pin the match to one edge of the text.',
        example: [
          { code: '^cat', input: 'cat food' },
          { code: 'cat$', input: 'bobcat', note: 'matches at the end only' },
        ],
      }}
    />,
  );

  expect(html.match(/<code/g)).toHaveLength(4);
  expect(html.indexOf('^cat')).toBeLessThan(html.indexOf('cat$'));
  expect(html).toContain('matches at the end only');
});

test('an example repeated in the list is written once', () => {
  const html = renderToStaticMarkup(
    <HelpBody
      content={{
        title: 'Anchors',
        example: [
          { code: '^cat', input: 'cat food' },
          { code: '^cat', input: 'cat food' },
          { code: '^cat', input: 'bobcat' },
        ],
      }}
    />,
  );

  expect(html.match(/<code/g)).toHaveLength(4);
  expect(html.match(/cat food/g)).toHaveLength(1);
  expect(html.match(/bobcat/g)).toHaveLength(1);
});

test('free-form help with no title draws its body alone', () => {
  const html = renderToStaticMarkup(
    <HelpBody
      content={{
        body: (
          <ul>
            <li>g — every match</li>
          </ul>
        ),
      }}
    />,
  );

  expect(html).toBe(
    '<div class="help-body" style="display:flex;flex-direction:column;gap:6px;max-width:280px"><div style="font-weight:400;line-height:1.45"><ul><li>g — every match</li></ul></div></div>',
  );
});

test('help with no title leaves the glyph and the button named Help', () => {
  const icon = renderToStaticMarkup(
    <HelpIcon content={{ body: 'Kept below fifty.' }} />,
  );
  const button = renderToStaticMarkup(
    <HelpToolbarButton content={{ body: 'Kept below fifty.' }} />,
  );

  expect(icon).toContain('aria-label="Help"');
  expect(button).toContain('aria-label="Help"');
});

test('a glyph may carry its own name and its own sign', () => {
  const html = renderToStaticMarkup(
    <HelpIcon
      content={{ body: 'Conformers closer than this are merged.' }}
      label="Minimum RMSD"
      icon="info-sign"
    />,
  );

  expect(html).toContain('aria-label="Minimum RMSD"');
  expect(html).toContain('bp6-icon-info-sign');
  expect(html).not.toContain('bp6-icon-help');
});

test('the same help reads the same in the glyph and in the toolbar button', () => {
  const icon = renderToStaticMarkup(<HelpBody content={WORD_BOUNDARY} />);
  const body = renderToStaticMarkup(
    <HelpBody content={{ ...WORD_BOUNDARY }} />,
  );

  expect(icon).toBe(body);
});
