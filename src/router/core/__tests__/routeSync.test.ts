/**
 * The address is applied as the page opens and after every move, and the
 * state written back as it changes — the writer created after the opening
 * route was applied, so it never writes a deep link over with defaults.
 */

import { expect, test } from 'vitest';

import { startRouteSync } from '../routeSync.ts';

/**
 * A page: the address, the state, and an `effect` that runs its callback
 * again whenever the state is set.
 * @param address - The route the address opens on.
 * @returns The page.
 */
function page(address: string) {
  const log: string[] = [];
  const shown = { address, state: 'default' };
  const routeListeners = new Set<() => void>();
  const stateListeners = new Set<() => void>();
  return {
    log,
    shown,
    move(next: string) {
      shown.address = next;
      for (const listener of routeListeners) listener();
    },
    setState(next: string) {
      shown.state = next;
      for (const listener of stateListeners) listener();
    },
    options: {
      read: () => shown.address,
      subscribe: (listener: () => void) => {
        routeListeners.add(listener);
        return () => {
          routeListeners.delete(listener);
        };
      },
      write: (route: string) => {
        log.push(`write ${route}`);
        shown.address = route;
      },
      apply: (route: string) => {
        log.push(`apply ${route}`);
        shown.state = route;
      },
      current: () => shown.state,
      effect: (callback: () => void) => {
        callback();
        stateListeners.add(callback);
        return () => {
          stateListeners.delete(callback);
        };
      },
    },
    listening: () => routeListeners.size + stateListeners.size,
  };
}

test('the opening route is applied before the state is written back', () => {
  const view = page('/tutorial/3');
  const stop = startRouteSync(view.options);

  expect(view.log).toStrictEqual(['apply /tutorial/3', 'write /tutorial/3']);

  view.move('/exercises/rings');
  view.setState('/about');

  expect(view.log.slice(2)).toStrictEqual([
    'apply /exercises/rings',
    'write /about',
  ]);

  stop();

  expect(view.listening()).toBe(0);
});

test('a page may open on another route than the address names', () => {
  const view = page('/');
  startRouteSync({ ...view.options, opening: () => '/fr/' });

  expect(view.log).toStrictEqual(['apply /fr/', 'write /fr/']);
});
