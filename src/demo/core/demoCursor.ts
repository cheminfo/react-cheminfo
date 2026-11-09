import type { DemoPoint } from './demoEvents.ts';

/** The pointer a demo draws over the tool, and how it moves. */
export interface DemoCursor {
  /** Where its tip is, in client pixels. */
  readonly position: DemoPoint;
  /**
   * Glide to a point, at the pace of a hand.
   * @param point - Where to.
   * @param signal - Stops the glide where it is.
   * @param onFrame - Called at every point it passes.
   */
  glide: (
    point: DemoPoint,
    signal: AbortSignal,
    onFrame?: (point: DemoPoint) => void,
  ) => Promise<void>;
  /** Be at a point at once. */
  jump: (point: DemoPoint) => void;
  /** Show it pressed, or released. */
  press: (pressed: boolean) => void;
  /** Mark a click at its tip with a ring. */
  ripple: () => void;
  /** Carry a step's number, counted from one, or none. */
  label: (step: number | null) => void;
  /** Take it off the page. */
  remove: () => void;
}

/**
 * Draw the demo's pointer on the tool's page.
 *
 * It is large, because it is read from the back of a room, and it carries the
 * number of the line the slide has lit, drawn like that line's own number, so
 * what the tool is doing reads as the line being done. It never takes a click:
 * the events go to what lies under it. Its look is in `styles/demo.css`.
 * @param document - The tool's document.
 * @returns The cursor, hidden until it first moves.
 */
export function createDemoCursor(document: Document): DemoCursor {
  const element = document.createElement('div');
  element.className = 'demo-cursor';
  element.setAttribute('aria-hidden', 'true');
  element.innerHTML = CURSOR_MARKUP;
  const badge = element.querySelector('.demo-cursor-step');
  document.body.append(element);

  const view = document.defaultView;
  let position: DemoPoint = {
    x: (view?.innerWidth ?? 800) / 2,
    y: (view?.innerHeight ?? 600) / 2,
  };

  function place(point: DemoPoint): void {
    position = point;
    element.style.transform = `translate(${point.x}px, ${point.y}px)`;
    element.classList.add('demo-cursor--shown');
  }

  return {
    get position() {
      return position;
    },
    glide: (point, signal, onFrame) =>
      glide(position, point, signal, (next) => {
        place(next);
        onFrame?.(next);
      }),
    jump: place,
    press: (pressed) => {
      element.classList.toggle('demo-cursor--pressed', pressed);
    },
    ripple: () => {
      const ring = document.createElement('div');
      ring.className = 'demo-cursor-ripple';
      ring.style.transform = `translate(${position.x}px, ${position.y}px)`;
      document.body.append(ring);
      setTimeout(() => {
        ring.remove();
      }, RIPPLE_MS);
    },
    label: (step) => {
      if (badge === null) return;
      badge.textContent = step === null ? '' : String(step);
      element.classList.toggle('demo-cursor--labelled', step !== null);
    },
    remove: () => {
      element.remove();
    },
  };
}

/** How long a click's ring lasts; the stylesheet's animation matches it. */
const RIPPLE_MS = 600;

/** The slowest and fastest a glide takes, whatever its length. */
const SHORTEST_GLIDE_MS = 320;
const LONGEST_GLIDE_MS = 900;

function glide(
  from: DemoPoint,
  to: DemoPoint,
  signal: AbortSignal,
  onFrame: (point: DemoPoint) => void,
): Promise<void> {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const duration = Math.min(
    Math.max(SHORTEST_GLIDE_MS, distance * 1.1),
    LONGEST_GLIDE_MS,
  );
  return new Promise((resolve, reject) => {
    const start = performance.now();
    function frame(now: number): void {
      if (signal.aborted) {
        reject(signal.reason as Error);
        return;
      }
      const share = Math.min((now - start) / duration, 1);
      const eased = easeInOut(share);
      onFrame({
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
      });
      if (share < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

function easeInOut(share: number): number {
  return share < 0.5
    ? 4 * share * share * share
    : 1 - ((-2 * share + 2) * (-2 * share + 2) * (-2 * share + 2)) / 2;
}

const CURSOR_MARKUP = `<svg class="demo-cursor-arrow" viewBox="0 0 24 24"><path d="M4 2.5v17.2l4.6-4.4 3.1 6.9 3.2-1.4-3.1-6.8h6.4z"/></svg><span class="demo-cursor-step"></span>`;
