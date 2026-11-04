import type { ReactElement } from 'react';
import { Toolbar } from 'react-science/ui';

import { useChromeT } from '../../i18n/ui/useT.ts';

import type { PanelSettings } from './usePanelSettings.ts';

/** Props of {@link PanelSettingsButton}. */
export interface PanelSettingsButtonProps extends PanelSettings {
  /** The panel's title, to name the buttons. */
  panel: string;
}

/**
 * The gear that turns a panel over to its settings, at the end of the panel's
 * toolbar row. While the settings are shown it gives way to a green tick that
 * keeps them and a red cross that cancels the changes, so the way back always
 * says what it does to them.
 *
 * Fed by `usePanelSettings`, which remembers the settings on opening
 * and puts them back on cancelling.
 * @param props - See {@link PanelSettingsButtonProps}.
 * @returns The toolbar.
 */
export function PanelSettingsButton(
  props: PanelSettingsButtonProps,
): ReactElement {
  const { panel, isOpen, onOpen, onConfirm, onCancel } = props;
  const t = useChromeT();
  return (
    <div className="no-print" style={{ display: 'contents' }}>
      <Toolbar aria-label={t('panel.settingsToolbar', { panel })}>
        {isOpen ? (
          <>
            <Toolbar.Item
              icon="tick"
              intent="success"
              tooltip={t('panel.settingsKeepTooltip')}
              aria-label={t('panel.settingsKeep', { panel })}
              onClick={onConfirm}
            />
            <Toolbar.Item
              icon="cross"
              intent="danger"
              tooltip={t('panel.settingsCancelTooltip')}
              aria-label={t('panel.settingsCancel', { panel })}
              onClick={onCancel}
            />
          </>
        ) : (
          <Toolbar.Item
            icon="cog"
            tooltip={t('panel.settingsTooltip')}
            aria-label={t('panel.settings', { panel })}
            onClick={onOpen}
          />
        )}
      </Toolbar>
    </div>
  );
}
