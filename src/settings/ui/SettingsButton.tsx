import { Button } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

import type { SettingsDialogProps } from './SettingsDialog.tsx';
import { SettingsDialog } from './SettingsDialog.tsx';

/** Props of {@link SettingsButton}. */
export interface SettingsButtonProps extends Omit<
  SettingsDialogProps,
  'isOpen' | 'onClose'
> {
  /**
   * What the gear says on hover: what the settings hold, on this site.
   * @default the chrome's `Settings`
   */
  description?: string;
}

/**
 * The gear at the end of a bar, and the settings dialog it opens.
 * @param props - The dialog's sections and workspaces, and the hover text.
 * @returns The button, and the dialog beside it.
 */
export function SettingsButton(props: SettingsButtonProps): ReactElement {
  const { description, ...dialog } = props;
  const t = useChromeT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="small"
        variant="minimal"
        icon="cog"
        aria-label={t('settings.title')}
        title={description ?? t('settings.title')}
        onClick={() => {
          setOpen(true);
        }}
      />
      <SettingsDialog
        {...dialog}
        isOpen={open}
        onClose={() => {
          setOpen(false);
        }}
      />
    </>
  );
}
