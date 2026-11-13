import type { ReactElement, ReactNode } from 'react';
import { useCallback, useContext, useMemo, useState } from 'react';
import { SelectedTotal } from 'react-science/ui';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { panelToolbarCountStyle } from '../core/panelStyles.ts';

import { FilterInput } from './FilterInput.tsx';
import type { PanelTally } from './panelSearchContext.ts';
import { PanelSearchContext, withTally } from './panelSearchContext.ts';

/**
 * One search over a whole panel: the box and the count sit in its toolbar row
 * (`<PanelSearchField>`, then `<PanelCount>` at the far end), and every list in
 * its body keeps the rows `matchesNeedle(usePanelNeedle(), …)` accepts and
 * reports them with `usePanelTally`. Put it around the toolbar and the body.
 * @param props - What it holds.
 * @param props.children - The panel: its toolbar and its body.
 * @returns The panel, searchable.
 */
export function PanelSearch(props: { children: ReactNode }): ReactElement {
  const [filter, setFilter] = useState('');
  const [tallies, setTallies] = useState<ReadonlyMap<string, PanelTally>>(
    () => new Map(),
  );
  const report = useCallback((key: string, tally: PanelTally | null) => {
    setTallies((previous) => withTally(previous, key, tally));
  }, []);
  const value = useMemo(
    () => ({ filter, setFilter, report, tallies }),
    [filter, report, tallies],
  );
  return (
    <PanelSearchContext value={value}>{props.children}</PanelSearchContext>
  );
}

/**
 * The search box of a `<PanelSearch>`, for its toolbar row: it takes the room
 * the actions leave.
 * @param props - What it says.
 * @param props.placeholder - What the empty box says is searched.
 * @returns The box, or nothing outside a `<PanelSearch>`.
 */
export function PanelSearchField(props: {
  placeholder: string;
}): ReactElement | null {
  const search = useContext(PanelSearchContext);
  if (!search) return null;
  return (
    <div className="panel-search no-print">
      <FilterInput
        value={search.filter}
        onValueChange={search.setFilter}
        placeholder={props.placeholder}
      />
    </div>
  );
}

/**
 * The count of a `<PanelSearch>`, at the far end of its toolbar row: the rows
 * listed, of all the rows, every list of the panel counted.
 * @returns The count, or nothing before any list has reported.
 */
export function PanelCount(): ReactElement | null {
  const search = useContext(PanelSearchContext);
  const t = useChromeT();
  if (!search || search.tallies.size === 0) return null;
  let shown = 0;
  let total = 0;
  for (const tally of search.tallies.values()) {
    shown += tally.shown;
    total += tally.total;
  }
  return (
    <span
      className="panel-count"
      style={panelToolbarCountStyle}
      title={t('panel.count', { shown, total })}
    >
      <SelectedTotal count={shown} total={total} />
    </span>
  );
}
