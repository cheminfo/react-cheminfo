import { expect, test } from 'vitest';

import {
  messageSession,
  messagesVersion,
  setMessageSession,
  subscribeToMessages,
} from '../session.ts';

const FORMAT = (_catalogId: string, key: string) => key;

test('setting and dropping a session is announced', () => {
  const seen: number[] = [];
  const stop = subscribeToMessages(() => seen.push(messagesVersion()));

  setMessageSession({ format: FORMAT });

  expect(messageSession()).not.toBeNull();

  setMessageSession(null);

  expect(messageSession()).toBeNull();

  stop();

  expect(seen).toHaveLength(2);
  expect(seen[1]).toBe((seen[0] ?? 0) + 1);
});

test("a session's own edits are announced, and stop being when it is dropped", () => {
  const session: { notify: (() => void) | null; stopped: number } = {
    notify: null,
    stopped: 0,
  };
  const stop = (): void => {
    session.stopped++;
  };
  setMessageSession({
    format: FORMAT,
    subscribe: (listener) => {
      session.notify = listener;
      return stop;
    },
  });

  const before = messagesVersion();
  session.notify?.();

  expect(messagesVersion()).toBe(before + 1);

  setMessageSession(null);

  expect(session.stopped).toBe(1);
});

test('a listener hears nothing once it has stopped', () => {
  let heard = 0;
  const stop = subscribeToMessages(() => heard++);
  setMessageSession({ format: FORMAT });
  stop();
  setMessageSession(null);

  expect(heard).toBe(1);
});
