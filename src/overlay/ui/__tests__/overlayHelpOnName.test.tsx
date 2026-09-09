import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { HelpContent } from '../../../help/ui/HelpBody.tsx';
import { OverlayAction } from '../OverlayAction.tsx';
import { OverlayNumber } from '../OverlayNumber.tsx';
import type { OverlayOption } from '../OverlayRow.tsx';
import { OverlaySelect } from '../OverlaySelect.tsx';

const COLOUR_BY: readonly OverlayOption[] = [
  { value: 'cluster', label: 'Cluster' },
  { value: 'species', label: 'Species' },
];

const HELP: HelpContent = {
  title: 'Colour by',
  body: 'What the dots are coloured by.',
};

// What a name wears once it is the thing carrying the explanation.
const DOTTED =
  'text-decoration:underline dotted var(--border-strong);text-underline-offset:3px;cursor:help';

test('help hangs off the name, and never off a question mark of its own', () => {
  const withHelp = renderToStaticMarkup(picker(HELP));
  const number = renderToStaticMarkup(stepper(HELP));

  expect(withHelp.match(/help-icon/g)).toBeNull();
  expect(number.match(/help-icon/g)).toBeNull();
  expect(withHelp).toContain(DOTTED);
  expect(number).toContain(DOTTED);
  expect(withHelp).toContain('>Colour by</span>');
  expect(withHelp.match(/help-name/g)).toHaveLength(1);
});

test('a name with no help behind it is written plainly, with nothing to hover', () => {
  const html = renderToStaticMarkup(picker());

  expect(html.match(/help-icon/g)).toBeNull();
  expect(html.match(/help-name/g)).toBeNull();
  expect(html).not.toContain('underline dotted');
  expect(html).not.toContain('cursor:help');
  expect(html).not.toContain('tabindex="0"');
});

test('a control whose name is not written keeps its help on its own words', () => {
  const html = renderToStaticMarkup(
    <OverlayAction text="Zoom to selection" help={HELP} onClick={() => null} />,
  );

  expect(html.match(/help-icon/g)).toBeNull();
  expect(html).not.toContain(DOTTED);
  expect(html.match(/bp6-popover-target/g)).toHaveLength(1);
  expect(html).toContain('Zoom to selection');
});

/**
 * The picker, which is the control the convention was written against.
 * @param help - What its name explains, when it explains anything.
 * @returns The picker.
 */
function picker(help?: HelpContent): ReactElement {
  return (
    <OverlaySelect
      label="Colour by"
      help={help}
      value="cluster"
      options={COLOUR_BY}
      onChange={() => null}
    />
  );
}

/**
 * The stepper, whose name is the only thing in it that can carry a sentence.
 * @param help - What its name explains.
 * @returns The stepper.
 */
function stepper(help: HelpContent): ReactElement {
  return (
    <OverlayNumber
      label="Dot size"
      help={help}
      value={5}
      min={3}
      max={12}
      onChange={() => null}
    />
  );
}
