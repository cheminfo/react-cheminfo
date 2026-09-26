import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

/** A worked example under a piece of help: the construct, and what it does. */
export interface HelpExample {
  /** The construct itself, shown in monospace. */
  code: string;
  /**
   * What the construct is applied to, when showing it alone is half a
   * demonstration.
   * @default undefined
   */
  input?: string;
  /**
   * One line saying what the example demonstrates.
   * @default undefined
   */
  note?: string;
}

/** Everything a piece of help says, wherever it is shown. */
export interface HelpContent {
  /**
   * First line, in bold: what the thing is, not what its label already says.
   * @default undefined — the body stands on its own, as a plain tooltip does
   */
  title?: string;
  /**
   * The explanation: one or two sentences, or any content of the site's own.
   * @default undefined
   */
  body?: ReactNode;
  /**
   * A concrete case, or several read in order, because a definition without
   * one is what makes a reader give up.
   * @default undefined
   */
  example?: HelpExample | readonly HelpExample[];
  /**
   * Where the full documentation lives, offered as a "Learn more" link.
   * @default undefined
   */
  link?: string;
}

/** What {@link HelpBody} draws. */
export interface HelpBodyProps {
  /** The help to render. */
  content: HelpContent;
  /**
   * How wide the body is allowed to be, in pixels. A tooltip needs a cap; a
   * dialog does not.
   * @default 280
   */
  width?: number;
  /**
   * Class names added to the root element, after the component's own.
   * @default undefined
   */
  className?: string;
}

/**
 * The one rendering of a piece of help.
 *
 * A tooltip, a glyph and a toolbar button all draw this, so a construct
 * documented once reads identically wherever it is referenced and cannot drift
 * between two of its mentions.
 * @param props - See {@link HelpBodyProps}.
 * @returns The help body.
 */
export function HelpBody(props: HelpBodyProps): ReactElement {
  const { className, content, width = DEFAULT_WIDTH } = props;
  const t = useChromeT();
  const { title, body, example, link } = content;

  return (
    <div
      className={joinClassNames('help-body', className)}
      style={{ ...BODY_STYLE, maxWidth: width }}
    >
      {title === undefined ? null : <div style={TITLE_STYLE}>{title}</div>}
      {body === undefined ? null : <div style={TEXT_STYLE}>{body}</div>}
      {examplesOf(example).map((item) => (
        <div key={exampleKey(item)} style={EXAMPLE_STYLE}>
          <code style={CODE_STYLE}>{item.code}</code>
          {item.input === undefined ? null : (
            <div style={INPUT_STYLE}>
              {t('help.on')} <code style={CODE_STYLE}>{item.input}</code>
            </div>
          )}
          {item.note === undefined ? null : (
            <div style={NOTE_STYLE}>{item.note}</div>
          )}
        </div>
      ))}
      {link === undefined ? null : (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          style={LINK_STYLE}
        >
          {t('help.learnMore')}
        </a>
      )}
    </div>
  );
}

// Two examples are only the same when all three of their parts are, and a help
// that repeats one example has nothing to gain from drawing it twice.
function exampleKey(example: HelpExample): string {
  return `${example.code}\n${example.input ?? ''}\n${example.note ?? ''}`;
}

function examplesOf(example: HelpContent['example']): readonly HelpExample[] {
  if (example === undefined) return [];
  if ('code' in example) return [example];
  const seen = new Set<string>();
  const unique: HelpExample[] = [];
  for (const item of example) {
    const key = exampleKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

/** How wide a piece of help is drawn when the caller does not say. */
const DEFAULT_WIDTH = 280;

const BODY_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
} as const satisfies CSSProperties;

const TITLE_STYLE = { fontWeight: 600 } as const satisfies CSSProperties;

const TEXT_STYLE = {
  fontWeight: 400,
  lineHeight: 1.45,
} as const satisfies CSSProperties;

const EXAMPLE_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  fontWeight: 400,
} as const satisfies CSSProperties;

const CODE_STYLE = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
} as const satisfies CSSProperties;

const INPUT_STYLE = { fontSize: 12 } as const satisfies CSSProperties;

const NOTE_STYLE = {
  fontSize: 12,
  fontStyle: 'italic',
} as const satisfies CSSProperties;

const LINK_STYLE = { fontWeight: 400 } as const satisfies CSSProperties;
