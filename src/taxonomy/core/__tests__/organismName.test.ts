/**
 * The names below are taken as their sources wrote them — LOTUS, COCONUT,
 * NPASS, CMAUP and NP Atlas, as naturals.cheminfo.org imports them — so the
 * casing, the authorities and the strains are the ones a page really meets.
 */

import { expect, test } from 'vitest';

import type { OrganismNamePart } from '../organismName.ts';
import { splitOrganismName } from '../organismName.ts';

/**
 * A name's runs, written as `*italic*` and plain text, so a table of cases
 * reads like the name set in a book.
 * @param name - The name.
 * @returns The runs, joined.
 */
function styled(name: string): string {
  return splitOrganismName(name)
    .map((part) => (part.italic ? `*${part.text}*` : part.text))
    .join('');
}

test('a binomial is one italic run, and its runs give the name back', () => {
  expect(splitOrganismName('Penicillium chrysogenum')).toStrictEqual([
    { text: 'Penicillium chrysogenum', italic: true },
  ] satisfies OrganismNamePart[]);
  expect(splitOrganismName('Catharanthus roseus (L.) G. Don')).toStrictEqual([
    { text: 'Catharanthus roseus', italic: true },
    { text: ' (L.) G. Don', italic: false },
  ]);
  expect(splitOrganismName('')).toStrictEqual([]);
});

test('an authority and a strain stay upright', () => {
  expect(styled('Pimpinella nigra Mill.')).toBe('*Pimpinella nigra* Mill.');
  expect(styled('Monascus purpureus BCRC 38110')).toBe(
    '*Monascus purpureus* BCRC 38110',
  );
  expect(styled('Corynebacterium glutamicum SA13 [lysE putP]')).toBe(
    '*Corynebacterium glutamicum* SA13 [lysE putP]',
  );
  expect(styled('Streptomyces viridochromogenes TÃ¼ 57-1')).toBe(
    '*Streptomyces viridochromogenes* TÃ¼ 57-1',
  );
  expect(styled('Rauwolfia sellowii Muell')).toBe('*Rauwolfia sellowii* Muell');
  expect(styled('Aspergillus terreus, var. boedijnii (Blochwitz)')).toBe(
    '*Aspergillus terreus*, var. *boedijnii* (Blochwitz)',
  );
});

test('sp. and spp. leave the genus alone in italics', () => {
  expect(styled('Streptomyces sp. CHQ-64')).toBe('*Streptomyces* sp. CHQ-64');
  expect(styled('Orobanche spp.')).toBe('*Orobanche* spp.');
  expect(styled('Galium Sp')).toBe('*Galium* Sp');
  expect(styled('Streptomyces GT5/020')).toBe('*Streptomyces* GT5/020');
  expect(styled('Tibouchina')).toBe('*Tibouchina*');
});

test('an infraspecific epithet is italic, the word announcing its rank is not', () => {
  expect(styled('Pueraria montana var. montana')).toBe(
    '*Pueraria montana* var. *montana*',
  );
  expect(styled('Herbertus juniperoideus subsp. acanthelius')).toBe(
    '*Herbertus juniperoideus* subsp. *acanthelius*',
  );
  expect(styled('Veronica thymoides ssp. pseudocinerea')).toBe(
    '*Veronica thymoides* ssp. *pseudocinerea*',
  );
  expect(styled('Astilbe odontophylla Miq. var. congesta')).toBe(
    '*Astilbe odontophylla* Miq. var. *congesta*',
  );
  expect(
    styled('Brassica oleracea L. var. botrytis subvar. Cauliflora DC'),
  ).toBe('*Brassica oleracea* L. var. *botrytis* subvar. *Cauliflora* DC');
  expect(styled('Streptomyces endus subsp. aureus (NRRL 12174)')).toBe(
    '*Streptomyces endus* subsp. *aureus* (NRRL 12174)',
  );
  expect(styled('Lygos raetam var.sarcocarpa')).toBe(
    '*Lygos raetam* var.*sarcocarpa*',
  );
});

test('a serovar, a cultivar and a strain after the epithet stay upright', () => {
  expect(styled('Salmonella enterica subsp. enterica serovar anatum')).toBe(
    '*Salmonella enterica* subsp. *enterica* serovar anatum',
  );
  expect(styled('Cordyceps militaris cv.')).toBe('*Cordyceps militaris* cv.');
  expect(styled("Prunus serrulata 'Kanzan'")).toBe(
    "*Prunus serrulata* 'Kanzan'",
  );
  expect(
    styled('Streptomyces violaceus var. lunanensis var. n. No. 1289'),
  ).toBe('*Streptomyces violaceus* var. *lunanensis* var. n. No. 1289');
  expect(styled('Penicillium chrysogenum strain X')).toBe(
    '*Penicillium chrysogenum* strain X',
  );
  expect(styled('Penicillium chrysogenum species complex')).toBe(
    '*Penicillium chrysogenum* species complex',
  );
  expect(styled('Salvia incertae sedis')).toBe('*Salvia* incertae sedis');
});

test('a source that capitalises every word still writes a binomial', () => {
  expect(styled('Agave Americana')).toBe('*Agave Americana*');
  expect(styled('Isodon Shikokiana Var. Occidentalis')).toBe(
    '*Isodon Shikokiana* Var. *Occidentalis*',
  );
  expect(styled('Papaver ssp. Burseri (Crantz.) Fedde')).toBe(
    '*Papaver* ssp. *Burseri* (Crantz.) Fedde',
  );
});

test('a hybrid sign is upright between two italic names', () => {
  expect(styled('Verbena × hybrida')).toBe('*Verbena* × *hybrida*');
  expect(styled('Musa X paradisiaca')).toBe('*Musa* X *paradisiaca*');
  expect(styled('Citrus tamurana x kinokuni')).toBe(
    '*Citrus tamurana* x *kinokuni*',
  );
  expect(styled('Magnolia x Soulangeana Soulangae-Bodin.')).toBe(
    '*Magnolia* x *Soulangeana* Soulangae-Bodin.',
  );
  expect(styled('× Cupressocyparis leylandii')).toBe(
    '× *Cupressocyparis leylandii*',
  );
});

test('cf. and aff. sit upright before the epithet they qualify', () => {
  expect(styled('Penicillium cf. chrysogenum')).toBe(
    '*Penicillium* cf. *chrysogenum*',
  );
  expect(styled('Aspergillus sect. Flavi')).toBe('*Aspergillus* sect. *Flavi*');
});

test('a consortium is two names', () => {
  expect(styled('Taxus chinensis var. mairei + Papulaspora sp. symbiont')).toBe(
    '*Taxus chinensis* var. *mairei* + *Papulaspora* sp. symbiont',
  );
  expect(styled('Clostridium autoethanogenum + Clostridium kluyveri')).toBe(
    '*Clostridium autoethanogenum* + *Clostridium kluyveri*',
  );
});

test('the conventions of bacteriology and zoology are kept', () => {
  expect(styled('[Clostridium] scindens')).toBe('[*Clostridium*] *scindens*');
  expect(styled('Candidatus Liberibacter asiaticus')).toBe(
    '*Candidatus* Liberibacter asiaticus',
  );
  expect(styled('Homo sapiens neanderthalensis')).toBe(
    '*Homo sapiens neanderthalensis*',
  );
  expect(styled('G. lindblomi')).toBe('*G. lindblomi*');
  expect(styled('Schinus_molle var. Molle')).toBe(
    '*Schinus_molle* var. *Molle*',
  );
});

test('a name that does not open with a genus is left upright', () => {
  for (const name of [
    'Unknown-fungus sp. BY1',
    'Gram-negative bacterium',
    'taiwanese propolis',
    'Fungal strain F165',
    'MEXU 27095',
    'Tobacco mosaic virus',
    'Escherichia phage T4',
    'uncultured bacterium',
    'Apocynaceae spp',
    'Rosoideae incertae sedis',
    'Potentilleae',
  ]) {
    expect(splitOrganismName(name)).toStrictEqual([
      { text: name, italic: false },
    ]);
  }
});
