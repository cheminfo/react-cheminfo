import { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { Disclosure } from '../useDisclosure.ts';
import { useDisclosure } from '../useDisclosure.ts';

/** Which action the probe applies once, before it reports the state. */
type Action = 'none' | 'open' | 'close' | 'toggle';

function Probe(props: { initialOpen: boolean; action: Action }) {
  const { initialOpen, action } = props;
  const disclosure = useDisclosure(initialOpen);
  const [applied, setApplied] = useState(false);

  if (!applied && action !== 'none') {
    setApplied(true);
    disclosure[action]();
  }

  return <span>{disclosure.isOpen ? 'open' : 'closed'}</span>;
}

test('a disclosure starts closed unless it is told otherwise', () => {
  expect(state(false, 'none')).toBe('closed');
  expect(state(true, 'none')).toBe('open');
});

test('open shows it, and shows it again when it already is', () => {
  expect(state(false, 'open')).toBe('open');
  expect(state(true, 'open')).toBe('open');
});

test('close hides it, and leaves it hidden when it already is', () => {
  expect(state(true, 'close')).toBe('closed');
  expect(state(false, 'close')).toBe('closed');
});

test('toggle goes the other way, whichever way it was', () => {
  expect(state(false, 'toggle')).toBe('open');
  expect(state(true, 'toggle')).toBe('closed');
});

test('a disclosure hands over the state and the three actions', () => {
  function Shape() {
    const disclosure: Disclosure = useDisclosure();

    return <span>{Object.keys(disclosure).toSorted().join(',')}</span>;
  }

  expect(renderToStaticMarkup(<Shape />)).toBe(
    '<span>close,isOpen,open,toggle</span>',
  );
});

function state(initialOpen: boolean, action: Action): string {
  const html = renderToStaticMarkup(
    <Probe initialOpen={initialOpen} action={action} />,
  );
  return html.replace('<span>', '').replace('</span>', '');
}
