import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PropertyTable } from '../PropertyTable.tsx';

test('each value is a copy target, a missing one a plain cell', () => {
  const html = renderToStaticMarkup(
    <PropertyTable
      title="Composition"
      rows={[
        { label: 'Monoisotopic mass', value: '180.0634', note: 'Da' },
        { label: 'Formula', value: <b>C6H12O6</b>, copy: 'C6H12O6' },
        { label: 'logP', value: '—' },
      ]}
    />,
  );

  expect(html).toContain('<h3 class="properties__title">Composition</h3>');
  expect(html).toContain(
    'Monoisotopic mass<span class="properties__note">Da</span>',
  );
  expect(html).toContain('Copy the Monoisotopic mass (180.0634)');
  expect(html).toContain('Copy the Formula (C6H12O6)');
  expect(html).not.toContain('Copy the logP');
});

test('a heading that is a name keeps its case, which the style sheet leaves as written', () => {
  const html = renderToStaticMarkup(
    <PropertyTable
      title="PI-Ag_2-2_0010.tif"
      titleAsWritten
      rows={[{ label: 'Size', value: '2048 × 2048 px' }]}
    />,
  );
  const css = readFileSync(
    join(import.meta.dirname, '../../../../styles/chrome.css'),
    'utf8',
  );

  expect(html).toContain(
    '<h3 class="properties__title properties__title--as-written">PI-Ag_2-2_0010.tif</h3>',
  );
  expect(
    /\.properties__title--as-written \{(?<rules>[^}]*)\}/.exec(css)?.groups
      ?.rules,
  ).toBe('\n  letter-spacing: normal;\n  text-transform: none;\n');
});

test('a group may go without a heading', () => {
  const html = renderToStaticMarkup(
    <PropertyTable rows={[{ label: 'Charge', value: 0 }]} />,
  );

  expect(html).not.toContain('<h3');
  expect(html).toContain('Copy the Charge (0)');
});

test('a heading may keep a range on one line, the label still naming the copy', () => {
  const html = renderToStaticMarkup(
    <PropertyTable
      rows={[
        {
          label: 'TIFF tags 65450–65452',
          labelContent: <span>65450–65452</span>,
          value: '0.2688 nm',
        },
      ]}
    />,
  );

  expect(html).toContain('<th scope="row"><span>65450–65452</span></th>');
  expect(html).toContain('Copy the TIFF tags 65450–65452 (0.2688 nm)');
});

test('a value breaks between its words, code anywhere', () => {
  const css = readFileSync(
    join(import.meta.dirname, '../../../../styles/chrome.css'),
    'utf8',
  );

  expect(declarationsOf(css, '.properties__table')).toStrictEqual([
    '--properties-value-inset: 22px',
    'width: 100%',
    'border-collapse: collapse',
    'font-size: 0.875rem',
  ]);
  expect(declarationsOf(css, '.properties__table td')).toStrictEqual([
    'padding: 0.3rem var(--properties-value-inset) 0.3rem 0',
    'font-variant-numeric: tabular-nums',
    'overflow-wrap: anywhere',
    'text-align: right',
    'vertical-align: top',
  ]);
  expect(declarationsOf(css, '.properties__table td code')).toStrictEqual([
    'display: inline-block',
    'max-width: 100%',
    'font-size: 0.8125rem',
    'text-align: left',
    'word-break: break-all',
  ]);
});

function declarationsOf(css: string, selector: string): string[] {
  const start = css.indexOf(`\n${selector} {\n`);
  if (start === -1) throw new Error(`no rule for ${selector}`);
  const open = css.indexOf('{', start);
  const block = css
    .slice(open + 1, css.indexOf('}', open))
    .replaceAll(/\/\*.*?\*\//gs, '');
  const declarations: string[] = [];
  for (const part of block.split(';')) {
    const declaration = part.trim();
    if (declaration !== '') declarations.push(declaration);
  }
  return declarations;
}

test('what speaks for the whole group stands under its heading, before its rows', () => {
  const html = renderToStaticMarkup(
    <PropertyTable
      title="Calibration"
      lead={<button type="button">0.2688 nm/px</button>}
      rows={[{ label: 'Pixel size', value: '0.2688 nm' }]}
    />,
  );

  expect(
    html
      .slice(0, html.indexOf('<table'))
      .replace('<section class="properties">', ''),
  ).toBe(
    '<h3 class="properties__title">Calibration</h3><div class="properties__lead"><button type="button">0.2688 nm/px</button></div>',
  );
});
