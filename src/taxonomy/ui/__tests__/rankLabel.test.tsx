import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { TAXON_RANKS } from '../../core/ranks.ts';
import { useRankLabel } from '../rankLabel.ts';

/**
 * Write the labels of some ranks, the way a site's heading would.
 * @param props - The ranks.
 * @param props.ranks - The ranks, as NCBI writes them.
 * @returns The labels, one per line.
 */
function Labels(props: { ranks: readonly string[] }) {
  const label = useRankLabel();
  return <>{props.ranks.map((rank) => label(rank)).join('\n')}</>;
}

test('a rank is named the way the chrome names it', () => {
  expect(
    renderToStaticMarkup(
      <Labels ranks={['varietas', 'forma', 'species group', 'no rank']} />,
    ),
  ).toBe('variety\nform\nspecies group\nno rank');
});

test('every rank of the hierarchy has a label, and an unknown one reads as itself', () => {
  const html = renderToStaticMarkup(
    <Labels ranks={[...TAXON_RANKS, 'superdupergenus']} />,
  );
  const labels = html.split('\n');

  expect(labels).toHaveLength(47);
  expect(labels.filter((label) => label.startsWith('taxonomy.'))).toStrictEqual(
    [],
  );
  expect(labels.at(-1)).toBe('superdupergenus');
});
