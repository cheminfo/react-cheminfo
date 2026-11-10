// @vitest-environment jsdom
/**
 * The link the share dialog hands out: the link itself at once, or its sealed
 * form once sealed — never a seal made for a link the dialog no longer shows.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { sealShareUrl } from '../../core/index.ts';
import type { SealedUrl } from '../useSealedUrl.ts';
import { useSealedUrl } from '../useSealedUrl.ts';

import { until } from './until.ts';

const ALKANES = 'https://isomers.cheminfo.org/exercises?formulas=C4H10O';
const ALCOHOLS = 'https://isomers.cheminfo.org/exercises?formulas=C5H12O';

let host: HTMLDivElement;
let root: Root;
const seen: SealedUrl[] = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  seen.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function Link(props: { url: string; sealed: boolean }): ReactElement {
  seen.push(useSealedUrl(props.url, props.sealed));
  return <span />;
}

function last(): SealedUrl | undefined {
  return seen.at(-1);
}

test('a link left unsealed is handed out at once, as it is', () => {
  act(() => root.render(<Link url={ALKANES} sealed={false} />));

  expect(seen).toStrictEqual([{ link: ALKANES, ready: true }]);
});

test('a sealed link is not ready until it is sealed', async () => {
  const sealed = await sealShareUrl(ALKANES);
  act(() => root.render(<Link url={ALKANES} sealed />));

  expect(seen[0]).toStrictEqual({ link: ALKANES, ready: false });

  await until(() => last()?.ready === true);

  expect(last()).toStrictEqual({ link: sealed, ready: true });
  expect(sealed).toMatch(
    /^https:\/\/isomers\.cheminfo\.org\/exercises\?s=e1\./,
  );
});

test('a seal made for the link before is never handed out for the current one', async () => {
  const sealed = await sealShareUrl(ALCOHOLS);
  act(() => root.render(<Link url={ALKANES} sealed />));
  act(() => root.render(<Link url={ALCOHOLS} sealed />));

  expect(last()).toStrictEqual({ link: ALCOHOLS, ready: false });

  await until(() => last()?.ready === true);

  expect(last()).toStrictEqual({ link: sealed, ready: true });

  act(() => root.render(<Link url={ALCOHOLS} sealed={false} />));

  expect(last()).toStrictEqual({ link: ALCOHOLS, ready: true });
});
