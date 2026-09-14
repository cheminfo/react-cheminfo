import type { AlertProps } from '@blueprintjs/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';

import { ConfirmButton } from '../ConfirmButton.tsx';

vi.mock('@blueprintjs/core', async (importOriginal) => {
  const blueprint = await importOriginal<Record<string, unknown>>();
  return {
    ...blueprint,
    Alert: (props: AlertProps) => (
      <div
        data-alert=""
        data-open={String(props.isOpen)}
        data-intent={props.intent}
        data-icon={typeof props.icon === 'string' ? props.icon : 'element'}
        data-confirm={props.confirmButtonText}
        data-cancel={props.cancelButtonText}
      >
        {props.children}
      </div>
    ),
  };
});

test('the button is drawn, and its alert waits closed, red, with a trash icon', () => {
  const html = renderToStaticMarkup(
    <ConfirmButton
      text="Clear all answers"
      question="Every answer is lost."
      onConfirm={() => undefined}
    />,
  );

  expect(html).toContain('Clear all answers');
  expect(html).toContain(
    '<div data-alert="" data-open="false" data-intent="danger" data-icon="trash" data-confirm="Delete" data-cancel="Cancel">Every answer is lost.</div>',
  );
});

test('the alert takes the intent and icon of the button, and its own labels', () => {
  const html = renderToStaticMarkup(
    <ConfirmButton
      text="Replace the link"
      intent="warning"
      icon="refresh"
      question="The old link stops working."
      confirmLabel="Replace"
      cancelLabel="Keep"
      onConfirm={() => undefined}
    />,
  );

  expect(html).toContain(
    'data-intent="warning" data-icon="refresh" data-confirm="Replace" data-cancel="Keep"',
  );
});

test('an intent of none still asks in red', () => {
  const html = renderToStaticMarkup(
    <ConfirmButton
      intent="none"
      question="Sure?"
      onConfirm={() => undefined}
    />,
  );

  expect(html).toContain('data-intent="danger"');
});
