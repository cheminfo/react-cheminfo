import { Button } from '@blueprintjs/core';
import type { ReactElement } from 'react';

/** Where the talk stands, and what the presenter may do about it. */
export interface SlideshowBarProps {
  /** What the bar reads. */
  title: string;
  /** Which slide is showing, zero-based. */
  index: number;
  /** How many slides the talk holds. */
  total: number;
  /** Whether the player is presenting on the whole screen. */
  isFullscreen: boolean;
  /** Called with the slide to show. */
  onGo: (index: number) => void;
  /** Called to enter or leave fullscreen. */
  onToggleFullscreen: () => void;
  /**
   * Called when the presenter leaves the talk. The bar carries no Exit button
   * when it is left out.
   * @default undefined
   */
  onExit?: () => void;
}

/**
 * The bar under the stage: the way out, the talk's name, and where in it the
 * presenter stands.
 *
 * It is chrome rather than the talk, so it is dropped from a printed handout
 * along with the rest of the site's.
 * @param props - See {@link SlideshowBarProps}.
 * @returns The bar.
 */
export function SlideshowBar(props: SlideshowBarProps): ReactElement {
  const {
    title,
    index,
    total,
    isFullscreen,
    onGo,
    onToggleFullscreen,
    onExit,
  } = props;

  return (
    <div className="slideshow-bar no-print">
      {onExit === undefined ? null : (
        <Button variant="minimal" icon="cross" text="Exit" onClick={onExit} />
      )}
      <div className="slideshow-title">{title}</div>
      <div className="slideshow-controls">
        <Button
          variant="minimal"
          icon="chevron-left"
          aria-label="Previous slide"
          disabled={index === 0}
          onClick={() => {
            onGo(index - 1);
          }}
        />
        <span className="slideshow-counter">
          {`${total === 0 ? 0 : index + 1} / ${total}`}
        </span>
        <Button
          variant="minimal"
          icon="chevron-right"
          aria-label="Next slide"
          disabled={index >= total - 1}
          onClick={() => {
            onGo(index + 1);
          }}
        />
        <Button
          variant="minimal"
          icon={isFullscreen ? 'minimize' : 'fullscreen'}
          aria-label="Toggle fullscreen"
          onClick={onToggleFullscreen}
        />
      </div>
    </div>
  );
}
