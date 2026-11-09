import { expect, test } from 'vitest';

import { readDemoMessage, readDemoName } from '../demoProtocol.ts';

test('the four messages of the protocol are read', () => {
  expect(
    readDemoMessage({ type: 'cheminfo:demo-step', step: 2 }),
  ).toStrictEqual({ type: 'cheminfo:demo-step', step: 2 });
  expect(
    readDemoMessage({ type: 'cheminfo:demo-ready', demo: 'reflux', steps: 3 }),
  ).toStrictEqual({ type: 'cheminfo:demo-ready', demo: 'reflux', steps: 3 });
  expect(
    readDemoMessage({ type: 'cheminfo:demo-done', step: 0 }),
  ).toStrictEqual({ type: 'cheminfo:demo-done', step: 0 });
  expect(
    readDemoMessage({ type: 'cheminfo:demo-failed', step: 1, reason: 'gone' }),
  ).toStrictEqual({ type: 'cheminfo:demo-failed', step: 1, reason: 'gone' });
});

test('anything else posted to the page is ignored', () => {
  expect(readDemoMessage(null)).toBeNull();
  expect(readDemoMessage('cheminfo:demo-step')).toBeNull();
  expect(
    readDemoMessage({ type: 'cheminfo:embed-height', height: 300 }),
  ).toBeNull();
  expect(readDemoMessage({ type: 'cheminfo:demo-step', step: -1 })).toBeNull();
  expect(readDemoMessage({ type: 'cheminfo:demo-step', step: 1.5 })).toBeNull();
  expect(readDemoMessage({ type: 'cheminfo:demo-ready', steps: 3 })).toBeNull();
});

test('the demo is named by the address', () => {
  expect(readDemoName('?embed=1&demo=reflux')).toBe('reflux');
  expect(readDemoName('embed=1')).toBeNull();
  expect(readDemoName('?demo=')).toBeNull();
});
