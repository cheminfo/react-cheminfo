import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CollapsibleSection } from '../CollapsibleSection.tsx';

test('a section is open by default and shows its body', () => {
  const html = renderToStaticMarkup(
    <CollapsibleSection title="Spectra">
      <p>three spectra</p>
    </CollapsibleSection>,
  );

  expect(html).toContain('Spectra');
  expect(html).toContain('<p>three spectra</p>');
  expect(html).toContain('aria-expanded="true"');
  expect(html).toContain('bp6-icon-chevron-down');
});

test('a section that starts closed keeps its body out of the page', () => {
  const html = renderToStaticMarkup(
    <CollapsibleSection title="Spectra" defaultOpen={false}>
      <p>three spectra</p>
    </CollapsibleSection>,
  );

  expect(html).toContain('Spectra');
  expect(html).not.toContain('three spectra');
  expect(html).toContain('aria-expanded="false"');
  expect(html).toContain('bp6-icon-chevron-right');
});

test('a parent driving the section beats the default it was given', () => {
  const html = renderToStaticMarkup(
    <CollapsibleSection
      title="Spectra"
      defaultOpen={false}
      isOpen
      onToggle={() => null}
    >
      <p>three spectra</p>
    </CollapsibleSection>,
  );

  expect(html).toContain('<p>three spectra</p>');
  expect(html).toContain('aria-expanded="true"');
});

test('the glyph a caller picks sits next to the chevron', () => {
  const html = renderToStaticMarkup(
    <CollapsibleSection title="Ligands" icon="graph">
      <p>body</p>
    </CollapsibleSection>,
  );

  expect(html).toContain('bp6-icon-graph');
  expect(html).toContain('bp6-icon-chevron-down');
});

test('the right element sits outside the heading button', () => {
  const html = renderToStaticMarkup(
    <CollapsibleSection title="Ligands" rightElement={<span>12</span>}>
      <p>body</p>
    </CollapsibleSection>,
  );

  const heading = html.slice(
    html.indexOf('<button'),
    html.indexOf('</button>'),
  );

  expect(html).toContain('<span>12</span>');
  expect(heading).not.toContain('<span>12</span>');
});

test('the identifier and the class a site gives reach the section', () => {
  const html = renderToStaticMarkup(
    <CollapsibleSection
      title="Ligands"
      id="detail-section-ligands"
      className="detail-section"
    >
      <p>body</p>
    </CollapsibleSection>,
  );

  expect(html).toContain('id="detail-section-ligands"');
  expect(html).toContain('class="collapsible-section detail-section"');
});

test('a section with no class of its own still carries the shared one', () => {
  const html = renderToStaticMarkup(
    <CollapsibleSection title="Ligands">
      <p>body</p>
    </CollapsibleSection>,
  );

  expect(html).toContain('class="collapsible-section"');
});
