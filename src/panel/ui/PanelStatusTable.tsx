import { Icon, SegmentedControl } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { PanelLayout, PanelStatus } from '../core/panelLayout.ts';
import {
  PANEL_STATUSES,
  isPanelStatus,
  panelStatusOf,
  withPanelStatus,
} from '../core/panelLayout.ts';

import type { PanelDescriptor } from './SidePanelStack.tsx';

/** What {@link PanelStatusTable} lists, and what it changes. */
export interface PanelStatusTableProps<TPanel extends PanelDescriptor> {
  /** Every panel of the editor, in the order the rail stacks them. */
  panels: readonly TPanel[];
  /** Which are open, folded and hidden. */
  layout: PanelLayout<TPanel['id']>;
  /** Called with the layout once a panel's status is changed. */
  onChange: (layout: PanelLayout<TPanel['id']>) => void;
}

/**
 * Every panel of an editor and how it stands — hidden, available behind its
 * icon, shown folded, or shown open — each set with one click, for the panels
 * section of a settings dialog.
 * @param props - See {@link PanelStatusTableProps}.
 * @returns The table, and the line saying what the four mean.
 */
export function PanelStatusTable<TPanel extends PanelDescriptor>(
  props: PanelStatusTableProps<TPanel>,
): ReactElement {
  const { panels, layout, onChange } = props;
  const t = useChromeT();
  const options = PANEL_STATUSES.map((status) => ({
    value: status,
    label: t(STATUS_KEYS[status]),
  }));
  return (
    <div className="panel-status">
      <table className="panel-status__table">
        <thead>
          <tr>
            <th scope="col">{t('panels.statusHeading')}</th>
            <th scope="col" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {panels.map((panel) => (
            <tr key={panel.id} data-panel={panel.id}>
              <th scope="row">
                <span className="panel-status__name">
                  <Icon icon={panel.icon} size={14} />
                  {panel.title}
                </span>
              </th>
              <td>
                <SegmentedControl
                  size="small"
                  aria-label={t('panels.statusLabel', { panel: panel.title })}
                  options={options}
                  value={panelStatusOf(layout, panel.id)}
                  onValueChange={(value) => {
                    if (!isPanelStatus(value)) return;
                    const status: PanelStatus = value;
                    onChange(withPanelStatus(layout, panel.id, status));
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="panel-status__help">{t('panels.statusHelp')}</p>
    </div>
  );
}

const STATUS_KEYS = {
  hidden: 'panels.status.hidden',
  available: 'panels.status.available',
  folded: 'panels.status.folded',
  open: 'panels.status.open',
} as const satisfies Record<PanelStatus, ChromeKey>;
