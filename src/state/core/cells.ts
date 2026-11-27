/**
 * The signals a site holds its state in, as the library sees them. The library
 * takes the site's own signals by injection, so it never depends on
 * `@preact/signals` itself.
 */

/** A value a site reads from one of its signals, computed or not. */
export interface ReadonlyCell<T> {
  /** The value; reading it subscribes whoever reads it. */
  readonly value: T;
  /**
   * The value, read without subscribing to it.
   * @returns The value.
   */
  peek: () => T;
}

/** A value a site keeps in one of its signals. */
export interface Cell<T> {
  /** The value; writing it notifies whoever reads it. */
  value: T;
  /**
   * The value, read without subscribing to it.
   * @returns The value.
   */
  peek: () => T;
}

/** The three signal functions the library needs, from the site's own copy. */
export interface SignalTools {
  /** Run several writes as one change: `batch` from `@preact/signals-react`. */
  batch: (callback: () => void) => void;
  /** Run a function again whenever what it read changes; returns a stop. */
  effect: (callback: () => void) => () => void;
  /** Read signals without subscribing to them. */
  untracked: <T>(callback: () => T) => T;
}
