import type { ReactElement, ReactNode } from 'react';

import { isModifiedClick } from '../../chrome/ui/navItem.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import type { Taxon, TaxonLineage as Lineage } from '../core/lineage.ts';
import { genusOrBelow, principalLineage } from '../core/lineage.ts';
import { ncbiTaxonomyUrl } from '../core/ncbi.ts';

import { OrganismName } from './OrganismName.tsx';
import { rankLabel } from './rankLabel.ts';

/** What a {@link TaxonLineage} needs. */
export interface TaxonLineageProps {
  /** The lineage, from the top of the tree down to the taxon it leads to. */
  lineage: Lineage;
  /**
   * Whether only the principal ranks are shown — domain, kingdom, phylum,
   * class, order, family, genus, species — with the last taxon kept whatever
   * its rank. Off, every taxon is shown, the clades included.
   * @default true
   */
  principal?: boolean;
  /**
   * The address of a taxon's page on the site. A taxon it answers `undefined`
   * for is written as plain text, and so is every taxon without it.
   * @default undefined
   */
  taxonHref?: (taxon: Taxon) => string | undefined;
  /**
   * What the site does when a taxon's link is followed with a plain click —
   * move to its page without a reload. A modified click is left to the
   * browser, so a taxon still opens in a tab of its own.
   * @default undefined
   */
  onTaxonSelect?: (taxon: Taxon) => void;
  /**
   * Whether each taxon carries its rank as a small label over its name.
   * Without it the rank is the taxon's tooltip, and is read to a screen reader
   * after the name.
   * @default false
   */
  showRanks?: boolean;
  /**
   * Whether a link to the last taxon's page in the NCBI Taxonomy Browser
   * follows the lineage, when that taxon has an id.
   * @default false
   */
  ncbiLink?: boolean;
  /**
   * Whether the last taxon is the page being read: it is then marked as the
   * current page and is never a link.
   * @default false
   */
  current?: boolean;
  /**
   * What names the breadcrumb to a screen reader.
   * @default the catalog's "Lineage"
   */
  label?: string;
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * A lineage as a breadcrumb: the taxa from the top of the tree down, each
 * named with its rank, the last one emphasised.
 *
 * The names under a genus are set in italics as nomenclature sets them, by
 * {@link OrganismName}; the ranks are the chrome's words, translated with it.
 * @param props - See {@link TaxonLineageProps}.
 * @returns The breadcrumb, or nothing for an empty lineage.
 */
export function TaxonLineage(props: TaxonLineageProps): ReactElement | null {
  const {
    lineage,
    principal = true,
    taxonHref,
    onTaxonSelect,
    showRanks = false,
    ncbiLink = false,
    current = false,
    label,
    className,
  } = props;
  const t = useChromeT();
  const shown = principal ? principalLineage(lineage) : lineage;
  if (shown.length === 0) return null;
  const italic = genusOrBelow(shown);

  const steps: ReactNode[] = [];
  for (let index = 0; index < shown.length; index++) {
    const taxon = shown[index] as Taxon;
    const last = index === shown.length - 1;
    const rank = rankLabel(t, taxon.rank);
    const name = italic[index] ? (
      <OrganismName name={taxon.name} />
    ) : (
      taxon.name
    );
    const isCurrent = last && current;
    const href = isCurrent ? undefined : taxonHref?.(taxon);

    steps.push(
      <li
        key={`${taxon.taxId ?? ''}:${taxon.rank}:${taxon.name}`}
        className={joinClassNames(
          'taxon-lineage__taxon',
          last && 'taxon-lineage__taxon--leaf',
        )}
        title={showRanks ? undefined : rank}
      >
        <span className="taxon-lineage__step">
          {showRanks && <span className="taxon-lineage__rank">{rank}</span>}
          {href === undefined ? (
            <span
              className="taxon-lineage__name"
              aria-current={isCurrent ? 'page' : undefined}
            >
              {name}
            </span>
          ) : (
            <a
              className="taxon-lineage__name"
              href={href}
              onClick={
                onTaxonSelect === undefined
                  ? undefined
                  : (event) => {
                      if (isModifiedClick(event) || event.button !== 0) return;
                      event.preventDefault();
                      onTaxonSelect(taxon);
                    }
              }
            >
              {name}
            </a>
          )}
          {!showRanks && (
            <span className="taxon-lineage__spoken">
              {' '}
              {t('taxonomy.rankNote', { rank })}
            </span>
          )}
        </span>
        {last ? (
          ncbiLink &&
          taxon.taxId !== undefined && (
            <a
              className="taxon-lineage__ncbi"
              href={ncbiTaxonomyUrl(taxon.taxId)}
              target="_blank"
              rel="noreferrer"
              title={t('taxonomy.ncbiTitle', { name: taxon.name })}
            >
              {t('taxonomy.ncbi')}
            </a>
          )
        ) : (
          <span className="taxon-lineage__separator" aria-hidden="true">
            ›
          </span>
        )}
      </li>,
    );
  }

  return (
    <nav
      className={joinClassNames(
        'taxon-lineage',
        showRanks && 'taxon-lineage--ranks',
        className,
      )}
      aria-label={label ?? t('taxonomy.lineage')}
    >
      <ol className="taxon-lineage__list">{steps}</ol>
    </nav>
  );
}
