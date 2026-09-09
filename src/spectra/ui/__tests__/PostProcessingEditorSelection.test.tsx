import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { PostProcessingSettings } from '../../core/settings.ts';
import { PostProcessingEditor } from '../PostProcessingEditor.tsx';

const SPECTRUM_IDS: readonly string[] = ['first', 'second'];

/**
 * The panel as a reader sees it, for one scaling and nothing else.
 * @param scale - How every spectrum is scaled.
 * @param spectrumIds - The ids the processor holds, or undefined when it holds none.
 * @returns The whole rendered panel.
 */
function render(
  scale: PostProcessingSettings['scale'],
  spectrumIds?: readonly string[],
): string {
  return renderToStaticMarkup(
    <PostProcessingEditor
      value={{ scale }}
      problems={[]}
      spectrumIds={spectrumIds}
      onChange={() => null}
    />,
  );
}

/**
 * One menu of the panel on its own, so its selection can be read.
 * @param html - The whole rendered panel.
 * @param label - What the menu is called to a screen reader.
 * @returns The select element, or an empty string when it is not there.
 */
function menu(html: string, label: string): string {
  const found = new RegExp(
    String.raw`<select[^>]*aria-label="${label}"[\S\s]*?</select>`,
  ).exec(html);
  return found?.[0] ?? '';
}

test('the scaling in force is the option marked selected, not merely one the menu lists', () => {
  const method = menu(render({ method: 'minmax' }), 'Scaling method');

  expect(method).toContain(
    '<option value="minmax" label="Both ends" selected="">Both ends</option>',
  );
  expect(method).toContain(
    '<option value="" label="None — every spectrum is left as it is">None — every spectrum is left as it is</option>',
  );
  expect(method.match(/selected=""/g)).toHaveLength(1);
});

test('no scaling at all selects None, which is the only option the settings can mean', () => {
  const method = menu(render({}), 'Scaling method');

  expect(method).toContain(
    '<option value="" label="None — every spectrum is left as it is" selected="">None — every spectrum is left as it is</option>',
  );
  expect(method.match(/selected=""/g)).toHaveLength(1);
});

test('a scaling the processor throws on is the selected option, and None stays unselected', () => {
  const method = menu(render({ method: 'gaussian' }), 'Scaling method');

  expect(method).toContain(
    '<option value="gaussian" label="gaussian — not a scaling the processor knows" selected="">gaussian — not a scaling the processor knows</option>',
  );
  expect(method).toContain(
    '<option value="" label="None — every spectrum is left as it is">None — every spectrum is left as it is</option>',
  );
  expect(method.match(/selected=""/g)).toHaveLength(1);
});

test('a scaling spelled as upstream does not spell it is selected as itself, under its own name', () => {
  const method = menu(render({ method: 'MAX' }), 'Scaling method');

  expect(method).toContain(
    '<option value="MAX" label="MAX — Largest value" selected="">MAX — Largest value</option>',
  );
  expect(method).toContain(
    '<option value="max" label="Largest value">Largest value</option>',
  );
  expect(method.match(/selected=""/g)).toHaveLength(1);
});

test('the reference the settings name is the option marked selected among the ids held', () => {
  const reference = menu(
    render({ method: 'minmax', targetID: 'second' }, SPECTRUM_IDS),
    'Reference spectrum',
  );

  expect(reference).toBe(
    '<select aria-label="Reference spectrum"><option value="">The first spectrum the processor holds</option><option value="first">first</option><option value="second" selected="">second</option></select>',
  );
});

test('naming no reference selects the first spectrum the processor holds', () => {
  const reference = menu(
    render({ method: 'minmax' }, SPECTRUM_IDS),
    'Reference spectrum',
  );

  expect(reference).toBe(
    '<select aria-label="Reference spectrum"><option value="" selected="">The first spectrum the processor holds</option><option value="first">first</option><option value="second">second</option></select>',
  );
});

test('a reference the processor does not hold is selected too, as the last entry of the menu', () => {
  const reference = menu(
    render({ method: 'minmax', targetID: 'phantom' }, SPECTRUM_IDS),
    'Reference spectrum',
  );

  expect(reference).toBe(
    '<select aria-label="Reference spectrum"><option value="">The first spectrum the processor holds</option><option value="first">first</option><option value="second">second</option><option value="phantom" selected="">phantom — not a spectrum the processor holds</option></select>',
  );
});

test('with nothing to pick from the reference is the text of a box, still what the settings hold', () => {
  const html = render({ method: 'minmax', targetID: 'ghost' });

  expect(html).toContain(
    '<input type="text" aria-label="Reference spectrum" placeholder="the first spectrum the processor holds" spellCheck="false" autoComplete="off" class="bp6-input" value="ghost"/>',
  );
  expect(menu(html, 'Reference spectrum')).toBe('');
});
