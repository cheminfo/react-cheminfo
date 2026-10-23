import '../styles/card.css';

import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { TITRATION_ROWS } from './titrationFixtures.ts';

/**
 * The frame a chat shows a card in: a box of a chat column's width, outlined
 * the way the chat outlines it. The card inside is what the site draws.
 * @param props - The card, and the width of the frame.
 * @param props.children - The card.
 * @param props.width - The frame's width, in pixels.
 * @returns The frame.
 */
export function ChatFrame(props: {
  children: ReactNode;
  width?: number;
}): ReactElement {
  const { children, width = 560 } = props;
  return <div style={{ ...FRAME_STYLE, width }}>{children}</div>;
}

const FRAME_STYLE = {
  position: 'relative',
  margin: 16,
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  overflow: 'hidden',
} as const satisfies CSSProperties;

/**
 * The titration curve, drawn as the figure of the card.
 * @returns An SVG of the curve.
 */
export function TitrationCurve(): ReactElement {
  const width = 460;
  const height = 180;
  let path = '';
  for (const [volume, ph] of TITRATION_ROWS) {
    const x = (volume / 20) * (width - 20) + 10;
    const y = height - 10 - (ph / 14) * (height - 20);
    path += `${path === '' ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="pH against the volume of NaOH added"
    >
      <rect
        x={0.5}
        y={0.5}
        width={width - 1}
        height={height - 1}
        fill="none"
        stroke="var(--border)"
      />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} />
    </svg>
  );
}
