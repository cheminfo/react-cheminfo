import type { ReactElement } from 'react';
import { expect, test } from 'vitest';

import type { HeaderToggleOption } from '../HeaderToggle.tsx';
import { HeaderToggle } from '../HeaderToggle.tsx';

type Language = 'en' | 'fr' | 'de' | 'es';

const LANGUAGES: ReadonlyArray<HeaderToggleOption<Language>> = [
  { value: 'en', label: 'EN', title: 'English' },
  { value: 'fr', label: 'FR', title: 'Français' },
  { value: 'de', label: 'DE', title: 'Deutsch' },
  { value: 'es', label: 'ES', title: 'Español' },
];

// The row is a plain function of its props, so its buttons can be read and
// clicked without mounting it.
interface ButtonProps {
  text: string;
  title?: string;
  active?: boolean;
  onClick: () => void;
}

const renderToggle = HeaderToggle;

function buttonsOf(row: ReactElement): Array<ReactElement<ButtonProps>> {
  return (row as ReactElement<{ children: Array<ReactElement<ButtonProps>> }>)
    .props.children;
}

test('every value is offered, and the one in force is pressed', () => {
  const row = renderToggle({
    label: 'Language',
    options: LANGUAGES,
    value: 'fr',
    onChange: () => undefined,
  });
  const buttons = buttonsOf(row as ReactElement);

  expect(buttons.map((button) => button.props.text)).toStrictEqual([
    'EN',
    'FR',
    'DE',
    'ES',
  ]);
  expect(buttons.map((button) => button.props.active ?? false)).toStrictEqual([
    false,
    true,
    false,
    false,
  ]);
  expect(buttons.map((button) => button.props.title)).toStrictEqual([
    'English',
    'Français',
    'Deutsch',
    'Español',
  ]);
});

test('clicking a value sets it', () => {
  const picked: Language[] = [];
  const row = renderToggle({
    label: 'Language',
    options: LANGUAGES,
    value: 'en',
    onChange: (value) => picked.push(value),
  });
  const buttons = buttonsOf(row as ReactElement);

  buttons[2]?.props.onClick();
  buttons[0]?.props.onClick();

  expect(picked).toStrictEqual(['de', 'en']);
});

test('a narrow bar shows the value in force and advances on a click', () => {
  const picked: Language[] = [];
  const button = renderToggle({
    label: 'Language',
    options: LANGUAGES,
    value: 'de',
    compact: true,
    onChange: (value) => picked.push(value),
  }) as ReactElement<ButtonProps>;

  expect(button.props.text).toBe('DE');
  expect(button.props.title).toBe('Language: Deutsch');

  button.props.onClick();

  expect(picked).toStrictEqual(['es']);
});

test('the last value advances back to the first', () => {
  const picked: Language[] = [];
  const button = renderToggle({
    label: 'Language',
    options: LANGUAGES,
    value: 'es',
    compact: true,
    onChange: (value) => picked.push(value),
  }) as ReactElement<ButtonProps>;

  button.props.onClick();

  expect(picked).toStrictEqual(['en']);
});

test('a value the options do not carry reads as the first of them', () => {
  const row = renderToggle({
    label: 'Language',
    options: LANGUAGES,
    value: 'it' as Language,
    onChange: () => undefined,
  });
  const buttons = buttonsOf(row as ReactElement);

  expect(buttons.map((button) => button.props.active ?? false)).toStrictEqual([
    true,
    false,
    false,
    false,
  ]);
});

test('a row with nothing to offer draws nothing', () => {
  expect(
    renderToggle({
      label: 'Language',
      options: [],
      value: 'en',
      onChange: () => undefined,
    }),
  ).toBeNull();
});
