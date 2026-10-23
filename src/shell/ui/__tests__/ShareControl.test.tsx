// @vitest-environment jsdom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ShareVocabulary } from '../../../share/core/index.ts';
import { ShareControl } from '../ShareControl.tsx';

const VOCABULARY: ShareVocabulary = {
  parts: [{ key: 'hints', label: 'Hints', description: 'The hint ladder.' }],
};

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

test('the button opens the dialog, named after the page and the site', () => {
  const opened: string[] = [];
  act(() => {
    root.render(
      <ShareControl
        siteId="atoms"
        vocabulary={VOCABULARY}
        title="Electrons"
        search={() => {
          opened.push('search');
          return '?seed=42';
        }}
        onOpen={() => {
          opened.push('open');
        }}
      />,
    );
  });

  expect(document.querySelector('.share-dialog')).toBeNull();
  expect(opened).toStrictEqual([]);

  act(() => {
    host.querySelector('button')?.click();
  });

  expect(opened[0]).toBe('open');
  expect(opened).toContain('search');
  expect(document.querySelector('.share-dialog')?.textContent).toContain(
    'Share or embed — Electrons',
  );
  expect(document.body.innerHTML).toContain(
    'title="atoms.cheminfo.org — Electrons"',
  );
  expect(document.body.innerHTML).toContain('seed=42');
});

test('a page that holds the open state is told, and decides', () => {
  const changes: boolean[] = [];
  act(() => {
    root.render(
      <ShareControl
        vocabulary={VOCABULARY}
        title="Electrons"
        frameTitle="Electrons, framed"
        preview={false}
        open={false}
        onOpenChange={(open) => {
          changes.push(open);
        }}
      />,
    );
  });
  act(() => {
    host.querySelector('button')?.click();
  });

  expect(changes).toStrictEqual([true]);
  expect(document.querySelector('.share-dialog')).toBeNull();
});

class NoResizeObserver implements ResizeObserver {
  public observe(): void {
    // Nothing is measured here.
  }

  public unobserve(): void {
    // Nothing was observed.
  }

  public disconnect(): void {
    // Nothing was observed.
  }
}
