import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ClickToCopy } from '../../../clipboard/ui/ClickToCopy.tsx';
import { CopyButton } from '../../../clipboard/ui/CopyButton.tsx';
import { ConfirmButton } from '../../../confirm/ui/ConfirmButton.tsx';
import { TableDataButton } from '../../../delimited/ui/TableDataButton.tsx';
import { FigureDownload } from '../../../download/ui/FigureDownload.tsx';
import { HelpIcon } from '../../../help/ui/HelpIcon.tsx';
import { HelpToolbarButton } from '../../../help/ui/HelpToolbarButton.tsx';
import { NumberInput } from '../../../number/ui/NumberInput.tsx';
import { OverlayIconButton } from '../../../overlay/ui/OverlayIconButton.tsx';
import { ClearButton } from '../../../panel/ui/ClearButton.tsx';
import { ShareButton } from '../../../share/ui/ShareButton.tsx';

const CHROME_CSS = readFileSync(
  join(import.meta.dirname, '../../../../styles/chrome.css'),
  'utf8',
);

/** The controls that say nothing on paper, and what each one is called. */
const CONTROLS: ReadonlyArray<readonly [string, ReactElement]> = [
  [
    'the help entry of a toolbar',
    <HelpToolbarButton key="help" content={{ body: 'x' }} />,
  ],
  ['the button that copies a value', <CopyButton key="copy" content="H2O" />],
  [
    'the button that takes a table off the page',
    <TableDataButton key="table" rows={[['H2O']]} />,
  ],
  [
    'the button that saves a figure',
    <FigureDownload key="figure" targetId="figure" />,
  ],
  [
    'a bare glyph over a figure',
    <OverlayIconButton key="glyph" icon="cog" label="Cog" />,
  ],
  [
    'the cross that empties a box',
    <ClearButton key="clear" label="Clear" onClick={noop} />,
  ],
  [
    'the button that shares the page',
    <ShareButton key="share" onClick={noop} />,
  ],
  [
    'an action that cannot be taken back',
    <ConfirmButton
      key="confirm"
      question="Sure?"
      text="Delete"
      onConfirm={noop}
    />,
  ],
];

test.each(CONTROLS)('%s keeps itself off a print', (_name, control) => {
  expect(renderToStaticMarkup(control)).toContain('no-print');
});

test('a control a site dressed itself still keeps itself off a print', () => {
  const html = renderToStaticMarkup(
    <CopyButton content="H2O" className="terminal-button" />,
  );

  expect(html).toContain('no-print terminal-button');
});

test('the two arrows that step a number do not print, and the number does', () => {
  const html = renderToStaticMarkup(
    <NumberInput value={7} ariaLabel="Points" onChange={noop} />,
  );

  expect(html).toContain('no-print');
  expect(html).toContain('value="7"');
});

test('the question mark beside a label is hidden by its own class', () => {
  const html = renderToStaticMarkup(<HelpIcon content={{ body: 'x' }} />);

  expect(html).toContain('help-icon');
  expect(CHROME_CSS).toContain('.help-icon.help-icon.help-icon');
});

test('the glyph of a copyable value is hidden by its own class', () => {
  const html = renderToStaticMarkup(<ClickToCopy value="H2O">H2O</ClickToCopy>);

  expect(html).toContain('click-to-copy__icon');
  expect(CHROME_CSS).toContain(
    '.click-to-copy__icon.click-to-copy__icon.click-to-copy__icon',
  );
});

test('a class written three times outranks a layout rule a site may own', () => {
  // `.help-icon.bp6-popover-target` is two classes, and a site's stylesheet is
  // imported after this one, so `!important` on one class would lose the tie.
  expect(CHROME_CSS).toContain('.no-print.no-print.no-print');
});

function noop(): void {
  // Nothing happens: these are rendered, never pressed.
}
