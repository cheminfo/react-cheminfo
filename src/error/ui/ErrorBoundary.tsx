import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

import { ErrorFallback } from './ErrorFallback.tsx';
import { toError } from './toError.ts';

/** What {@link ErrorBoundary} wraps, and what it does when that part fails. */
export interface ErrorBoundaryProps {
  /** The part of the page whose failures are caught here. */
  children: ReactNode;
  /**
   * What is drawn in place of the children once one of them has thrown. The
   * reset closes the boundary again, so a retry re-renders the children.
   * @default a non-ideal state naming the error, with a retry button
   */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /**
   * Called once with the error and the stack of components it came through, so
   * a site can report it. Anything it throws is ignored: a failing reporter
   * must not replace the failure the visitor is already looking at.
   * @default undefined — the failure is not reported anywhere
   */
  onError?: (error: Error, componentStack: string) => void;
  /**
   * First line of the default fallback.
   * @default 'Something went wrong'
   */
  title?: string;
}

/** Whether the boundary is holding an error, and which one. */
export interface ErrorBoundaryState {
  /** The error the boundary caught, or `null` while nothing has failed. */
  error: Error | null;
}

/**
 * Keep one failing part of the page from taking the whole page with it.
 *
 * A viewer that cannot start, a worker that dies, a structure that will not
 * parse: without a boundary any of these leaves a blank page carrying the
 * right title, which reads as a routing or a build defect and is neither.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  /**
   * Move the boundary into its failed state, whatever was thrown.
   * @param thrown - The value a child threw.
   * @returns The state holding it.
   */
  static getDerivedStateFromError(thrown: unknown): ErrorBoundaryState {
    return { error: toError(thrown) };
  }

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  /**
   * Hand the failure to the site's reporter, if it has one.
   * @param thrown - The value a child threw.
   * @param info - Where it came from.
   */
  override componentDidCatch(thrown: unknown, info: ErrorInfo): void {
    const { onError } = this.props;
    if (onError === undefined) return;
    try {
      onError(toError(thrown), info.componentStack ?? '');
    } catch {
      // A reporter that fails must not replace the error being shown.
    }
  }

  /** Forget the error and render the children again. */
  reset = (): void => {
    this.setState({ error: null });
  };

  /**
   * The children, or what stands in for them once one has failed.
   * @returns The rendered tree.
   */
  override render(): ReactNode {
    const { children, fallback, title } = this.props;
    const { error } = this.state;

    if (error === null) return children;
    if (fallback !== undefined) return fallback(error, this.reset);
    return <ErrorFallback error={error} title={title} onRetry={this.reset} />;
  }
}
