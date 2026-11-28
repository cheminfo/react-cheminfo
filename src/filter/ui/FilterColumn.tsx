import { Button } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

/** Props of {@link FilterColumn}. */
export interface FilterColumnProps {
  /** Whether any filter is in force, so Clear has something to take away. */
  canClear: boolean;
  /** Take every filter away. */
  onClear: () => void;
  /** The filters, one section each. */
  children: ReactNode;
  /**
   * How many filters are in force, said after the title when there are some.
   * @default undefined — the title says no count
   */
  count?: number;
  /**
   * Whether newer counts are on their way: the column says it is busy and
   * dims what will change.
   * @default false
   */
  loading?: boolean;
  /**
   * Where the column stands. `page` keeps it under the bar while the results
   * scroll past it, and folds it behind Show on a narrow window. `pane` fills
   * the pane of a split row it is given, and the site says when it folds.
   * @default 'page'
   */
  layout?: 'page' | 'pane';
  /**
   * The `data-testid` of the column.
   * @default 'filter-column'
   */
  testId?: string;
}

/**
 * Every filter of a search in one column beside what it narrows: a heading,
 * Clear, the fold a narrow window hides the filters behind, and the sections
 * the site writes. The look is `chrome.css`'s `.filter-column`.
 * @param props - See {@link FilterColumnProps}.
 * @returns The column.
 */
export function FilterColumn(props: FilterColumnProps): ReactElement {
  const {
    canClear,
    onClear,
    children,
    count,
    loading = false,
    layout = 'page',
    testId = 'filter-column',
  } = props;
  const t = useChromeT();
  // Only a narrow window folds the column, so the results are not pushed
  // below a dozen sliders; a wide one always shows it.
  const [open, setOpen] = useState(false);
  const classes = ['filter-column', `filter-column--${layout}`];
  if (open) classes.push('filter-column--open');
  if (loading) classes.push('filter-column--loading');

  return (
    <aside
      className={classes.join(' ')}
      aria-busy={loading}
      aria-label={t('filters.title')}
      data-testid={testId}
    >
      <header className="filter-column__header">
        <h2 className="filter-column__title">
          {count === undefined || count === 0
            ? t('filters.title')
            : t('filters.titleCount', { count })}
        </h2>
        <Button
          className="filter-column__fold"
          variant="minimal"
          size="small"
          icon={open ? 'chevron-up' : 'chevron-down'}
          text={open ? t('filters.hide') : t('filters.show')}
          aria-expanded={open}
          onClick={() => {
            setOpen(!open);
          }}
        />
        <Button
          variant="minimal"
          size="small"
          icon="filter-remove"
          text={t('filters.clear')}
          disabled={!canClear}
          onClick={onClear}
        />
      </header>
      <div className="filter-column__body">{children}</div>
    </aside>
  );
}
