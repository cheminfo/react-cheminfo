import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { createMassState } from '../../core/massState.ts';
import { MassStatusBar } from '../MassStatusBar.tsx';
import { createMassActions } from '../massActions.ts';
import { massStateContext } from '../massStateContext.ts';

test('a refusal is written in the family’s danger colour, its words cut as the bar’s other long items are', () => {
  const state = createMassState();
  const html = renderToStaticMarkup(
    <massStateContext.Provider
      value={{
        state: {
          ...state,
          view: { ...state.view, error: 'That file is not a spectrum.' },
        },
        visibleSpectra: [],
        selectedSpectrum: null,
        mzDecimals: 4,
        autoMzDecimals: 4,
        actions: createMassActions(() => undefined),
      }}
    >
      <MassStatusBar />
    </massStateContext.Provider>,
  );

  expect(html).toContain('color:var(--danger)');
  expect(html).toContain(
    '<span style="display:block;align-items:center;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:1">That file is not a spectrum.</span>',
  );
  expect(html).not.toContain('#C0392B');
});
