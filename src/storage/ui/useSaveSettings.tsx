import type { ReactElement } from 'react';
import { useReducer } from 'react';

import type { PanelSettings } from '../../panel/ui/usePanelSettings.ts';
import { usePanelSettings } from '../../panel/ui/usePanelSettings.ts';
import type { SaveTarget } from '../core/documentFile.ts';
import type { DocumentSaver } from '../core/documentSaverTypes.ts';

import { SaveSettingsView } from './SaveSettingsView.tsx';
import { useFolderLabel } from './useFolderLabel.ts';

/** What {@link useSaveSettings} gives a folder panel. */
export interface SaveSettings {
  /** Spread over the `<PanelSettingsButton>` at the end of the toolbar row. */
  settings: PanelSettings;
  /** What the panel shows in place of its content while `settings.isOpen`. */
  view: ReactElement;
}

/**
 * The settings of a folder panel: where Ctrl+S keeps a new document. A choice
 * applies at once; the cross puts back the one the panel opened on.
 * @param saver - The site's saver.
 * @returns See {@link SaveSettings}.
 */
export function useSaveSettings<D>(saver: DocumentSaver<D>): SaveSettings {
  const [, refresh] = useReducer((count: number) => count + 1, 0);
  const folder = useFolderLabel(saver.folder);

  function choose(target: SaveTarget | undefined): void {
    saver.remember(target);
    refresh();
  }

  const settings = usePanelSettings<SaveTarget | undefined>({
    read: () => saver.remembered(),
    restore: choose,
  });
  const view = (
    <SaveSettingsView
      targets={saver.targets()}
      value={saver.remembered()}
      folder={folder}
      onChange={choose}
    />
  );
  return { settings, view };
}
