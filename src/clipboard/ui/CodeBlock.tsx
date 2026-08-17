import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { CopyButton } from './CopyButton.tsx';

/** How a code block sits on the page it is shown in. */
export type CodeBlockTone = 'default' | 'muted' | 'dark';

const HOLDER_STYLE: CSSProperties = { position: 'relative' };
const COPY_STYLE: CSSProperties = { position: 'absolute', top: 4, right: 4 };

const BASE_PRE_STYLE: CSSProperties = {
  margin: 0,
  padding: '8px 10px',
  borderRadius: 4,
  fontSize: 12,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
};

const TONE_STYLE: Record<CodeBlockTone, CSSProperties> = {
  default: {},
  muted: { background: '#f6f7f9', border: '1px solid #d3d8de' },
  dark: {
    background: '#1e293b',
    border: '1px solid #1e293b',
    color: '#e2e8f0',
  },
};

export interface CodeBlockProps {
  /** The text shown, and what the copy button hands over. */
  code: string;
  /**
   * What is drawn in place of the plain text — syntax coloured spans, for
   * instance. The code itself is still what gets copied.
   * @default undefined — the code is shown as it is
   */
  children?: ReactNode;
  /**
   * How the block is painted: nothing of its own, a light grey panel, or a
   * dark one.
   * @default 'default'
   */
  tone?: CodeBlockTone;
  /**
   * Whether a copy button sits in the corner of the block.
   * @default false
   */
  copyable?: boolean;
  /**
   * Height past which the block scrolls on its own rather than pushing what
   * follows it down the page.
   * @default undefined — the block is as tall as its content
   */
  maxHeight?: number | string;
  /**
   * Class the holder carries, in addition to `code-block`.
   * @default undefined
   */
  className?: string;
}

/**
 * A block of text to hand over: the address of a page, the markup that frames
 * it, or a sample meant to be pasted into an editor and run.
 * @param props - The code, how it is painted, and whether it can be copied.
 * @returns The code block.
 */
export function CodeBlock(props: CodeBlockProps): ReactElement {
  const {
    code,
    children,
    tone = 'default',
    copyable = false,
    maxHeight,
    className,
  } = props;

  return (
    <div className={holderClassName(tone, className)} style={HOLDER_STYLE}>
      <pre style={preStyle(tone, copyable, maxHeight)}>{children ?? code}</pre>
      {copyable ? (
        <span style={COPY_STYLE}>
          <CopyButton content={code} minimal small />
        </span>
      ) : null}
    </div>
  );
}

function holderClassName(tone: CodeBlockTone, className?: string): string {
  const names = ['code-block'];
  if (tone !== 'default') names.push(`code-block--${tone}`);
  if (className !== undefined) names.push(className);
  return names.join(' ');
}

function preStyle(
  tone: CodeBlockTone,
  copyable: boolean,
  maxHeight: number | string | undefined,
): CSSProperties {
  return {
    ...BASE_PRE_STYLE,
    ...TONE_STYLE[tone],
    // The button floats over the corner, so the text stops before it.
    ...(copyable ? { paddingRight: 42 } : {}),
    ...(maxHeight === undefined ? {} : { maxHeight, overflowY: 'auto' }),
  };
}
