/**
 * Listen to the messages this window receives, which is how both ends of the
 * host protocol hear each other.
 * @param listener - Called with each message.
 * @returns What stops listening.
 */
export function listenToWindow(
  listener: (event: MessageEvent) => void,
): () => void {
  globalThis.addEventListener('message', listener);
  return () => {
    globalThis.removeEventListener('message', listener);
  };
}
