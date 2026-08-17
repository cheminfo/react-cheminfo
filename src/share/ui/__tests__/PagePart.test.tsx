import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { HiddenPartsProvider } from '../HiddenPartsProvider.tsx';
import { PagePart } from '../PagePart.tsx';
import { useIsHidden } from '../hiddenParts.ts';

function Page(): ReactElement {
  return (
    <main>
      <PagePart part="hints">
        <p>The hint ladder</p>
      </PagePart>
      <PagePart part="answers">
        <p>The correction</p>
      </PagePart>
    </main>
  );
}

function Report(): ReactElement {
  const isHidden = useIsHidden();
  return <span>{`hints:${String(isHidden('hints'))}`}</span>;
}

test('a part the link switches off is not rendered at all', () => {
  const html = renderToStaticMarkup(
    <HiddenPartsProvider hidden={['hints']}>
      <Page />
    </HiddenPartsProvider>,
  );

  expect(html).toBe('<main><p>The correction</p></main>');
});

test('a page under no provider hides nothing', () => {
  const html = renderToStaticMarkup(<Page />);

  expect(html).toBe('<main><p>The hint ladder</p><p>The correction</p></main>');
});

test('a provider that switches nothing off leaves the page whole', () => {
  const html = renderToStaticMarkup(
    <HiddenPartsProvider>
      <Page />
    </HiddenPartsProvider>,
  );

  expect(html).toBe('<main><p>The hint ladder</p><p>The correction</p></main>');
});

test('a part the vocabulary never listed is simply visible', () => {
  const html = renderToStaticMarkup(
    <HiddenPartsProvider hidden={['diagram']}>
      <Page />
    </HiddenPartsProvider>,
  );

  expect(html).toBe('<main><p>The hint ladder</p><p>The correction</p></main>');
});

test('a component asks the configuration rather than being handed it', () => {
  const hidden = renderToStaticMarkup(
    <HiddenPartsProvider hidden={['hints', 'answers']}>
      <Report />
    </HiddenPartsProvider>,
  );
  const shown = renderToStaticMarkup(
    <HiddenPartsProvider hidden={['answers']}>
      <Report />
    </HiddenPartsProvider>,
  );

  expect(hidden).toBe('<span>hints:true</span>');
  expect(shown).toBe('<span>hints:false</span>');
});
