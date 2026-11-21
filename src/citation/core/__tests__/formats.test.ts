import { expect, test } from 'vitest';

import { hasCslStyle } from '../../../csl/core/cslStyles.ts';
import type { CitationFormatId } from '../formats.ts';
import { CITATION_FORMATS, formatCitation } from '../formats.ts';
import type { Reference } from '../reference.ts';
import { doiUrl } from '../reference.ts';
import { CITATION_STYLES } from '../styles.ts';

import { PAPER } from './paper.ts';

test('the plain text citation follows the ACS style by default', async () => {
  await expect(formatCitation(PAPER, 'text')).resolves.toBe(
    'Vanderveen, J. R.; Patiny, L.; Chalifoux, C. B.; Jessop, M. J.; Jessop, P. G. A Virtual Screening Approach to Identifying the Greenest Compound for a Task: Application to Switchable-Hydrophilicity Solvents. Green Chem. 2015, 17 (12), 5182–5188. https://doi.org/10.1039/C5GC01022E',
  );
});

test('every style of the menu writes the reference as its journals print it', async () => {
  const texts = await Promise.all(
    CITATION_STYLES.map((style) => formatCitation(PAPER, 'text', style.id)),
  );
  const written = Object.fromEntries(
    CITATION_STYLES.map((style, index) => [style.label, texts[index]]),
  );

  expect(written).toStrictEqual({
    ACS: 'Vanderveen, J. R.; Patiny, L.; Chalifoux, C. B.; Jessop, M. J.; Jessop, P. G. A Virtual Screening Approach to Identifying the Greenest Compound for a Task: Application to Switchable-Hydrophilicity Solvents. Green Chem. 2015, 17 (12), 5182–5188. https://doi.org/10.1039/C5GC01022E',
    Nature:
      'Vanderveen, J. R., Patiny, L., Chalifoux, C. B., Jessop, M. J. & Jessop, P. G. A virtual screening approach to identifying the greenest compound for a task: application to switchable-hydrophilicity solvents. Green Chem. 17, 5182–5188 (2015).',
    RSC: 'J. R. Vanderveen, L. Patiny, C. B. Chalifoux, M. J. Jessop and P. G. Jessop, Green Chem., 2015, 17, 5182–5188.',
    Angewandte:
      'J. R. Vanderveen, L. Patiny, C. B. Chalifoux, M. J. Jessop, P. G. Jessop, “A virtual screening approach to identifying the greenest compound for a task: application to switchable-hydrophilicity solvents,” Green Chemistry 17 (2015): 5182–5188, https://doi.org/10.1039/C5GC01022E.',
  });
});

test('the HTML citation carries the emphasis of the style', async () => {
  await expect(formatCitation(PAPER, 'html')).resolves.toBe(
    'Vanderveen, J. R.; Patiny, L.; Chalifoux, C. B.; Jessop, M. J.; Jessop, P. G. A Virtual Screening Approach to Identifying the Greenest Compound for a Task: Application to Switchable-Hydrophilicity Solvents. <i>Green Chem.</i> <b>2015</b>, <i>17</i> (12), 5182–5188. https://doi.org/10.1039/C5GC01022E',
  );
  await expect(
    formatCitation(PAPER, 'html', 'royal-society-of-chemistry'),
  ).resolves.toBe(
    'J. R. Vanderveen, L. Patiny, C. B. Chalifoux, M. J. Jessop and P. G. Jessop, <i>Green Chem.</i>, 2015, <b>17</b>, 5182–5188.',
  );
});

test('the markdown citation keeps the italics and the bold', async () => {
  await expect(formatCitation(PAPER, 'markdown')).resolves.toBe(
    'Vanderveen, J. R.; Patiny, L.; Chalifoux, C. B.; Jessop, M. J.; Jessop, P. G. A Virtual Screening Approach to Identifying the Greenest Compound for a Task: Application to Switchable-Hydrophilicity Solvents. *Green Chem.* **2015**, *17* (12), 5182–5188. https://doi.org/10.1039/C5GC01022E',
  );
});

test('the BibTeX entry is keyed on the first author and the year', async () => {
  await expect(formatCitation(PAPER, 'bibtex')).resolves.toBe(
    `@article{Vanderveen2015,
  author = {Vanderveen, J. R. and Patiny, L. and Chalifoux, C. B. and Jessop, M. J. and Jessop, P. G.},
  title = {A virtual screening approach to identifying the greenest compound for a task: application to switchable-hydrophilicity solvents},
  journal = {Green Chemistry},
  year = {2015},
  volume = {17},
  number = {12},
  pages = {5182--5188},
  publisher = {Royal Society of Chemistry},
  doi = {10.1039/C5GC01022E},
  url = {https://doi.org/10.1039/C5GC01022E},
}`,
  );
});

test('the RIS entry lists one AU line per author and ends with ER', async () => {
  const ris = await formatCitation(PAPER, 'ris');
  const lines = ris.split('\n');

  expect(lines[0]).toBe('TY  - JOUR');
  expect(lines.filter((line) => line.startsWith('AU  - '))).toStrictEqual([
    'AU  - Vanderveen, J. R.',
    'AU  - Patiny, L.',
    'AU  - Chalifoux, C. B.',
    'AU  - Jessop, M. J.',
    'AU  - Jessop, P. G.',
  ]);
  expect(lines).toContain('JO  - Green Chemistry');
  expect(lines).toContain('SP  - 5182');
  expect(lines).toContain('EP  - 5188');
  expect(lines).toContain('DO  - 10.1039/C5GC01022E');
  expect(lines).toContain('UR  - https://doi.org/10.1039/C5GC01022E');
  expect(lines.at(-1)).toBe('ER  - ');
});

test('a journal that numbers no issue writes no issue field', async () => {
  const { issue, ...unnumbered } = PAPER;

  expect(issue).toBe('12');

  const bibtex = await formatCitation(unnumbered, 'bibtex');

  expect(bibtex).not.toContain('number =');
  expect(bibtex).toContain('volume = {17},');

  const ris = await formatCitation(unnumbered, 'ris');

  expect(
    ris.split('\n').filter((line) => line.startsWith('IS  -')),
  ).toStrictEqual([]);
});

test('the DOI format is the resolvable URL', async () => {
  await expect(formatCitation(PAPER, 'doi')).resolves.toBe(
    'https://doi.org/10.1039/C5GC01022E',
  );
  expect(doiUrl(PAPER)).toBe('https://doi.org/10.1039/C5GC01022E');
});

test('plain text is not offered, an HTML copy already carries it', () => {
  expect(
    CITATION_FORMATS.map((format) => [format.id, format.styled]),
  ).toStrictEqual([
    ['html', true],
    ['markdown', true],
    ['bibtex', false],
    ['ris', false],
    ['doi', false],
  ]);
});

test('the styles of the menu are CSL styles there are', () => {
  expect(CITATION_STYLES.map((style) => style.id)).toStrictEqual([
    'american-chemical-society',
    'nature',
    'royal-society-of-chemistry',
    'angewandte-chemie',
  ]);

  for (const style of CITATION_STYLES) {
    expect(hasCslStyle(style.id)).toBe(true);
  }
});

test('a journal paginating by article number is cited on one number', async () => {
  // Journal of Cheminformatics 14, 24 (2022): an article number, so writing it
  // as `24–24` would name a range the article does not have.
  const article: Reference = {
    ...PAPER,
    journalAbbreviation: 'J. Cheminform.',
    year: 2022,
    volume: '14',
    firstPage: '24',
    lastPage: '24',
  };

  await expect(formatCitation(article, 'text')).resolves.toContain(
    'J. Cheminform. 2022, 14 (12), 24.',
  );
  await expect(formatCitation(article, 'text', 'nature')).resolves.toContain(
    'J. Cheminform. 14, 24 (2022).',
  );
  await expect(formatCitation(article, 'bibtex')).resolves.toContain(
    'pages = {24},',
  );
});

test('an unknown format or style is refused', async () => {
  await expect(
    formatCitation(PAPER, 'endnote' as CitationFormatId),
  ).rejects.toThrow('unknown citation format: endnote');
  await expect(formatCitation(PAPER, 'text', 'vancouver')).rejects.toThrow(
    'unknown citation style: vancouver',
  );
});
