/** A signal as the fake reactive system makes it. */
export interface FakeSignal<T> {
  value: T;
  peek: () => T;
  subscribe: () => () => void;
}

/**
 * A reactive system just big enough for a bucket: every write runs every
 * effect, which is what a page's `effect` does for a leaf it read.
 * @returns `signal` and `effect`, as `@preact/signals` names them.
 */
export function createReactiveSystem() {
  const effects: Array<() => void> = [];
  const effect = (callback: () => void): (() => void) => {
    effects.push(callback);
    callback();
    return () => {
      effects.splice(effects.indexOf(callback), 1);
    };
  };
  const signal = <T>(initial: T): FakeSignal<T> => {
    let current = initial;
    return {
      get value() {
        return current;
      },
      set value(next: T) {
        current = next;
        for (const listener of effects.slice()) listener();
      },
      peek: () => current,
      subscribe: () => unsubscribe,
    };
  };
  return { effect, signal };
}

function unsubscribe(): void {
  // The fake signals keep no subscriber list, so there is nothing to release.
}
