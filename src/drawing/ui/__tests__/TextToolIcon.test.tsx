/**
 * The text tool's icon, the same in every editor: a serif bold T.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { TextToolIcon } from '../TextToolIcon.tsx';

test('the icon is a serif bold T on a 16-unit square, in the colour of the text', () => {
  expect(renderToStaticMarkup(<TextToolIcon size={20} />)).toBe(
    '<svg class="tool-icon" width="20" height="20" viewBox="0 0 16 16" aria-hidden="true"><text x="8" y="12.5" text-anchor="middle" font-size="12" font-weight="700" font-family="Georgia, serif" fill="currentColor" stroke="none">T</text></svg>',
  );
});
