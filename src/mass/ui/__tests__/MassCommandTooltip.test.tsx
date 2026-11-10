/**
 * The tooltip of one of the viewer's commands: its title, its keys, the
 * gestures that do the same thing, and what it does.
 *
 * It is read from the same table as the toolbar and the keys, so the test
 * holds it to the words and the keys a reader is told elsewhere.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { MassCommandId } from '../../core/massCommands.ts';
import { MassCommandTooltip } from '../MassCommandTooltip.tsx';

/**
 * The tooltip's words in reading order, one entry per element that holds text.
 * @param id - The command.
 * @returns The texts, the stylesheet the tooltip carries left out.
 */
function textsOf(id: MassCommandId): string[] {
  const html = renderToStaticMarkup(<MassCommandTooltip id={id} />).replaceAll(
    /<style[^>]*>.*?<\/style>/g,
    '',
  );
  return [...html.matchAll(/>(?<text>[^<]+)</g)].map(
    (match) => match.groups?.text ?? '',
  );
}

test('a command is titled, then given every key, every gesture and its purpose', () => {
  expect(textsOf('zoomIn')).toStrictEqual([
    'Zoom in',
    '+',
    '=',
    'Over the chart',
    'Scroll wheel',
    'Brings the small peaks up, scaling the intensity about zero.',
  ]);
});

test('a command with no key and no gesture says only what it does', () => {
  expect(textsOf('clear')).toStrictEqual([
    'Close every spectrum',
    'Empties the chart and starts again.',
  ]);
});
