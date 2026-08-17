import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ErrorBoundary } from '../ErrorBoundary.tsx';
import { ErrorFallback } from '../ErrorFallback.tsx';
import { toError } from '../toError.ts';

test('a boundary that has caught nothing renders its children', () => {
  const html = renderToStaticMarkup(
    <ErrorBoundary>
      <p>the viewer</p>
    </ErrorBoundary>,
  );

  expect(html).toBe('<p>the viewer</p>');
});

test('once it has caught something, the fallback replaces the children', () => {
  const boundary = new ErrorBoundary({ children: <p>the viewer</p> });
  boundary.state = ErrorBoundary.getDerivedStateFromError(
    new Error('the worker died'),
  );

  const html = renderToStaticMarkup(<>{boundary.render()}</>);

  expect(html).toContain('the worker died');
  expect(html).toContain('Something went wrong');
  expect(html).not.toContain('the viewer');
});

test('a site may draw the failure its own way', () => {
  const boundary = new ErrorBoundary({
    children: <p>the viewer</p>,
    fallback: (error, reset) => (
      <button type="button" onClick={reset}>
        {error.message}
      </button>
    ),
  });
  boundary.state = { error: new Error('no WebGL context') };

  expect(renderToStaticMarkup(<>{boundary.render()}</>)).toBe(
    '<button type="button">no WebGL context</button>',
  );
});

test('a thrown error moves the boundary into its failed state', () => {
  const error = new Error('the worker died');

  expect(ErrorBoundary.getDerivedStateFromError(error)).toStrictEqual({
    error,
  });
});

test('a thrown string becomes an error carrying it', () => {
  const state = ErrorBoundary.getDerivedStateFromError('no WebGL context');

  expect(state.error).toBeInstanceOf(Error);
  expect(state.error?.message).toBe('no WebGL context');
});

test('undefined and null are named rather than swallowed', () => {
  expect(toError(undefined).message).toBe('undefined was thrown');
  expect(toError(null).message).toBe('null was thrown');
  expect(toError({ code: 42 }).message).toBe('{"code":42}');
  expect(toError(404).message).toBe('404');
  expect(toError(Symbol('nope')).message).toBe(
    'an unprintable value was thrown',
  );
});

test('the reporter is given the error and the component stack', () => {
  const seen: Array<[string, string]> = [];
  const boundary = new ErrorBoundary({
    children: null,
    onError: (error, componentStack) =>
      seen.push([error.message, componentStack]),
  });

  boundary.componentDidCatch('parse failed', {
    componentStack: '\n    in Viewer',
  });

  expect(seen).toStrictEqual([['parse failed', '\n    in Viewer']]);
});

test('a reporter that throws does not replace the failure', () => {
  const boundary = new ErrorBoundary({
    children: null,
    onError: () => {
      throw new Error('the reporter is down too');
    },
  });

  expect(() =>
    boundary.componentDidCatch(new Error('boom'), { componentStack: null }),
  ).not.toThrow();
});

test('the fallback names the error and offers a way out', () => {
  const html = renderToStaticMarkup(
    <ErrorFallback
      error={new Error('the structure will not parse')}
      onRetry={() => null}
    />,
  );

  expect(html).toContain('Something went wrong');
  expect(html).toContain('the structure will not parse');
  expect(html).toContain('Try again');
});

test('a fallback with nothing to retry draws no button', () => {
  const html = renderToStaticMarkup(
    <ErrorFallback
      error={new Error('no WebGL context')}
      title="The viewer cannot start"
    />,
  );

  expect(html).toContain('The viewer cannot start');
  expect(html).toContain('no WebGL context');
  expect(html).not.toContain('Try again');
});

test('an error carrying no message still says something', () => {
  const silent = new Error('a message that is then lost');
  silent.message = '';

  const html = renderToStaticMarkup(<ErrorFallback error={silent} />);

  expect(html).toContain('No message was given.');
});
