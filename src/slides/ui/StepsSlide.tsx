import type { ReactElement } from 'react';
import { useRef, useState } from 'react';

import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import { splitSteps } from '../core/index.ts';

import { FramedTool } from './FramedTool.tsx';
import type { SlideLayoutProps } from './Slide.tsx';
import { SlideBody } from './SlideBody.tsx';
import { useDemoFrame } from './useDemoFrame.ts';

/**
 * A procedure on one half of the slide, and the tool doing it on the other.
 *
 * The list is walked one item at a time: the item on show is lit in the
 * site's colour, the ones done are kept and the ones to come are faint, so the
 * room always sees where it is in the procedure. The tool is framed live, and
 * its demo — named by `?demo=` in the address — plays the step the slide is
 * on, its cursor carrying the same number as the line it is doing. A click on
 * a line goes to it; a click on the lit one plays it again.
 *
 * Written without an address, the slide is the walked list alone.
 * @param props - What the player hands every layout.
 * @returns The slide.
 */
export function StepsSlide(props: SlideLayoutProps): ReactElement {
  const { slide, step = 0, onStep, renderLink } = props;
  const { intro, steps, outro, src } = splitSteps(slide.body);
  const current = Math.min(Math.max(step, 0), Math.max(steps.length - 1, 0));
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [replay, setReplay] = useState(0);
  useDemoFrame(frameRef, src, current, replay);
  const items = numberSteps(steps);

  return (
    <div
      className={joinClassNames(
        'slide slide--steps',
        src === null && 'slide--steps-alone',
      )}
    >
      <div className="slide-content slide-steps-text">
        {intro === '' ? null : (
          <SlideBody body={intro} renderLink={renderLink} />
        )}
        <ol className="slide-steps">
          {items.map(({ index, text }) => (
            <li
              key={index}
              className={joinClassNames(
                'slide-step',
                index < current && 'slide-step--done',
                index === current && 'slide-step--current',
              )}
              aria-current={index === current ? 'step' : undefined}
            >
              <button
                type="button"
                className="slide-step-button"
                disabled={onStep === undefined}
                onClick={() => {
                  if (index === current) setReplay((count) => count + 1);
                  else onStep?.(index);
                }}
              >
                <span className="slide-step-number">{index + 1}</span>
                <span className="slide-step-text">
                  <SlideBody body={text} inline />
                </span>
              </button>
            </li>
          ))}
        </ol>
        {outro === '' ? null : (
          <SlideBody body={outro} renderLink={renderLink} />
        )}
      </div>
      {src === null ? null : <FramedTool src={src} frameRef={frameRef} />}
    </div>
  );
}

/**
 * The lines of the procedure with their place, which is what identifies a
 * line: the same words may be written twice.
 * @param steps - The lines, in order.
 * @returns Each line with its place.
 */
function numberSteps(
  steps: readonly string[],
): Array<{ index: number; text: string }> {
  const items = new Array<{ index: number; text: string }>(steps.length);
  for (let index = 0; index < steps.length; index++) {
    items[index] = { index, text: steps[index] ?? '' };
  }
  return items;
}
