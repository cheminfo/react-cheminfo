/**
 * The signal one attempt runs under: the caller's, and its own deadline.
 * @param signal - The caller's, if any.
 * @param timeoutMs - How long the attempt may take.
 * @returns The signal.
 */
export function requestSignal(
  signal: AbortSignal | undefined,
  timeoutMs: number,
): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal === undefined ? timeout : AbortSignal.any([signal, timeout]);
}
