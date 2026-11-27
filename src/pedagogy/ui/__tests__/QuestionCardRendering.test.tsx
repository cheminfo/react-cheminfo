// @vitest-environment jsdom
/**
 * What a tool changes in the card: a field that offers its answers, and the
 * tag beside the question's number.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import { SiteLanguage } from '../../../language/ui/SiteLanguage.tsx';
import type { AttemptStore } from '../../core/attempts.ts';
import { createAttemptStore } from '../../core/attempts.ts';
import type { SeriesTool } from '../../core/series.ts';
import type { QuestionRendering } from '../QuestionCard.tsx';
import { QuestionCard } from '../QuestionCard.tsx';

import type { Ion } from './seriesFixture.ts';
import { ELECTRONS, IONS, SIGNS } from './seriesFixture.ts';

let store: AttemptStore;
const SODIUM = IONS[0] as Ion;
const IRON = IONS[2] as Ion;

beforeEach(() => {
  store = createAttemptStore({ key: 'test' });
  mountRoot();
});

afterEach(() => {
  unmountRoot();
  vi.unstubAllGlobals();
});

function render(
  tool: SeriesTool<Ion>,
  question: Ion,
  tag?: QuestionRendering<Ion>['tag'],
): void {
  act(() => {
    root.render(
      <QuestionCard
        tool={tool}
        question={question}
        store={store}
        storageKey={`${tool.id}/7/${question.formula}`}
        number={2}
        total={5}
        prompt={(ion) => <p>Which is {ion.name}?</p>}
        tag={tag}
      />,
    );
  });
}

function button(text: string): HTMLButtonElement {
  for (const candidate of host.querySelectorAll('button')) {
    if (candidate.textContent?.startsWith(text)) return candidate;
  }
  throw new Error(`no button "${text}"`);
}

test('a question that offers its answers is answered by a pick, and checked like a box', () => {
  render(SIGNS, SODIUM);
  const [cation, anion] =
    host.querySelectorAll<HTMLButtonElement>('[role="radio"]');

  act(() => {
    anion?.click();
  });
  act(() => {
    button('Check').click();
  });

  expect(store.attemptFor('signs/7/Na+').answers).toStrictEqual({
    sign: 'anion',
  });
  expect(host.textContent).toContain('anion, expected cation');

  act(() => {
    cation?.click();
  });
  act(() => {
    cation?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
  });

  expect(store.attemptFor('signs/7/Na+').status).toBe('solved');
  expect(host.textContent).toContain('Without a hint.');
});

test('a tool can say what the tag reads, in the colour of the level', () => {
  render(ELECTRONS, IRON, (ion) => (ion.charge > 1 ? 'Bachelor' : null));
  const tag = host.querySelector('.series-question__meta .bp6-tag');

  expect(tag?.textContent).toBe('Bachelor');
  expect(tag?.className).toContain('bp6-intent-warning');

  render(ELECTRONS, SODIUM, (ion) => (ion.charge > 1 ? 'Bachelor' : null));

  expect(host.querySelector('.series-question__meta')?.textContent).toBe(
    'Question 2 of 5',
  );
});

test('a French page names the level in French', async () => {
  await CHROME_CATALOG.load('fr');
  act(() => {
    root.render(
      <SiteLanguage value="fr">
        <QuestionCard
          tool={ELECTRONS}
          question={SODIUM}
          store={store}
          storageKey="electrons/7/Na+"
          number={2}
          total={5}
          prompt={(ion) => <p>Combien d’électrons a {ion.name} ?</p>}
        />
      </SiteLanguage>,
    );
  });

  expect(host.querySelector('.series-question__meta')?.textContent).toBe(
    'Question 2 sur 5débutant',
  );
});
