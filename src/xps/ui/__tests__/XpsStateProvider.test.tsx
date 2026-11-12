import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { testSpectrum } from '../../core/__tests__/openViewer.ts';
import { XpsStateProvider } from '../XpsStateProvider.tsx';
import { useXpsEditor } from '../useXpsEditor.ts';
import { useXpsActions, useXpsEditorState } from '../xpsStateContext.ts';

const SURVEY = testSpectrum('a', 'as received, survey', '#1f77b4');
const CARBON = testSpectrum('b', 'as received, C 1s', '#d62728');

test('a provider holding its own viewer opens it on what it was given', () => {
  const markup = renderToStaticMarkup(
    <XpsStateProvider spectra={[SURVEY, CARBON]}>
      <Figures />
    </XpsStateProvider>,
  );

  expect(markup).toBe(
    '<span>2 open, a selected, spectra+peaks, 18 gestures</span>',
  );
});

test('a provider handed a viewer draws the shell from that one', () => {
  const markup = renderToStaticMarkup(<HostedViewer />);

  expect(markup).toBe(
    '<span>1 open, a selected, components, 18 gestures</span>',
  );
});

test('the state cannot be read outside a provider, and says so', () => {
  expect(() => renderToStaticMarkup(<Figures />)).toThrow(
    'The XPS viewer state was read outside an XpsStateProvider',
  );
});

test('the actions cannot be read outside a provider, and say so', () => {
  expect(() => renderToStaticMarkup(<Gestures />)).toThrow(
    'The XPS viewer actions were read outside an XpsStateProvider',
  );
});

/**
 * A viewer held by the host page and handed to the shell, as `useXpsEditor`
 * returns it.
 * @returns The shell, reading the state the host is holding.
 */
function HostedViewer() {
  const editor = useXpsEditor({ spectra: [SURVEY], panelIds: ['components'] });

  return (
    <XpsStateProvider editor={editor}>
      <Figures />
    </XpsStateProvider>
  );
}

/**
 * A shell component reading everything the two contexts offer.
 * @returns What the viewer knows, as one line.
 */
function Figures() {
  const { state } = useXpsEditorState();
  const actions = useXpsActions();
  const { spectra } = state.data;
  const { selectedId, openPanelIds } = state.view;

  return (
    <span>
      {`${spectra.length} open, ${selectedId ?? 'none'} selected, ${openPanelIds.join('+')}, ${Object.keys(actions).length} gestures`}
    </span>
  );
}

/**
 * A component that only fires actions, which is what the second context is for.
 * @returns Nothing to draw.
 */
function Gestures() {
  useXpsActions();

  return null;
}
