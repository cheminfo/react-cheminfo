import { Button } from '@blueprintjs/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ActionTooltip } from '../ActionTooltip.tsx';

test('the control is rendered, and nothing is said before it is hovered', () => {
  const markup = renderToStaticMarkup(
    <ActionTooltip content="Export the structure">
      <Button icon="export" aria-label="Export the structure" />
    </ActionTooltip>,
  );

  expect(markup).toContain('aria-label="Export the structure"');
  // The tooltip is held shut by this component, not by Blueprint's own hover
  // state, so an unhovered control carries no card.
  expect(markup).not.toContain('bp6-tooltip');
});

test('the wrapper has a box of its own, which is what the card is placed against', () => {
  const markup = renderToStaticMarkup(
    <ActionTooltip content="Mouse and keyboard">
      <Button icon="help" />
    </ActionTooltip>,
  );

  expect(markup).toContain('display:inline-flex');
  expect(markup).not.toContain('display:contents');
});
