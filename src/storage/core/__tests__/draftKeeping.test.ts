/**
 * A page keeps its document from an effect that must hand back its stop at
 * once, so the session's start is wrapped: a stop before the start resolves
 * stops it as soon as it has, and a framed page keeps nothing.
 */

import { expect, test } from 'vitest';

import { createDraftStatus, keepStarted } from '../draftKeeping.ts';

import { cell } from './fakeFileSystem.ts';

/**
 * A session start that records what it was asked and when it stopped.
 * @returns The start, what it saw, and the gate that lets it resolve.
 */
function recordingStart() {
  const seen: string[] = [];
  let resolve: (() => void) | undefined;
  const gate = new Promise<void>((done) => {
    resolve = done;
  });
  async function start({ linked }: { linked: boolean }) {
    seen.push(`start linked=${String(linked)}`);
    await gate;
    return () => {
      seen.push('stop');
    };
  }
  return {
    start,
    seen,
    open: () => {
      resolve?.();
    },
  };
}

// A macrotask runs once every promise queued before it has settled.
function settle(): Promise<void> {
  return new Promise((done) => {
    setTimeout(done, 0);
  });
}

test('createDraftStatus makes the three signals a drafts list reads', () => {
  const status = createDraftStatus(cell);

  expect(status.available.value).toBeUndefined();
  expect(status.settled.value).toBe(false);
  expect(status.version.value).toBe(0);
});

test('keep starts the session and its stop stops it', async () => {
  const session = recordingStart();
  const stop = keepStarted(session.start, { linked: true });
  session.open();
  await settle();
  stop();

  expect(session.seen).toStrictEqual(['start linked=true', 'stop']);
});

test('a stop before the start resolves stops the session once it has', async () => {
  const session = recordingStart();
  const stop = keepStarted(session.start, { linked: false });
  stop();
  session.open();
  await settle();

  expect(session.seen).toStrictEqual(['start linked=false', 'stop']);
});

test('a framed page keeps nothing', async () => {
  const session = recordingStart();
  const stop = keepStarted(session.start, { linked: false, framed: true });
  session.open();
  await settle();
  stop();

  expect(session.seen).toStrictEqual([]);
});

test('before runs first, and its failure does not stop the drafts', async () => {
  const session = recordingStart();
  const order: string[] = [];
  keepStarted(session.start, {
    linked: false,
    before: async () => {
      order.push('before');
      throw new Error('the old database is gone');
    },
  });
  session.open();
  await settle();

  expect(order).toStrictEqual(['before']);
  expect(session.seen).toStrictEqual(['start linked=false']);
});
