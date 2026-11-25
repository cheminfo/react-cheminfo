// @vitest-environment jsdom
/**
 * The family's help cards on the controls that carry them: a react-science
 * `Toolbar.Item`, the same item disabled, and an `ActivityBar.Item` of the
 * panel rail. None of them carries Blueprint's popover-target class, so the
 * card must open from the events alone: for a pointer that moved onto the
 * control, and for the keyboard's focus — never for a control that moved under
 * a pointer standing still, nor for the focus a click gives.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { Toolbar } from 'react-science/ui';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { PanelRail } from '../../../panel/ui/PanelRail.tsx';
import { HelpBody } from '../HelpBody.tsx';
import { useHelpCards } from '../useHelpCards.ts';

import { cardsAfterTheDelay, cross } from './pointerCrossing.ts';

let host: HTMLDivElement;
let elsewhere: HTMLParagraphElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  elsewhere = document.createElement('p');
  host = document.createElement('div');
  document.body.append(elsewhere, host);
  root = createRoot(host);
  act(() => root.render(<Controls />));
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  elsewhere.remove();
  vi.useRealTimers();
});

function Controls(): ReactElement {
  const help = useHelpCards();
  return (
    <>
      <Toolbar>
        <Toolbar.Item
          icon="search"
          aria-label="Zoom"
          tooltip={<HelpBody content={{ title: 'Zoom in' }} />}
          tooltipProps={help('zoom')}
        />
        <Toolbar.Item
          icon="widget"
          aria-label="Scale bar"
          disabled
          tooltip={<HelpBody content={{ title: 'Set a scale first' }} />}
          tooltipProps={help('bar')}
        />
      </Toolbar>
      <PanelRail
        panels={[{ id: 'steps', icon: 'list', title: 'Steps' }]}
        openIds={[]}
        onToggle={() => undefined}
      />
    </>
  );
}

function control(name: string): HTMLElement {
  const found = Array.from(
    host.querySelectorAll<HTMLElement>('[aria-label]'),
  ).find((one) => one.getAttribute('aria-label') === name);
  if (found === undefined) throw new Error(`no control ${name}`);
  return found;
}

function leave(target: Element): void {
  act(() => {
    elsewhere.dispatchEvent(
      new MouseEvent('pointerover', { bubbles: true, relatedTarget: target }),
    );
    target.dispatchEvent(
      new MouseEvent('mouseout', { bubbles: true, relatedTarget: elsewhere }),
    );
  });
  cardsAfterTheDelay();
}

test('a pointer that moved onto a toolbar item, a disabled one or a rail item opens its card; one the layout moved it under does not', () => {
  const zoom = control('Zoom');
  const icon = zoom.querySelector('svg') ?? zoom;
  cross(icon, { moved: false, from: elsewhere });
  const shifted = cardsAfterTheDelay();
  leave(icon);
  cross(icon, { moved: true, from: elsewhere });
  const moved = cardsAfterTheDelay();
  leave(icon);
  cross(control('Scale bar'), { moved: true, from: elsewhere });
  const disabled = cardsAfterTheDelay();
  leave(control('Scale bar'));
  cross(control('Steps'), { moved: true, from: elsewhere });
  const rail = cardsAfterTheDelay();

  expect({ shifted, moved, disabled, rail }).toStrictEqual({
    shifted: [],
    moved: ['Zoom in'],
    disabled: ['Set a scale first'],
    rail: ['Steps'],
  });
});

test('a click opens no card, not even for the focus it gives; the keyboard’s focus does', () => {
  const zoom = control('Zoom');
  const before = document.createElement('button');
  document.body.prepend(before);
  act(() => before.focus());
  cross(zoom, { moved: true, from: elsewhere });
  act(() => {
    zoom.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    zoom.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    zoom.focus();
    zoom.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  const clicked = cardsAfterTheDelay();
  leave(zoom);
  act(() => {
    before.focus();
    before.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }),
    );
    zoom.focus();
    zoom.dispatchEvent(
      new KeyboardEvent('keyup', { bubbles: true, key: 'Tab' }),
    );
  });
  const tabbed = cardsAfterTheDelay();
  before.remove();

  expect({ clicked, tabbed }).toStrictEqual({
    clicked: [],
    tabbed: ['Zoom in'],
  });
});
