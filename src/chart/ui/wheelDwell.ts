/**
 * When a chart's wheel is caught, worked out without a timer or a DOM.
 *
 * Kept out of `useWheelZoom` the way `lassoGesture` is kept out of the lasso:
 * which event arms the wheel, which one pushes the dwell out and which one is
 * a zoom are questions with one answer each, and the hook only has to carry
 * the answers out — start or stop a timer, stop the page from scrolling.
 */

/** Whether a chart's wheel is caught yet, and whether a dwell is counting. */
export interface WheelDwellState {
  /** Whether the wheel zooms the chart rather than scrolling the page. */
  armed: boolean;
  /** Whether a dwell timer is running. */
  counting: boolean;
}

/** Something that happened over the plot's surface. */
export type WheelDwellEvent =
  /** The pointer came onto the surface. */
  | { type: 'enter' }
  /** The pointer moved over it. */
  | { type: 'move' }
  /** The pointer left it. */
  | { type: 'leave' }
  /** The dwell timer ran out. */
  | { type: 'elapsed' }
  /** The wheel turned, with the mouse buttons held down at the time. */
  | { type: 'wheel'; buttons: number };

/** What one event leaves the hook to do. */
export interface WheelDwellStep {
  /** The state after the event. */
  state: WheelDwellState;
  /**
   * What happens to the dwell timer: `restart` stops any timer running and
   * starts a new one, `clear` stops it, `keep` leaves it as it is.
   */
  timer: 'restart' | 'clear' | 'keep';
  /** Whether the event is a wheel the chart zooms by, and keeps from the page. */
  zoom: boolean;
}

/** Nothing armed and nothing counting: a pointer that has not rested yet. */
export const WHEEL_DWELL_IDLE: WheelDwellState = {
  armed: false,
  counting: false,
};

/**
 * The next state of a chart's wheel.
 *
 * A pointer resting over the plot starts the dwell, and every wheel event that
 * arrives before it is up both scrolls the page and starts it again. A move
 * starts it only when nothing is counting: restarting it on every move would
 * ask the reader to hold the pointer perfectly still, which is not what
 * resting means. A wheel with a button down belongs to the drag that claimed
 * the pointer, so it neither zooms nor pushes the dwell out: moving the ground
 * under a lasso would leave the outline pointing at rows nobody drew a ring
 * around.
 * @param state - Where the wheel stands before the event.
 * @param event - What happened.
 * @returns The new state, and what the hook has to do about it.
 */
export function wheelDwellStep(
  state: WheelDwellState,
  event: WheelDwellEvent,
): WheelDwellStep {
  switch (event.type) {
    case 'enter':
      return state.armed ? keep(state) : restart(state);
    case 'move':
      return state.armed || state.counting ? keep(state) : restart(state);
    case 'leave':
      return { state: WHEEL_DWELL_IDLE, timer: 'clear', zoom: false };
    case 'elapsed':
      return {
        state: { armed: true, counting: false },
        timer: 'keep',
        zoom: false,
      };
    case 'wheel':
      if (event.buttons !== 0) return keep(state);
      if (!state.armed) return restart(state);
      return { state, timer: 'keep', zoom: true };
    default:
      return keep(state);
  }
}

/**
 * How far along a side a position sits, from 0 to 1.
 * @param position - The position, in pixels from the near edge.
 * @param size - The side's length.
 * @returns The share. The middle of an element with no size, which is the only
 * place a pointer can be said to be on one.
 */
export function wheelShare(position: number, size: number): number {
  if (!(size > 0) || !Number.isFinite(position)) return 0.5;
  return Math.min(1, Math.max(0, position / size));
}

/**
 * An event that changes nothing.
 * @param state - The state, handed back as it is.
 * @returns The step.
 */
function keep(state: WheelDwellState): WheelDwellStep {
  return { state, timer: 'keep', zoom: false };
}

/**
 * An event that starts the dwell over.
 * @param state - The state before it.
 * @returns The step.
 */
function restart(state: WheelDwellState): WheelDwellStep {
  return {
    state: { armed: state.armed, counting: true },
    timer: 'restart',
    zoom: false,
  };
}
