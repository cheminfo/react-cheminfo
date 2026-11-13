import { Radio, RadioGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { SaveTarget } from '../core/documentFile.ts';

/** Props of {@link SaveSettingsView}. */
export interface SaveSettingsViewProps {
  /** The places this browser offers. */
  targets: readonly SaveTarget[];
  /** Where Ctrl+S keeps a new document; `undefined` asks each time. */
  value: SaveTarget | undefined;
  /** The folder new documents go in, when one was chosen. */
  folder: string | undefined;
  /** Changes where Ctrl+S keeps a new document. */
  onChange: (target: SaveTarget | undefined) => void;
}

const ASK = 'ask';

const LABELS = {
  file: 'saving.file',
  folder: 'saving.folder',
  browser: 'saving.browser',
  download: 'saving.download',
} as const satisfies Record<SaveTarget, string>;

const DESCRIPTIONS = {
  file: 'saving.fileDescription',
  folder: 'saving.folderDescription',
  browser: 'saving.browserDescription',
  download: 'saving.downloadDescription',
} as const satisfies Record<SaveTarget, string>;

/**
 * Where Ctrl+S keeps a new document, the setting of a folder panel: one of the
 * places this browser offers, or asking each time. A document already saved
 * is written where it is kept, whatever this says.
 * @param props - See {@link SaveSettingsViewProps}.
 * @returns The setting.
 */
export function SaveSettingsView(props: SaveSettingsViewProps): ReactElement {
  const { targets, value, folder, onChange } = props;
  const t = useChromeT();
  return (
    <div className="folder-panel__settings">
      <RadioGroup
        label={t('saving.settingsHeading')}
        selectedValue={value ?? ASK}
        onChange={(event) => {
          const chosen = event.currentTarget.value;
          onChange(chosen === ASK ? undefined : (chosen as SaveTarget));
        }}
      >
        {targets.map((target) => (
          <Radio
            key={target}
            value={target}
            labelElement={
              <Choice
                label={
                  target === 'folder' && folder !== undefined
                    ? t('saving.folderKnown', { folder })
                    : t(LABELS[target])
                }
                description={t(DESCRIPTIONS[target])}
              />
            }
          />
        ))}
        <Radio
          value={ASK}
          labelElement={
            <Choice
              label={t('saving.ask')}
              description={t('saving.askDescription')}
            />
          }
        />
      </RadioGroup>
    </div>
  );
}

function Choice(props: { label: string; description: string }): ReactElement {
  return (
    <span className="folder-panel__choice">
      <span>{props.label}</span>
      <span className="folder-panel__note">{props.description}</span>
    </span>
  );
}
