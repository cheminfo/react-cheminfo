import type { ReactElement } from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

import { frameTitle, isFamilyFrameSource } from '../core/familyFrame.ts';
import type { TalkOrigin } from '../core/index.ts';

import type { RenderSlideLink } from './DemoLink.tsx';
import { DemoLink } from './DemoLink.tsx';
import { SLIDE_SANITIZE_SCHEMA } from './slideSanitizeSchema.ts';

/** The Markdown of a slide, and where its links go. */
export interface SlideBodyProps {
  /** The Markdown source of the slide, or of one part of it. */
  body: string;
  /**
   * Which slide the body belongs to, carried by every in-app link it holds so
   * the tool a demo opens can offer the way back.
   * @default undefined
   */
  origin?: TalkOrigin;
  /**
   * The site's own link, used for the in-app links of the body.
   * @default undefined — a plain anchor
   */
  renderLink?: RenderSlideLink;
}

/**
 * Render a slide's Markdown.
 *
 * A talk is written as prose, so raw HTML in the source is kept: a slide
 * routinely holds a `<sub>`, a `<br>` or a figure the Markdown syntax cannot
 * express. That HTML is sanitised, because a deck is played on sites other than
 * the one that wrote it: scripts, event handlers and unsafe URLs are removed,
 * and a frame is drawn only when it shows a page of the family. A link to an
 * in-app route becomes a demo link; every other link leaves the deck in a tab
 * of its own, so a click during a talk never loses the slide it was made from.
 * @param props - See {@link SlideBodyProps}.
 * @returns The rendered body.
 */
export function SlideBody(props: SlideBodyProps): ReactElement {
  const { body, origin, renderLink } = props;

  return (
    <Markdown
      rehypePlugins={[rehypeRaw, [rehypeSanitize, SLIDE_SANITIZE_SCHEMA]]}
      components={{
        iframe({ src, title, width, height, allowFullScreen }) {
          if (src === undefined || !isFamilyFrameSource(src)) return null;
          return (
            <iframe
              src={src}
              title={title ?? frameTitle(src)}
              width={width}
              height={height}
              allowFullScreen={allowFullScreen}
            />
          );
        },
        a({ href, children }) {
          if (href?.startsWith('/') === true) {
            return (
              <DemoLink href={href} origin={origin} renderLink={renderLink}>
                {children}
              </DemoLink>
            );
          }
          return (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          );
        },
      }}
    >
      {body}
    </Markdown>
  );
}
