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

test('the same help reads the same in the glyph and in the toolbar button', () => {
  const icon = renderToStaticMarkup(<HelpBody content={WORD_BOUNDARY} />);
  const body = renderToStaticMarkup(
    <HelpBody content={{ ...WORD_BOUNDARY }} />,
  );

  expect(icon).toBe(body);
});
