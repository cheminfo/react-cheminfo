import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { CopyToClipboard } from '../useCopyToClipboard.ts';
import {
  DEFAULT_COPY_RESET_AFTER,
  useCopyToClipboard,
} from '../useCopyToClipboard.ts';

test('the confirmation lasts a second and a half unless asked otherwise', () => {
  expect(DEFAULT_COPY_RESET_AFTER).toBe(1500);
});

test('nothing is confirmed before anything has been copied', () => {
  const seen: CopyToClipboard[] = [];
  const html = renderToStaticMarkup(<Probe onRender={seen.push.bind(seen)} />);

  expect(html).toBe('<span>not copied</span>');
  expect(seen).toHaveLength(1);
  expect(seen[0]?.copied).toBe(false);
  expect(typeof seen[0]?.copy).toBe('function');
});

function Probe(props: {
  onRender: (state: CopyToClipboard) => void;
}): ReactElement {
  const state = useCopyToClipboard();
  props.onRender(state);
  return <span>{state.copied ? 'copied' : 'not copied'}</span>;
}
