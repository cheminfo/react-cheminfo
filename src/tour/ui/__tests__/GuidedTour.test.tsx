// @vitest-environment jsdom

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { TourEnd } from '../GuidedTour.tsx';
import { GuidedTour } from '../GuidedTour.tsx';
import type { TourStep } from '../tourSteps.ts';
import { currentTourStep } from '../tourSteps.ts';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  for (const element of document.querySelectorAll('[data-shown]')) {
    element.remove();
  }
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('the step on show is the first neither done nor passed', () => {
  const closed: TourStep = {
    id: 'close',
    target: '#a',
    title: 'Close it',
    done: true,
  };
  const steps: TourStep[] = [
    closed,
    { id: 'look', target: '#b', title: 'Look' },
    { id: 'run', target: '#c', title: 'Run it', done: false },
  ];

  expect(currentTourStep(steps, new Set())).toBe(1);
  expect(currentTourStep(steps, new Set(['look']))).toBe(2);
  expect(currentTourStep([{ ...closed, done: false }], new Set())).toBe(0);
  expect(currentTourStep(steps.slice(0, 1), new Set())).toBe(-1);
});

test('a step done moves the tour on, and undone brings it back', () => {
  addTarget('switch');
  addTarget('clock');
  render([false, false]);

  expect(card()?.dataset.step).toBe('switch');
  expect(card()?.textContent).toContain('Step 1 of 2');
  expect(card()?.textContent).toContain('Close the switch');
  expect(document.querySelector('[data-testid="guided-tour-next"]')).toBeNull();

  render([true, false]);

  expect(card()?.dataset.step).toBe('clock');
  expect(card()?.textContent).toContain('Step 2 of 2');

  render([false, false]);

  expect(card()?.dataset.step).toBe('switch');
});

test('every step done shows no card, and ends nothing', () => {
  addTarget('switch');
  addTarget('clock');
  const ends: TourEnd[] = [];
  render([true, true], ends);

  expect(card()).toBeNull();
  expect(ends).toStrictEqual([]);
});

test('a step that asks for nothing is passed with Next, then Done', () => {
  addTarget('plates');
  const ends: TourEnd[] = [];
  act(() => {
    root.render(
      <GuidedTour
        steps={[
          { id: 'read', target: '[data-id="plates"]', title: 'Read' },
          { id: 'again', target: '[data-id="plates"]', title: 'Again' },
        ]}
        onClose={(end) => ends.push(end)}
      />,
    );
  });

  expect(next()?.textContent).toBe('Next');

  act(() => next()?.click());

  expect(card()?.dataset.step).toBe('again');
  expect(next()?.textContent).toBe('Done');

  act(() => next()?.click());

  expect(card()).toBeNull();
  expect(ends).toStrictEqual(['finished']);
});

test('the cross closes the tour', () => {
  addTarget('switch');
  const ends: TourEnd[] = [];
  render([false, false], ends);
  act(() => {
    document
      .querySelector<HTMLButtonElement>('[data-testid="guided-tour-close"]')
      ?.click();
  });

  expect(ends).toStrictEqual(['closed']);
});

test('a card waits in the corner until its target is drawn', async () => {
  render([false, false]);

  expect(card()?.className).toBe('guided-tour guided-tour--waiting no-print');
  expect(document.querySelector('.guided-tour__ring')).toBeNull();

  await act(async () => {
    addTarget('switch');
    await Promise.resolve();
  });

  expect(card()?.className).toBe('guided-tour no-print');
  expect(document.querySelector('.guided-tour__ring')).not.toBeNull();
});

function render(done: [boolean, boolean], ends: TourEnd[] = []): void {
  act(() => {
    root.render(
      <GuidedTour
        steps={[
          {
            id: 'switch',
            target: '[data-id="switch"]',
            title: 'Close the switch',
            done: done[0],
          },
          {
            id: 'clock',
            target: () => document.querySelector('[data-id="clock"]'),
            title: 'Run the clock',
            body: 'The plates change.',
            done: done[1],
          },
        ]}
        onClose={(end) => ends.push(end)}
      />,
    );
  });
}

function addTarget(id: string): void {
  const element = document.createElement('div');
  element.dataset.id = id;
  element.dataset.shown = '';
  // jsdom lays nothing out, so an element says itself that it is drawn.
  element.getClientRects = () =>
    [new DOMRect(0, 0, 10, 10)] as unknown as DOMRectList;
  document.body.append(element);
}

function card(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-testid="guided-tour"]');
}

function next(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(
    '[data-testid="guided-tour-next"]',
  );
}
