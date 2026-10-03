import { Tab, Tabs } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

const OPTIONS_TAB = 'options';
const PREVIEW_TAB = 'preview';

export interface SharePanesProps {
  /** What the link says: the presets, the boxes, and the tool's own section. */
  options: ReactElement;
  /** The live page, or nothing when the dialog shows no preview. */
  preview: ReactElement | null;
  /** Whether the dialog is too narrow to hold the two panes side by side. */
  narrow: boolean;
}

/**
 * The options and the page they write: side by side where there is room, and
 * two tabs where there is not.
 * @param props - The two panes, and whether they still fit together.
 * @returns The panes, or the tabs holding them.
 */
export function SharePanes(props: SharePanesProps): ReactElement {
  const { options, preview, narrow } = props;
  const t = useChromeT();
  const [tab, setTab] = useState<string>(OPTIONS_TAB);

  if (preview === null) {
    return (
      <div className="share-dialog__panes share-dialog__panes--single">
        {options}
      </div>
    );
  }

  if (narrow) {
    return (
      <Tabs
        id="share-panes"
        className="share-dialog__tabs"
        animate={false}
        renderActiveTabPanelOnly
        selectedTabId={tab}
        onChange={(tabId) => {
          setTab(String(tabId));
        }}
      >
        <Tab id={OPTIONS_TAB} title={t('share.options')} panel={options} />
        <Tab id={PREVIEW_TAB} title={t('share.preview')} panel={preview} />
      </Tabs>
    );
  }

  return (
    <div className="share-dialog__panes">
      {options}
      {preview}
    </div>
  );
}
