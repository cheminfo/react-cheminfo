import { toError } from '../../error/core/toError.ts';

/** Where an async task stands: still running, answered, or failed. */
export type AsyncState<TData> =
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'success'; data: TData; error: undefined }
  | { status: 'error'; data: undefined; error: Error };

/** The state a task starts in. */
export const ASYNC_LOADING: AsyncState<never> = {
  status: 'loading',
  data: undefined,
  error: undefined,
};

/**
 * The state after a task answered.
 * @param data - What it resolved to.
 * @returns The success state.
 */
export function asyncSucceeded<TData>(data: TData): AsyncState<TData> {
  return { status: 'success', data, error: undefined };
}

/**
 * The state after a task failed. Data already on screen is kept rather than
 * replaced by the failure of a refresh.
 * @param previous - The state before the task ran.
 * @param thrown - What it rejected with.
 * @returns The state to show.
 */
export function asyncFailed<TData>(
  previous: AsyncState<TData>,
  thrown: unknown,
): AsyncState<TData> {
  if (previous.status === 'success') return previous;
  return { status: 'error', data: undefined, error: toError(thrown) };
}
