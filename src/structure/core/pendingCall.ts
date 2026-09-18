/** A call held back until its value has been still, which can be cut short. */
export interface PendingCall<TValue> {
  /**
   * Hold a value back, replacing whichever one was waiting.
   * @param value - The value to deliver.
   * @param delay - How long to wait, in milliseconds; `0` or less delivers now.
   * @param deliver - What the value is handed to.
   */
  push: (
    value: TValue,
    delay: number,
    deliver: (value: TValue) => void,
  ) => void;
  /** Forget the value waiting, which is then never delivered. */
  drop: () => void;
  /** Deliver the value waiting now rather than when its delay runs out. */
  flush: () => void;
}

/**
 * A trailing debounce for one value at a time, whose waiting value can be
 * delivered early or thrown away.
 * @returns The pending call, holding nothing.
 */
export function createPendingCall<TValue>(): PendingCall<TValue> {
  let pending: {
    value: TValue;
    deliver: (value: TValue) => void;
    timer: ReturnType<typeof setTimeout>;
  } | null = null;

  function drop(): void {
    if (pending === null) return;
    clearTimeout(pending.timer);
    pending = null;
  }

  return {
    push(value, delay, deliver) {
      drop();
      if (delay <= 0) {
        deliver(value);
        return;
      }
      const timer = setTimeout(() => {
        pending = null;
        deliver(value);
      }, delay);
      pending = { value, deliver, timer };
    },
    drop,
    flush() {
      if (pending === null) return;
      const { value, deliver } = pending;
      drop();
      deliver(value);
    },
  };
}
