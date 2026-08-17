import type { CSSProperties, ReactElement, ReactNode } from 'react';

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
  /** First line, in bold: what the thing is, not what its label already says. */
  title: string;
  /** The explanation, one or two sentences. */
  body: ReactNode;
  /**
   * A concrete case, because a definition without one is what makes a reader
   * give up.
   * @default undefined
   */
  example?: HelpExample;
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
  const { content, width = DEFAULT_WIDTH } = props;
  const { title, body, example, link } = content;

  return (
    <div className="help-body" style={{ ...BODY_STYLE, maxWidth: width }}>
      <div style={TITLE_STYLE}>{title}</div>
      <div style={TEXT_STYLE}>{body}</div>
      {example === undefined ? null : (
        <div style={EXAMPLE_STYLE}>
          <code style={CODE_STYLE}>{example.code}</code>
          {example.input === undefined ? null : (
            <div style={INPUT_STYLE}>
              on <code style={CODE_STYLE}>{example.input}</code>
            </div>
          )}
          {example.note === undefined ? null : (
            <div style={NOTE_STYLE}>{example.note}</div>
          )}
        </div>
      )}
      {link === undefined ? null : (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          style={LINK_STYLE}
        >
          Learn more
        </a>
      )}
    </div>
  );
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
