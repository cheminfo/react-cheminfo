import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { TutorialStep } from '../../core/types.ts';
import { TutorialStepStrip } from '../TutorialStepStrip.tsx';
import { TUTORIAL_LEVEL_COLOURS } from '../tutorialLevels.ts';

const STEPS: TutorialStep[] = [
  {
    id: 'literals',
    title: 'Literal characters',
    description: 'They match themselves.',
    level: 'beginner',
  },
  {
    id: 'classes',
    title: 'Character classes',
    description: 'One of a set.',
    level: 'beginner',
  },
  {
    id: 'lookahead',
    title: 'Lookahead',
    description: 'Match without consuming.',
    level: 'advanced',
  },
];

function noop(): void {
  // a static render never clicks
}

test('the three levels keep the palette every tool shares', () => {
  expect(TUTORIAL_LEVEL_COLOURS).toStrictEqual({
    beginner: { background: '#d1fae5', activeBackground: '#6ee7b7' },
    intermediate: { background: '#fef3c7', activeBackground: '#fcd34d' },
    advanced: { background: '#fce7f3', activeBackground: '#f9a8d4' },
  });
});

test('a level with no step gets no strip, and the numbers stay global', () => {
  const html = renderToStaticMarkup(
    <TutorialStepStrip steps={STEPS} activeIndex={0} onSelect={noop} />,
  );

  expect(html).toContain('background:#d1fae5');
  expect(html).toContain('background:#fce7f3');
  expect(html).not.toContain('background:#fef3c7');
  expect(html).toContain('aria-label="Step 3: Lookahead"');
  expect(html).toContain('>3</button>');
});

test('the open step is darker, bordered and marked as the current one', () => {
  const html = renderToStaticMarkup(
    <TutorialStepStrip steps={STEPS} activeIndex={1} onSelect={noop} />,
  );

  expect(html).toContain('background:#6ee7b7');
  expect(html).toContain('border:2px solid #1c2127');
  expect(html).toContain('aria-current="step"');
  expect(html).toContain('Step 2 of 3');
});

test('a position outside the tour is read as one of its ends', () => {
  const past = renderToStaticMarkup(
    <TutorialStepStrip steps={STEPS} activeIndex={99} onSelect={noop} />,
  );
  const before = renderToStaticMarkup(
    <TutorialStepStrip
      steps={STEPS}
      activeIndex={Number.NaN}
      onSelect={noop}
    />,
  );

  expect(past).toContain('Step 3 of 3');
  expect(before).toContain('Step 1 of 3');
});

test('the pager dies at each end and can be left out entirely', () => {
  const first = renderToStaticMarkup(
    <TutorialStepStrip steps={STEPS} activeIndex={0} onSelect={noop} />,
  );
  const last = renderToStaticMarkup(
    <TutorialStepStrip steps={STEPS} activeIndex={2} onSelect={noop} />,
  );
  const none = renderToStaticMarkup(
    <TutorialStepStrip
      steps={STEPS}
      activeIndex={0}
      onSelect={noop}
      pager={false}
    />,
  );

  expect(first).toContain('Previous');
  expect(first.indexOf('disabled=""')).toBeLessThan(first.indexOf('Next'));
  expect(last).toContain('Next');
  expect(none).not.toContain('Previous');
  expect(none).not.toContain('Step 1 of 3');
});

test('every number is the same square, so the strips line up as columns', () => {
  const steps: TutorialStep[] = [];
  for (let index = 0; index < 12; index++) {
    steps.push({
      id: `step-${index}`,
      title: `Step ${index + 1}`,
      description: 'A step.',
      level: index < 8 ? 'beginner' : 'advanced',
    });
  }

  const html = renderToStaticMarkup(
    <TutorialStepStrip steps={steps} activeIndex={9} onSelect={noop} />,
  );

  const widths = html.match(/width:28px/g);

  expect(widths).toHaveLength(12);
  expect(html).toContain('>12</button>');
  expect(html).not.toContain('min-width');
});

test('a tour whose steps carry no id is still numbered and clickable', () => {
  const html = renderToStaticMarkup(
    <TutorialStepStrip
      steps={[
        { title: 'Literal characters', level: 'beginner' },
        { title: 'Lookahead', level: 'advanced' },
      ]}
      activeIndex={1}
      onSelect={noop}
    />,
  );

  expect(html).toContain('aria-label="Step 1: Literal characters"');
  expect(html).toContain('aria-label="Step 2: Lookahead"');
  expect(html).toContain('Step 2 of 2');
});

test('a strip is named by the tool, and the pager may carry a word', () => {
  const html = renderToStaticMarkup(
    <TutorialStepStrip
      steps={STEPS}
      activeIndex={0}
      onSelect={noop}
      levelLabels={{ beginner: 'Basics', advanced: 'Advanced features' }}
      pagerHint="or use ↑ / ↓"
    />,
  );

  expect(html).toContain('Basics');
  expect(html).toContain('Advanced features');
  expect(html).toContain('or use ↑ / ↓');
  expect(html).not.toContain('>beginner<');
});
