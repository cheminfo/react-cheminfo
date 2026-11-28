import { Button, ButtonGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { formatInteger } from '../../format/core/numbers.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';

/** Props of {@link ResultPager}. */
export interface ResultPagerProps {
  /** How many results there are, before paging. */
  total: number;
  /** How many a page holds. */
  limit: number;
  /** How many the page on screen skips. */
  offset: number;
  /** Show the page starting at this offset. */
  onOffsetChange: (offset: number) => void;
  /**
   * How many rows the page on screen shows: 0 while it is loading.
   * @default as many as the total leaves from the offset, up to the limit
   */
  shown?: number;
  /**
   * What the results are, in the plural, for `1–50 of 1,234 ligands`.
   * @default the chrome's `results`
   */
  noun?: string;
  /**
   * The narrow form: previous and next around `3 / 12`, and nothing at all
   * while every result fits on one page.
   * @default false
   */
  compact?: boolean;
}

/**
 * The pager under a table of results: which of them are on screen, and the
 * steps to the first, previous, next and last page.
 * @param props - See {@link ResultPagerProps}.
 * @returns The pager, or `null` for a compact one with a single page.
 */
export function ResultPager(props: ResultPagerProps): ReactElement | null {
  const { total, limit, offset, onOffsetChange, compact = false } = props;
  const t = useChromeT();
  const size = Math.max(1, limit);
  const lastOffset = Math.max(0, Math.floor((total - 1) / size) * size);
  const atStart = offset <= 0;
  const atEnd = offset >= lastOffset;
  const previous = () => onOffsetChange(Math.max(0, offset - size));
  const next = () => onOffsetChange(Math.min(lastOffset, offset + size));
  const pages = Math.max(1, Math.ceil(total / size));

  if (compact) {
    if (pages <= 1) return null;
    return (
      <div className="result-pager result-pager--compact">
        <Button
          size="small"
          icon="chevron-left"
          disabled={atStart}
          onClick={previous}
          title={t('pager.previous')}
          aria-label={t('pager.previous')}
        />
        <span className="result-pager__summary">
          {t('pager.page', {
            page: formatInteger(Math.floor(offset / size) + 1),
            pages: formatInteger(pages),
          })}
        </span>
        <Button
          size="small"
          icon="chevron-right"
          disabled={atEnd}
          onClick={next}
          title={t('pager.next')}
          aria-label={t('pager.next')}
        />
      </div>
    );
  }

  const shown = props.shown ?? Math.max(0, Math.min(size, total - offset));
  const noun = props.noun ?? t('pager.results');
  return (
    <div className="result-pager">
      <span className="result-pager__summary">
        {total === 0
          ? t('pager.none', { noun })
          : t('pager.range', {
              first: formatInteger(shown === 0 ? 0 : offset + 1),
              last: formatInteger(offset + shown),
              total: formatInteger(total),
              noun,
            })}
      </span>
      <ButtonGroup size="small">
        <Button
          icon="double-chevron-left"
          disabled={atStart}
          onClick={() => onOffsetChange(0)}
          title={t('pager.first')}
          aria-label={t('pager.first')}
        />
        <Button
          icon="chevron-left"
          disabled={atStart}
          onClick={previous}
          title={t('pager.previous')}
          aria-label={t('pager.previous')}
        />
        <Button
          icon="chevron-right"
          disabled={atEnd}
          onClick={next}
          title={t('pager.next')}
          aria-label={t('pager.next')}
        />
        <Button
          icon="double-chevron-right"
          disabled={atEnd}
          onClick={() => onOffsetChange(lastOffset)}
          title={t('pager.last')}
          aria-label={t('pager.last')}
        />
      </ButtonGroup>
    </div>
  );
}
