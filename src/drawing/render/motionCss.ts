/**
 * The stylesheet that sets glassware moving: a rising bubble and a run along
 * water, both held still until the figure says `data-motion="moving"`.
 */

/**
 * The rules that move glassware, scoped to what says `data-motion="moving"`:
 * the page carries them once for every scene it draws, and every figure that
 * has something to move carries them too, so the two never drift apart.
 */
export const MOTION_CSS = `/* A bubble rises from where it is drawn, three of its own heights, fading in
   and out, so a stream of them keeps going. */
[data-motion='moving'] .glass-bubble {
  animation: glass-bubble-rise 1.4s linear infinite;
  transform-box: fill-box;
}

@keyframes glass-bubble-rise {
  0% {
    opacity: 0;
    transform: translateY(0);
  }

  20%,
  75% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateY(-300%);
  }
}

/* A stir bar seen from the side, turning about the upright: it shortens along
   the way it lies to its own thickness and back, each half turn. */
[data-motion='moving'] .glass-turning {
  animation: glass-bar-turn 0.35s linear infinite;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes glass-bar-turn {
  0%,
  100% {
    transform: rotate(var(--glass-lying)) scaleX(1)
      rotate(calc(-1 * var(--glass-lying)));
  }

  12.5%,
  87.5% {
    transform: rotate(var(--glass-lying)) scaleX(0.92)
      rotate(calc(-1 * var(--glass-lying)));
  }

  25%,
  75% {
    transform: rotate(var(--glass-lying)) scaleX(0.71)
      rotate(calc(-1 * var(--glass-lying)));
  }

  37.5%,
  62.5% {
    transform: rotate(var(--glass-lying)) scaleX(0.4)
      rotate(calc(-1 * var(--glass-lying)));
  }

  50% {
    transform: rotate(var(--glass-lying)) scaleX(0.27)
      rotate(calc(-1 * var(--glass-lying)));
  }
}

/* A rotor seen face on, spinning in its plane about the middle of its box,
   clockwise, or the other way when it spins back. */
[data-motion='moving'] .glass-spinning {
  animation: glass-spin 1.2s linear infinite;
  transform-box: fill-box;
  transform-origin: center;
}

[data-motion='moving'] .glass-spinning-back {
  animation-direction: reverse;
}

@keyframes glass-spin {
  to {
    transform: rotate(360deg);
  }
}

/* A piece an orbital shaker swirls, seen edge on: it sways from one side of
   the orbit to the other and back, a round trip a third of a second long, as
   at 180 rpm. */
[data-motion='moving'] .glass-swirling {
  animation: glass-swirl 0.167s ease-in-out infinite alternate;
}

@keyframes glass-swirl {
  from {
    transform: translateX(calc(-1 * var(--glass-orbit)));
  }

  to {
    transform: translateX(var(--glass-orbit));
  }
}

/* A figure carries each bubble running along water, and each drop falling, as
   a run that only shows moving (written hidden, for a program that reads no
   style), and the ones drawn where they stand as a still copy that only shows
   held still. */
[data-motion='moving'] .glass-run {
  display: inline;
}

[data-motion='moving'] .glass-stands {
  display: none;
}

@media print, (prefers-reduced-motion: reduce) {
  .glass-bubble,
  .glass-turning,
  .glass-spinning,
  .glass-swirling {
    animation: none;
  }

  [data-motion='moving'] .glass-run {
    display: none;
  }

  [data-motion='moving'] .glass-stands {
    display: inline;
  }
}`;
