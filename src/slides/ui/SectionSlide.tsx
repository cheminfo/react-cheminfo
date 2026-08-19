import type { ReactElement } from 'react';

import { parseSectionHeading } from '../core/index.ts';

import { SlideBody } from './SlideBody.tsx';

/** The body of a section divider. */
export interface SectionSlideProps {
  /** The Markdown body, normally starting with `# N · Title`. */
  body: string;
}

/**
 * The slide that says a new part of the talk starts here: the section number
 * set huge and near-transparent, with the title, an accent rule and whatever
 * else the body holds stacked beside it.
 *
 * The numeral is decoration, not text — the heading beside it already says
 * where the talk is — so it is hidden from a screen reader.
 * @param props - See {@link SectionSlideProps}.
 * @returns The divider slide.
 */
export function SectionSlide(props: SectionSlideProps): ReactElement {
  const { number, title, rest } = parseSectionHeading(props.body);

  return (
    <div className="slide slide--section">
      <div className="section-slide">
        <div className="section-number" aria-hidden="true">
          {number}
        </div>
        <div className="section-body">
          {title === '' ? null : <h1 className="section-title">{title}</h1>}
          <hr className="section-rule" />
          {rest === '' ? null : (
            <div className="section-sub">
              <SlideBody body={rest} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
