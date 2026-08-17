/**
 * The box a depiction leaves behind when there is no picture in it — nothing
 * to draw, a notation that cannot be read, or the moment before the renderers
 * have been downloaded.
 *
 * It is kept apart from the renderers on purpose: it pulls nothing in, so both
 * sides of the `React.lazy` boundary in `Structure` can use it.
 */

import type { CSSProperties, ReactElement, ReactNode } from 'react';

/** Props of {@link StructurePlaceholder}. */
export interface StructurePlaceholderProps {
  /** Width of the box, in pixels: the width the picture would have had. */
  width: number;
  /** Height of the box, in pixels. */
  height: number;
  /**
   * What is written in the middle of the box.
   * @default undefined
   */
  children?: ReactNode;
}

/**
 * A box the size of the picture that is not there, holding whatever the caller
 * wants said instead.
 * @param props - See {@link StructurePlaceholderProps}.
 * @returns The placeholder.
 */
export function StructurePlaceholder(
  props: StructurePlaceholderProps,
): ReactElement {
  const { width, height, children } = props;
  return (
    <span style={{ ...PLACEHOLDER_STYLE, width, height }} aria-hidden="true">
      {children}
    </span>
  );
}

const PLACEHOLDER_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8a96a3',
  fontSize: '0.75rem',
};
