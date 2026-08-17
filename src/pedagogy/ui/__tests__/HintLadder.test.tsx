import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { GlossaryProvider } from '../GlossaryProvider.tsx';
import { HintLadder } from '../HintLadder.tsx';

const HINTS = [
  String.raw`Word boundaries are written [[anchor|\b]].`,
  'Wrap the word in one at each end.',
];

const GLOSSARY = {
  anchor: {
    title: 'Anchor',
    summary: 'A position, not a character.',
    examples: [],
  },
};

function noop(): void {
  // the reveal is exercised by the label, not by clicking in a static render
}

test('only the hints asked for are shown, in order', () => {
  const html = renderToStaticMarkup(
    <HintLadder hints={HINTS} revealed={1} onReveal={noop} />,
  );

  expect(html).toContain('Word boundaries are written');
  expect(html).not.toContain('Wrap the word in one at each end.');
  expect(html).toContain('Reveal hint (1/2)');
});

test('the button dies once the ladder is exhausted', () => {
  const html = renderToStaticMarkup(
    <HintLadder hints={HINTS} revealed={2} onReveal={noop} />,
  );

  expect(html).toContain('Reveal hint (2/2)');
  expect(html).toContain('disabled=""');
  expect(html).toContain('Wrap the word in one at each end.');
});

test('a count from a shorter or longer ladder is read as one of its ends', () => {
  const over = renderToStaticMarkup(
    <HintLadder hints={HINTS} revealed={9} onReveal={noop} />,
  );
  const under = renderToStaticMarkup(
    <HintLadder hints={HINTS} revealed={-3} onReveal={noop} />,
  );
  const fractional = renderToStaticMarkup(
    <HintLadder hints={HINTS} revealed={1.8} onReveal={noop} />,
  );

  expect(over).toContain('Reveal hint (2/2)');
  expect(under).toContain('Reveal hint (0/2)');
  expect(fractional).toContain('Reveal hint (1/2)');
  expect(fractional).not.toContain('Wrap the word in one at each end.');
});

test('nothing is rendered while no hint is open and none can be', () => {
  expect(renderToStaticMarkup(<HintLadder hints={HINTS} revealed={0} />)).toBe(
    '',
  );
  expect(
    renderToStaticMarkup(
      <HintLadder hints={[]} revealed={0} onReveal={noop} />,
    ),
  ).toBe('');
});

test('a hint links its jargon exactly like the statement above it', () => {
  const html = renderToStaticMarkup(
    <GlossaryProvider glossary={GLOSSARY}>
      <HintLadder hints={HINTS} revealed={1} title="Where to look" />
    </GlossaryProvider>,
  );

  expect(html).toContain('class="glossary-term"');
  expect(html).toContain(String.raw`>\b</span>`);
  expect(html).toContain('Where to look');
  expect(html).not.toContain('Reveal hint');
});
