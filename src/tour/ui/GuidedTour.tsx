import { Icon } from '@blueprintjs/core';
import type { Side } from '@floating-ui/react-dom';
import {
  arrow,
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react-dom';
import type { CSSProperties, ReactElement } from 'react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useChromeT } from '../../i18n/ui/useT.ts';

import type { TourStep } from './tourSteps.ts';
import { currentTourStep } from './tourSteps.ts';
import { useTourTarget } from './useTourTarget.ts';

/**
 * Why a tour ended: closed with its cross, or finished with Done on its last
 * step.
 */
export type TourEnd = 'closed' | 'finished';

/** What {@link GuidedTour} is given. */
export interface GuidedTourProps {
  /**
   * The steps, in order. Their `done` is read again on every render. A tour
   * ends best on a step that asks for nothing, whose Done says it is over;
   * one whose steps are all done shows nothing, and comes back if one of
   * them is undone.
   */
  steps: readonly TourStep[];
  /** Called when the visitor closes the tour, or finishes it with Done. */
  onClose: (end: TourEnd) => void;
}

/**
 * A guided tour: a card beside what to do next, and a ring round it. It
 * dims nothing and blocks nothing, so the visitor does the step on the page
 * itself, and a step whose `done` turns true gives way to the next one.
 * @param props - See {@link GuidedTourProps}.
 * @returns The card of the step on show, or nothing once every step is done.
 */
export function GuidedTour(props: GuidedTourProps): ReactElement | null {
  const { steps, onClose } = props;
  const [passed, setPassed] = useState<ReadonlySet<string>>(() => new Set());
  const index = currentTourStep(steps, passed);
  const step = steps[index];
  if (step === undefined || typeof document === 'undefined') return null;
  const last = index === steps.length - 1;
  return createPortal(
    <TourCard
      key={step.id}
      step={step}
      number={index + 1}
      total={steps.length}
      onNext={
        step.done !== undefined
          ? undefined
          : last
            ? () => {
                setPassed((before) => new Set(before).add(step.id));
                onClose('finished');
              }
            : () => {
                setPassed((before) => new Set(before).add(step.id));
              }
      }
      onClose={() => {
        onClose('closed');
      }}
    />,
    document.body,
  );
}

interface TourCardProps {
  step: TourStep;
  number: number;
  total: number;
  onNext: (() => void) | undefined;
  onClose: () => void;
}

function TourCard(props: TourCardProps): ReactElement {
  const { step, number, total, onNext, onClose } = props;
  const t = useChromeT();
  const target = useTourTarget(step.target);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [floating, setFloating] = useState<HTMLDivElement | null>(null);
  const { floatingStyles, isPositioned, middlewareData, placement } =
    useFloating({
      elements: { reference: target, floating },
      placement: step.placement ?? 'bottom',
      strategy: 'fixed',
      middleware: [
        offset(CARD_GAP),
        flip({ padding: EDGE }),
        shift({ padding: EDGE }),
        arrow({ element: arrowElement, padding: 10 }),
      ],
      // Every frame, so a card follows a target that a zoom or a pan moves.
      whileElementsMounted: (reference, floating, update) =>
        autoUpdate(
          reference,
          floating,
          () => {
            update();
            placeRing(ringRef.current, reference);
          },
          { animationFrame: true },
        ),
    });

  const waiting = target === null;
  const side = placement.split('-', 1)[0] as Side;
  const arrowData = middlewareData.arrow;
  const arrowStyle: CSSProperties = {
    left: arrowData?.x,
    top: arrowData?.y,
  };
  const cardStyle: CSSProperties | undefined = waiting
    ? undefined
    : {
        ...floatingStyles,
        visibility: isPositioned ? 'visible' : 'hidden',
      };

  return (
    <>
      {waiting ? null : (
        <div
          ref={ringRef}
          className="guided-tour__ring no-print"
          aria-hidden="true"
        />
      )}
      <div
        ref={setFloating}
        className={
          waiting
            ? 'guided-tour guided-tour--waiting no-print'
            : 'guided-tour no-print'
        }
        style={cardStyle}
        role="status"
        data-testid="guided-tour"
        data-step={step.id}
        data-side={waiting ? undefined : side}
      >
        <div className="guided-tour__head">
          <span className="guided-tour__count">
            {t('tour.count', { current: number, total })}
          </span>
          <button
            type="button"
            className="guided-tour__close"
            aria-label={t('tour.close')}
            title={t('tour.close')}
            data-testid="guided-tour-close"
            onClick={onClose}
          >
            <Icon icon="cross" size={12} />
          </button>
        </div>
        <p className="guided-tour__title">{step.title}</p>
        {step.body === undefined ? null : (
          <div className="guided-tour__body">{step.body}</div>
        )}
        {onNext === undefined ? null : (
          <button
            type="button"
            className="guided-tour__next"
            data-testid="guided-tour-next"
            onClick={onNext}
          >
            {number === total ? t('tour.done') : t('tour.next')}
          </button>
        )}
        {waiting ? null : (
          <div
            ref={setArrowElement}
            className="guided-tour__arrow"
            style={arrowStyle}
          />
        )}
      </div>
    </>
  );
}

// Between the card and its target, px.
const CARD_GAP = 14;
// Kept free between the card and the edge of the window, px.
const EDGE = 8;
// Between the ring and the target it surrounds, px.
const RING_GAP = 4;

function placeRing(
  ring: HTMLDivElement | null,
  target: {
    getBoundingClientRect: () => {
      left: number;
      top: number;
      width: number;
      height: number;
    };
  },
): void {
  if (ring === null) return;
  const box = target.getBoundingClientRect();
  ring.style.transform = `translate(${box.left - RING_GAP}px, ${box.top - RING_GAP}px)`;
  ring.style.width = `${box.width + 2 * RING_GAP}px`;
  ring.style.height = `${box.height + 2 * RING_GAP}px`;
}
