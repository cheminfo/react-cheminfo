import type { ReactElement, ReactNode } from 'react';
import { Fragment } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { DemoLinkSpec, TalkOrigin } from '../core/index.ts';
import { demoLabel } from '../core/index.ts';
import { resolveTalkAddress } from '../core/talkOrigin.ts';

import type { RenderSlideLink } from './DemoLink.tsx';
import { DemoLink } from './DemoLink.tsx';

/** Props of {@link SlideDemos}. */
export interface SlideDemosProps {
  /** The demo links the slide was written with, in order. */
  demos: readonly DemoLinkSpec[];
  /** The slide they hang from, which the way back returns to. */
  origin: TalkOrigin;
  /**
   * The site's own link, used for an in-app demo.
   * @default undefined — a plain anchor
   */
  renderLink?: RenderSlideLink;
  /**
   * Where the publishing site lives, which a relative demo address is resolved
   * against.
   * @default undefined — the addresses are this site's own
   */
  talkOrigin?: string;
  /**
   * What stands before the links; `null` for nothing.
   * @default 'Live demos' in the page language
   */
  label?: ReactNode;
}

/**
 * The row of live demos under a slide: each one a button opening the tool,
 * with the way back to this very slide.
 * @param props - See {@link SlideDemosProps}.
 * @returns The row, or nothing when the slide names no demo.
 */
export function SlideDemos(props: SlideDemosProps): ReactElement | null {
  const { demos, origin, renderLink, talkOrigin } = props;
  const t = useChromeT();
  const label = props.label === undefined ? t('slides.liveDemos') : props.label;
  if (demos.length === 0) return null;
  return (
    <div className="slide-demos">
      {label === null ? null : (
        <span className="slide-demos-label">{label}</span>
      )}
      {demos.map((demo, index) => (
        <Fragment key={demo.href}>
          {index === 0 ? null : (
            <span className="slide-demos-separator" aria-hidden="true">
              |
            </span>
          )}
          <DemoLink
            href={resolveTalkAddress(demo.href, talkOrigin)}
            origin={origin}
            renderLink={renderLink}
          >
            {demoLabel(demo.label)}
          </DemoLink>
        </Fragment>
      ))}
    </div>
  );
}
