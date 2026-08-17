import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ExerciseActions } from '../ExerciseActions.tsx';

function noop(): void {
  // a static render never clicks
}

test('a tool gets only the buttons it passes a handler for', () => {
  const html = renderToStaticMarkup(<ExerciseActions onCheck={noop} />);

  expect(html).toContain('Check');
  expect(html).not.toContain('Reveal hint');
  expect(html).not.toContain('Reveal solution');
  expect(html).not.toContain('Reset');
});

test('the four standard buttons keep their order, extras come after', () => {
  const html = renderToStaticMarkup(
    <ExerciseActions
      onCheck={noop}
      onRevealHint={noop}
      hintsRevealed={1}
      hintCount={3}
      onToggleSolution={noop}
      onReset={noop}
    >
      <span>Show 3D</span>
    </ExerciseActions>,
  );

  expect(html.indexOf('Check')).toBeLessThan(html.indexOf('Reveal hint'));
  expect(html.indexOf('Reveal hint')).toBeLessThan(
    html.indexOf('Reveal solution'),
  );
  expect(html.indexOf('Reveal solution')).toBeLessThan(html.indexOf('Reset'));
  expect(html.indexOf('Reset')).toBeLessThan(html.indexOf('Show 3D'));
  expect(html).toContain('Reveal hint (1/3)');
});

test('the solution button offers to undo what is on screen', () => {
  const hidden = renderToStaticMarkup(
    <ExerciseActions onToggleSolution={noop} />,
  );
  const shown = renderToStaticMarkup(
    <ExerciseActions onToggleSolution={noop} showSolution />,
  );

  expect(hidden).toContain('Reveal solution');
  expect(hidden).toContain('bp6-icon-key');
  expect(shown).toContain('Hide solution');
  expect(shown).toContain('bp6-icon-eye-off');
});

test('an exercise with no hint at all still counts honestly', () => {
  const html = renderToStaticMarkup(
    <ExerciseActions onRevealHint={noop} checkLabel="Check my regex" />,
  );

  expect(html).toContain('Reveal hint (0/0)');
  expect(html).toContain('disabled=""');
  expect(html).not.toContain('Check my regex');
});

test('checking is dead while there is nothing to grade', () => {
  const html = renderToStaticMarkup(
    <ExerciseActions onCheck={noop} checkDisabled checkLabel="Check" />,
  );

  expect(html).toContain('disabled=""');
});
