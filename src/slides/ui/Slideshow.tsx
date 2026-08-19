import type {
  CSSProperties,
  ComponentType,
  MouseEvent,
  ReactElement,
} from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useContainerSize } from '../../hooks/ui/useContainerSize.ts';
import type { Talk } from '../core/index.ts';
import { clampSlideIndex, slideActionForKey } from '../core/index.ts';

import type { RenderSlideLink } from './DemoLink.tsx';
import type { SlideLayoutProps } from './Slide.tsx';
import { SlideView } from './Slide.tsx';
import { SlideshowBar } from './SlideshowBar.tsx';

/** The talk being presented, and everything the site keeps a hand on. */
export interface SlideshowProps {
  /** The parsed talk. */
  talk: Talk;
  /** Which slide is showing, zero-based; clamped into the talk before drawing. */
  index: number;
  /** Called with the slide to show; the site writes it wherever it keeps it. */
  onIndex: (index: number) => void;
  /**
   * Called when the presenter leaves the talk. The bar carries no Exit button
   * when it is left out.
   * @default undefined
   */
  onExit?: () => void;
  /**
   * The layouts this site adds, by the name a slide writes in its
   * `<!-- layout: … -->` marker.
   * @default undefined
   */
  layouts?: Record<string, ComponentType<SlideLayoutProps>>;
  /**
   * The site's own link, used for the in-app links the slides hold.
   * @default undefined — a plain anchor
   */
  renderLink?: RenderSlideLink;
  /**
   * How the publishing site names this talk in its addresses, carried by every
   * demo link so the tool it opens can offer the way back.
   * @default '' — the demo links carry no talk
   */
  talkId?: string;
  /**
   * What the bar reads.
   * @default the talk's own title
   */
  title?: string;
  /**
   * Class the player carries, in addition to `slideshow`.
   * @default undefined
   */
  className?: string;
}

/** Slides are authored on this canvas, and it is scaled to whatever it is played on. */
const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;

/**
 * The conference player: one talk, one slide at a time, on a canvas scaled to
 * fill whatever screen it is given.
 *
 * The index is controlled, because the site owns the address — the slide lives
 * in a query parameter so a demo link can return to the exact one — and the
 * player therefore never touches history itself.
 *
 * Arrow keys, space and PageUp/PageDown navigate, `Home` and `End` jump to the
 * ends, `f` toggles fullscreen, `b` and `w` blank the screen to black and to
 * white the way a projector remote does, and `n` shows the presenter's notes.
 * @param props - See {@link SlideshowProps}.
 * @returns The player.
 */
export function Slideshow(props: SlideshowProps): ReactElement {
  const {
    talk,
    index,
    onIndex,
    onExit,
    layouts,
    renderLink,
    talkId = '',
    title,
    className,
  } = props;

  const total = talk.slides.length;
  const current = clampSlideIndex(index, total);
  const slide = talk.slides[current];

  const playerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(stageRef);
  const scale =
    width === 0 || height === 0
      ? 1
      : Math.min(width / SLIDE_WIDTH, height / SLIDE_HEIGHT);

  const [blank, setBlank] = useState<'black' | 'white' | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      setBlank(null);
      onIndex(clampSlideIndex(next, total));
    },
    [onIndex, total],
  );

  const toggleFullscreen = useCallback(() => {
    const element = playerRef.current;
    if (element === null) return;
    if (document.fullscreenElement === element) {
      void document.exitFullscreen().catch(() => undefined);
    } else {
      void element.requestFullscreen().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    function onFullscreenChange(): void {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      // A player embedded in a page shares the document with its fields, and
      // space is both "next slide" and a character.
      if (isTextEntry(event.target)) return;
      const action = slideActionForKey(event.key, current, total);
      if (action === null) return;
      event.preventDefault();
      switch (action.kind) {
        case 'go':
          goTo(action.index);
          break;
        case 'blank':
          setBlank((shown) => (shown === action.color ? null : action.color));
          break;
        case 'fullscreen':
          toggleFullscreen();
          break;
        case 'notes':
          setShowNotes((shown) => !shown);
          break;
        default:
          break;
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [current, total, goTo, toggleFullscreen]);

  function onStageClick(event: MouseEvent<HTMLDivElement>): void {
    // A demo link or a control handles its own click without also stepping on.
    const target = event.target as Element | null;
    if (target !== null && target.closest('a, button') !== null) return;
    goTo(current + 1);
  }

  const progress = total > 1 ? (current / (total - 1)) * 100 : 100;

  return (
    <div
      ref={playerRef}
      className={
        className === undefined ? 'slideshow' : `slideshow ${className}`
      }
    >
      {/* Clicking the stage steps on, the way a projector remote does; the
          keyboard equivalent is the arrow keys the player already listens for. */}
      <div className="slideshow-stage" ref={stageRef} onClick={onStageClick}>
        <div className="slide-canvas" style={{ transform: `scale(${scale})` }}>
          {slide === undefined ? null : (
            // Keyed on the index so an animated slide replays from its start
            // every time it is navigated to.
            <SlideView
              key={current}
              slide={slide}
              talkId={talkId}
              slideIndex={current}
              meta={talk.meta}
              layouts={layouts}
              renderLink={renderLink}
            />
          )}
        </div>
        {blank === null ? null : (
          // Clicking the blank screen brings the slide back, as does pressing
          // the key that blanked it.
          <div
            className={`slideshow-blank slideshow-blank--${blank}`}
            onClick={(event) => {
              event.stopPropagation();
              setBlank(null);
            }}
          />
        )}
      </div>
      {showNotes && slide?.notes !== undefined ? (
        <div className="slideshow-notes no-print">{slide.notes}</div>
      ) : null}
      <SlideshowBar
        title={title ?? talk.meta.title}
        index={current}
        total={total}
        isFullscreen={isFullscreen}
        onGo={goTo}
        onToggleFullscreen={toggleFullscreen}
        onExit={onExit}
      />
      <div
        className="slideshow-progress"
        style={{ '--progress': `${progress}%` } as CSSProperties}
      />
    </div>
  );
}

const TEXT_ENTRY_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isTextEntry(target: EventTarget | null): boolean {
  if (target === null) return false;
  const element = target as { tagName?: unknown; isContentEditable?: unknown };
  if (element.isContentEditable === true) return true;
  return (
    typeof element.tagName === 'string' && TEXT_ENTRY_TAGS.has(element.tagName)
  );
}
