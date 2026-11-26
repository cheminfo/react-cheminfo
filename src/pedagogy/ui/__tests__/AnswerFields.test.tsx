// @vitest-environment jsdom
import { act, useState } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { AnswerField, Answers } from '../../core/series.ts';
import { AnswerFields } from '../AnswerFields.tsx';
import { GlossaryProvider } from '../GlossaryProvider.tsx';

let host: HTMLDivElement;
let root: Root;
let changes: Array<[string, string]>;
let submits: number;

const FIELDS: readonly AnswerField[] = [
  {
    key: 'electrode',
    label: 'Copper is the',
    choices: [
      { value: 'anode', label: 'anode' },
      { value: 'cathode', label: 'cathode' },
      { value: 'neither', label: 'neither, {{Cu(2+)}} stays' },
    ],
  },
  { key: 'voltage', label: 'Voltage (V)' },
];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  changes = [];
  submits = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

// The parent owns the answers, as `QuestionCard` does.
function Harness(props: { initial: Answers }) {
  const [answers, setAnswers] = useState(props.initial);
  return (
    <GlossaryProvider
      glossary={{}}
      renderMf={(mf) => <b className="formula">{mf}</b>}
    >
      <AnswerFields
        fields={FIELDS}
        answers={answers}
        onChange={(key, value) => {
          changes.push([key, value]);
          setAnswers((previous) => ({ ...previous, [key]: value }));
        }}
        onSubmit={() => {
          submits++;
        }}
      />
    </GlossaryProvider>
  );
}

function render(initial: Answers = {}): void {
  act(() => {
    root.render(<Harness initial={initial} />);
  });
}

function radios(): HTMLButtonElement[] {
  return [...host.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
}

function checks(): string[] {
  return radios().map((radio) => radio.getAttribute('aria-checked') ?? '');
}

function press(target: Element, key: string, type = 'keydown'): void {
  act(() => {
    target.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
  });
}

test('a field that offers its answers is a group of radios named by its label', () => {
  render();
  const group = host.querySelector('[role="radiogroup"]');
  const label = host.querySelector(
    '.series-answers__field--choices label span',
  );

  expect(label?.textContent).toBe('Copper is the');
  expect(group?.getAttribute('aria-labelledby')).toBe(label?.id);
  expect(radios().map((radio) => radio.textContent)).toStrictEqual([
    'anode',
    'cathode',
    'neither, Cu(2+) stays',
  ]);
  expect(host.querySelector('[role="radio"] .formula')?.textContent).toBe(
    'Cu(2+)',
  );
  expect(checks()).toStrictEqual(['false', 'false', 'false']);
  expect(radios().map((radio) => radio.tabIndex)).toStrictEqual([0, -1, -1]);
  // A box beside it is still a box.
  expect(host.querySelectorAll('input')).toHaveLength(1);
});

test('a click picks an answer, which becomes the one stop of the Tab key', () => {
  render();
  act(() => {
    radios()[1]?.click();
  });

  expect(changes).toStrictEqual([['electrode', 'cathode']]);
  expect(checks()).toStrictEqual(['false', 'true', 'false']);
  expect(radios().map((radio) => radio.tabIndex)).toStrictEqual([-1, 0, -1]);
  expect(radios()[1]?.className).toContain('toggle-button');
  expect(radios()[1]?.className).toContain('bp6-intent-primary');
  expect(radios()[0]?.className).toContain('bp6-outlined');
});

test('the arrows move the pick along the row, and stop at its ends', () => {
  render({ electrode: 'anode' });
  const [first, second, third] = radios();

  press(first as Element, 'ArrowRight');

  expect(checks()).toStrictEqual(['false', 'true', 'false']);
  expect(document.activeElement).toBe(second);

  press(second as Element, 'End');
  press(third as Element, 'ArrowRight');

  expect(checks()).toStrictEqual(['false', 'false', 'true']);
  expect(document.activeElement).toBe(third);

  press(third as Element, 'ArrowLeft');

  expect(changes).toStrictEqual([
    ['electrode', 'cathode'],
    ['electrode', 'neither'],
    ['electrode', 'cathode'],
  ]);
});

test('from the first stop with nothing picked, the right arrow picks the second', () => {
  render();
  const [first, second] = radios();

  press(first as Element, 'ArrowRight');

  expect(changes).toStrictEqual([['electrode', 'cathode']]);
  expect(document.activeElement).toBe(second);
});

test('Enter checks the answer and leaves the pick as it is', () => {
  render({ electrode: 'cathode' });
  const [first] = radios();

  press(first as Element, 'Enter');
  press(first as Element, 'Enter', 'keyup');

  expect(submits).toBe(1);
  expect(changes).toStrictEqual([]);
  expect(checks()).toStrictEqual(['false', 'true', 'false']);
});

test('Space picks the answer the focus is on', () => {
  render({ electrode: 'cathode' });
  const [first] = radios();

  press(first as Element, ' ');
  press(first as Element, ' ', 'keyup');

  expect(changes).toStrictEqual([['electrode', 'anode']]);
  expect(submits).toBe(0);
});
