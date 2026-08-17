import { Button, NonIdealState } from '@blueprintjs/core';
import type { ReactElement } from 'react';

/** What the page shows in place of the part that failed. */
export interface ErrorFallbackProps {
  /** What was thrown, whose message is what the visitor is told. */
  error: Error;
  /**
   * Called when the visitor asks for another attempt. Left out when there is
   * nothing sensible to retry, and then no button is drawn.
   * @default undefined — no retry button
   */
  onRetry?: () => void;
  /**
   * First line, above the message.
   * @default 'Something went wrong'
   */
  title?: string;
  /**
   * Text of the retry button.
   * @default 'Try again'
   */
  retryLabel?: string;
  /**
   * Class the holder carries, so a site can reach it from its stylesheet.
   * @default undefined
   */
  className?: string;
}

/**
 * The default face of a failure: what happened, and a way out of it.
 *
 * The message is written out rather than swallowed, because a visitor who
 * reports "it says nothing" cannot be helped, whereas one who reports the
 * sentence can.
 * @param props - See {@link ErrorFallbackProps}.
 * @returns The non-ideal state.
 */
export function ErrorFallback(props: ErrorFallbackProps): ReactElement {
  const {
    error,
    onRetry,
    title = 'Something went wrong',
    retryLabel = 'Try again',
    className,
  } = props;

  return (
    <NonIdealState
      className={className}
      icon="error"
      title={title}
      description={
        error.message === '' ? 'No message was given.' : error.message
      }
      action={
        onRetry === undefined ? undefined : (
          <Button icon="refresh" text={retryLabel} onClick={onRetry} />
        )
      }
    />
  );
}
