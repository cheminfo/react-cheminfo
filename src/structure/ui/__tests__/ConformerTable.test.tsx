import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { Conformer } from '../../core/conformers.ts';
import type { MolfileExport } from '../../core/molfileExport.ts';
import { ConformerTable } from '../ConformerTable.tsx';
import { RANKING_COLUMNS } from '../conformerColumns.ts';

/** A row never reads the molfile, so one empty export stands in for all. */
const MOLFILE = { data: '', version: 'v2000' } as unknown as MolfileExport;

/**
 * Butane as the search returns it: anti lowest, then the two mirror-image
 * gauche wells 0.782 kcal/mol up.
 * @returns The three conformers, most stable first.
 */
function butane(): Conformer[] {
  return [
    conformer(1, -5.076, 0),
    conformer(2, -4.294, 0.782),
    conformer(3, -4.294, 0.782),
  ];
}

/**
 * A refinement record, with the fields a table never reads filled in.
 * @param forceFieldId - The rank the conformer held before refinement.
 * @param energy - Total refined energy, kcal/mol.
 * @param relativeEnergy - Refined energy above the lowest, kcal/mol.
 * @param forceFieldEnergy - What the force field had said.
 * @returns The refinement.
 */
function refined(
  forceFieldId: number,
  energy: number,
  relativeEnergy: number,
  forceFieldEnergy: number,
): NonNullable<Conformer['refinement']> {
  return {
    forceFieldId,
    energy,
    relativeEnergy,
    dispersionEnergy: null,
    forceFieldEnergy,
    rmsd: 0.1,
    cycles: 12,
    converged: true,
  };
}

function conformer(
  id: number,
  energy: number | null,
  relativeEnergy: number | null,
  refinement: Conformer['refinement'] = null,
): Conformer {
  return { id, molfile: MOLFILE, energy, relativeEnergy, refinement };
}

test('an empty set draws nothing', () => {
  expect(renderToStaticMarkup(<ConformerTable conformers={[]} />)).toBe('');
});

test('the population column is the Boltzmann share of the relative energies', () => {
  const html = renderToStaticMarkup(<ConformerTable conformers={butane()} />);

  // 65 % anti, 17.5 % in each gauche well — the shares boltzmannShares gives.
  expect(html).toContain('65.0 %');
  expect(html).toContain('17.5 %');
});

test('the energies are labelled with a sign and the lowest reads as zero', () => {
  const html = renderToStaticMarkup(<ConformerTable conformers={butane()} />);

  expect(html).toContain('0.00');
  expect(html).toContain('+0.78');
});

test('a share too small to round is written as a bound, never as zero', () => {
  const html = renderToStaticMarkup(
    <ConformerTable conformers={[conformer(1, 0, 0), conformer(2, 20, 20)]} />,
  );

  expect(html).toContain('&lt;0.1 %');
  expect(html).not.toContain('>0%<');
});

test('a conformer without an energy takes no share', () => {
  const html = renderToStaticMarkup(
    <ConformerTable
      conformers={[conformer(1, 0, 0), conformer(2, null, null)]}
    />,
  );

  expect(html).toContain('—');
});

test('the refined ranking reads the refined energies, not the force field ones', () => {
  const conformers = [
    conformer(1, -5.076, 0, refined(1, -12.4, 1.5, -5.076)),
    conformer(2, -4.294, 0.782, refined(2, -13.9, 0, -4.294)),
  ];
  const html = renderToStaticMarkup(
    <ConformerTable conformers={conformers} ranking="refined" />,
  );

  // GFN2 puts conformer 2 lowest, so it takes the larger share — the opposite
  // of what the force field said. Reading the wrong field would print 65 %.
  expect(html).toContain('+1.50');
  expect(html).toContain('92.5 %');
  expect(html).not.toContain('+0.78');
});

test('the force-field columns keep the pre-refinement numbers beside them', () => {
  const html = renderToStaticMarkup(
    <ConformerTable
      conformers={[conformer(1, -4.294, 0, refined(2, -13.9, 0, -4.294))]}
      ranking="refined"
      columns={['id', 'relative', 'forceFieldRelative', 'forceFieldRank']}
    />,
  );

  expect(html).toContain('force field rank');
  expect(html).toContain('>2<');
});

test('the columns asked for are the columns drawn, in order', () => {
  const html = renderToStaticMarkup(
    <ConformerTable conformers={butane()} columns={RANKING_COLUMNS} />,
  );
  const headers = [...html.matchAll(/<th(?:\s[^>]*)?>(?<heading>[^<]*)</g)].map(
    (match) => match.groups?.heading,
  );

  expect(headers).toStrictEqual([
    '#',
    'share',
    'ΔE kcal/mol',
    'total kcal/mol',
  ]);
});

test('the selected row is the one marked, and only it', () => {
  const html = renderToStaticMarkup(
    <ConformerTable conformers={butane()} selectedId={2} onSelect={noop} />,
  );

  expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
  expect(html).toMatch(/data-conformer-id="2"[^>]*aria-selected="true"/);
});

test('without onSelect the rows cannot be walked with the arrows', () => {
  const html = renderToStaticMarkup(<ConformerTable conformers={butane()} />);

  expect(html).not.toMatch(/<tbody[^>]*tabindex="0"/);
});

test('with onSelect the rows can be walked with the arrows', () => {
  const html = renderToStaticMarkup(
    <ConformerTable conformers={butane()} onSelect={noop} />,
  );

  expect(html).toMatch(/<tbody[^>]*tabindex="0"/);
});

test('a row that is not the selected one offers no copy, so its click selects it', () => {
  const html = renderToStaticMarkup(
    <ConformerTable conformers={butane()} selectedId={1} onSelect={noop} />,
  );

  // A copy stops the click at the cell, so only the selected row may carry one
  // — otherwise clicking a conformer would copy a number instead of picking it.
  const copyable = html.match(/<td[^>]*tabindex="0"/g) ?? [];

  expect(copyable).toHaveLength(1);
});

test('an energy is copyable and a rank is not', () => {
  const html = renderToStaticMarkup(
    <ConformerTable
      conformers={[conformer(1, -4.294, 0, refined(2, -13.9, 0, -4.294))]}
      ranking="refined"
      columns={['id', 'relative', 'forceFieldRank']}
    />,
  );

  // No onSelect, so there is no row click to protect and the energy copies.
  expect(html.match(/<td[^>]*tabindex="0"/g)).toHaveLength(1);
});

/** A selection handler that does nothing, so the table becomes a tab stop. */
function noop(): void {
  // The test asserts on markup, never on what a click does.
}

test('a row and its cells carry the hooks an end-to-end suite selects on', () => {
  const html = renderToStaticMarkup(
    <ConformerTable conformers={butane()} selectedId={2} onSelect={noop} />,
  );

  expect(html).toMatch(/data-conformer-id="2"[^>]*data-selected="true"/);
  expect(html.match(/data-selected="false"/g)).toHaveLength(2);
  expect(html).toContain('data-testid="conformer-relative-energy"');
  expect(html).toContain('data-testid="conformer-population"');
});

test('a picker can name its rows and rename a heading', () => {
  const html = renderToStaticMarkup(
    <ConformerTable
      conformers={butane()}
      rowName={(id) => `Conformer ${id}`}
      columnLabels={{ id: '' }}
    />,
  );

  expect(html).toContain('Conformer 1');
  expect(html).toContain('Conformer 3');
  expect(html).not.toContain('>#<');
});
