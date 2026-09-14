import { expect, test } from 'vitest';

import type { ActivationKeyEvent } from '../activationKey.ts';
import { isActivationKey, onActivateKey } from '../activationKey.ts';
import { isInteractiveTarget, isTextEntryTarget } from '../keyTargets.ts';

test('Enter and the space bar activate, nothing else does', () => {
  expect(isActivationKey({ key: 'Enter' })).toBe(true);
  expect(isActivationKey({ key: ' ' })).toBe(true);
  expect(isActivationKey({ key: 'Spacebar' })).toBe(false);
  expect(isActivationKey({ key: 'ArrowDown' })).toBe(false);
});

test('the handler activates on the space bar and keeps the page still', () => {
  const activated: string[] = [];
  const handler = onActivateKey<ActivationKeyEvent>((event) => {
    activated.push(event.key);
  });
  const row = element('DIV', 'button');
  const event = keyEvent(' ', row, row);

  handler(event);
  handler(keyEvent('Tab', row, row));

  expect(activated).toStrictEqual([' ']);
  expect(event.prevented).toBe(1);
});

test('a key typed into a field of the row, a nested button and a held key activate nothing', () => {
  const activated: string[] = [];
  const handler = onActivateKey<ActivationKeyEvent>((event) => {
    activated.push(event.key);
  });
  const row = element('DIV', 'button');
  const typing = keyEvent(' ', element('INPUT'), row);
  const nestedButton = keyEvent('Enter', element('BUTTON'), row);
  const held = { ...keyEvent('Enter', row, row), repeat: true };

  handler(typing);
  handler(nestedButton);
  handler(held);

  expect(activated).toStrictEqual([]);
  expect(typing.prevented + nestedButton.prevented).toBe(0);
});

test('the key target guards read tags, editable regions and roles', () => {
  expect(isTextEntryTarget(element('TEXTAREA'))).toBe(true);
  expect(isTextEntryTarget(element('DIV', 'textbox'))).toBe(true);
  expect(
    isTextEntryTarget({
      tagName: 'DIV',
      isContentEditable: true,
    } as unknown as EventTarget),
  ).toBe(true);
  expect(isTextEntryTarget(element('DIV', 'listbox'))).toBe(false);
  expect(isTextEntryTarget(null)).toBe(false);
  expect(isInteractiveTarget(element('A'))).toBe(true);
  expect(isInteractiveTarget(element('SPAN', 'switch'))).toBe(true);
  expect(isInteractiveTarget(element('DIV', 'option'))).toBe(false);
  expect(isInteractiveTarget(undefined)).toBe(false);
});

function element(tagName: string, role?: string): EventTarget {
  return {
    tagName,
    getAttribute: (name: string) => (name === 'role' ? (role ?? null) : null),
  } as unknown as EventTarget;
}

function keyEvent(
  key: string,
  target: EventTarget,
  currentTarget: EventTarget,
): ActivationKeyEvent & { prevented: number } {
  const event = {
    key,
    target,
    currentTarget,
    prevented: 0,
    preventDefault: () => {
      event.prevented += 1;
    },
  };
  return event;
}
