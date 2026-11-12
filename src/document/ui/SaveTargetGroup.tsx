import { Callout, Radio, RadioGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { SaveTarget } from '../../storage/core/documentFile.ts';

import { Described } from './Described.tsx';

/** Props of {@link SaveTargetGroup}. */
export interface SaveTargetGroupProps {
  /** The places offered, in the order shown. */
  targets: readonly SaveTarget[];
  /** The place picked. */
  selected: SaveTarget;
  /** Called with the place picked. */
  onSelect: (target: SaveTarget) => void;
  /**
   * The folder chosen before, said beside "In a folder".
   * @default undefined — none chosen yet
   */
  folderName?: string;
  /** Say that Chrome and Edge also save in a file or a folder. */
  otherBrowserNote: boolean;
}

const LABELS: Record<SaveTarget, [ChromeKey, ChromeKey]> = {
  file: ['saving.file', 'saving.fileDescription'],
  folder: ['saving.folder', 'saving.folderDescription'],
  browser: ['saving.browser', 'saving.browserDescription'],
  download: ['saving.download', 'saving.downloadDescription'],
};

/**
 * Where Save keeps a document: a file picked once, the site's folder, this
 * browser, or a new download each time. Only what this browser offers is
 * listed; where it offers no file, a note says which browsers do.
 * @param props - See {@link SaveTargetGroupProps}.
 * @returns The choice.
 */
export function SaveTargetGroup(props: SaveTargetGroupProps): ReactElement {
  const { targets, selected, onSelect, folderName, otherBrowserNote } = props;
  const t = useChromeT();
  return (
    <>
      {targets.length > 1 ? (
        <RadioGroup
          label={t('saving.where')}
          selectedValue={selected}
          onChange={(event) => {
            const { value } = event.currentTarget;
            const picked = targets.find((target) => target === value);
            if (picked) onSelect(picked);
          }}
        >
          {targets.map((target) => {
            const [label, description] = LABELS[target];
            const known = target === 'folder' && folderName !== undefined;
            return (
              <Radio
                key={target}
                value={target}
                labelElement={
                  <Described
                    label={
                      known
                        ? t('saving.folderKnown', { folder: folderName })
                        : t(label)
                    }
                    description={t(
                      known ? 'saving.folderKnownDescription' : description,
                    )}
                  />
                }
              />
            );
          })}
        </RadioGroup>
      ) : null}
      {otherBrowserNote ? (
        <Callout
          compact
          icon="info-sign"
          className="save-document-dialog__note"
        >
          {t('saving.otherBrowser')}
        </Callout>
      ) : null}
      {targets.length > 1 ? (
        <p className="save-document-dialog__description">
          {t('saving.remembered')}
        </p>
      ) : null}
    </>
  );
}
