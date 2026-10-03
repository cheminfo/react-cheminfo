import { Tab, Tabs } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { ShareParamCodecs, SharePreset } from '../core/index.ts';

const CUSTOM_TAB = 'custom';
const PRESET_TAB_PREFIX = 'preset-';

export interface SharePresetTabsProps<
  Codecs extends ShareParamCodecs = Record<string, never>,
> {
  /** The presets, in the order the tabs list them. */
  presets: ReadonlyArray<SharePreset<Codecs>>;
  /** The key of the open preset, `null` for the custom tab. */
  selected: string | null;
  /** Called with the key of the preset picked, `null` for the custom tab. */
  onSelect: (key: string | null) => void;
}

/**
 * One tab per ready-made link, then a last Custom tab for building any other
 * one.
 *
 * The strip runs the width of the dialog rather than sitting in the column of
 * options, because the choice governs the preview as much as the switches: in
 * a third of the width, four tabs wrap onto a second row and the last of them
 * — the one holding every switch — reads as an afterthought.
 * @param props - The presets, and which one is open.
 * @returns The tab strip.
 */
export function SharePresetTabs<
  Codecs extends ShareParamCodecs = Record<string, never>,
>(props: SharePresetTabsProps<Codecs>): ReactElement {
  const { presets, selected, onSelect } = props;
  const t = useChromeT();

  return (
    <Tabs
      id="share-presets"
      className="share-presets"
      animate={false}
      selectedTabId={
        selected === null ? CUSTOM_TAB : `${PRESET_TAB_PREFIX}${selected}`
      }
      onChange={(tabId) => {
        const id = String(tabId);
        onSelect(
          id.startsWith(PRESET_TAB_PREFIX)
            ? id.slice(PRESET_TAB_PREFIX.length)
            : null,
        );
      }}
    >
      {presets.map((preset) => (
        <Tab
          key={preset.key}
          id={`${PRESET_TAB_PREFIX}${preset.key}`}
          title={preset.label}
        />
      ))}
      <Tab id={CUSTOM_TAB} title={t('share.custom')} />
    </Tabs>
  );
}
