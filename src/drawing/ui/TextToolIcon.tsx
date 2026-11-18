import type { ReactElement } from 'react';

/**
 * The letter the text tool is drawn with, on a 16-unit square: a serif bold T,
 * for an icon set that draws its own `<svg>` around each glyph.
 * @returns The glyph.
 */
export function TextToolGlyph(): ReactElement {
  return (
    <text
      x="8"
      y="12.5"
      textAnchor="middle"
      fontSize="12"
      fontWeight="700"
      fontFamily="Georgia, serif"
      fill="currentColor"
      stroke="none"
    >
      T
    </text>
  );
}

/**
 * The icon of the text tool, the same in every editor of the family, in the
 * colour of the text around it.
 * @param props - Its size.
 * @param props.size - Its width and height, in pixels.
 * @returns The icon.
 */
export function TextToolIcon(props: {
  /** @default 16 */
  size?: number;
}): ReactElement {
  const { size = 16 } = props;
  return (
    <svg
      className="tool-icon"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <TextToolGlyph />
    </svg>
  );
}
