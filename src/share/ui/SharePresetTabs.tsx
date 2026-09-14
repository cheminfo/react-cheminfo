import { Tab, Tabs } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import type { ShareParamCodecs, SharePreset } from '../core/index.ts';

const SECTION_STYLE: CSSProperties = { marginBottom: 18 };
const DESCRIPTION_STYLE: CSSProperties = {
  margin: 0,
  color: 'var(--text-muted, #5b6875)',
};

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
  /** What the custom tab holds: the boxes of the draft. */
  custom: ReactNode;
}

/**
 * One tab per preset, then a last Custom tab holding the boxes, which start
 * from whatever the preset before it set.
 * @param props - The presets, the open one, and the custom panel.
 * @returns The tab strip and the open panel.
 */
export function SharePresetTabs<
  Codecs extends ShareParamCodecs = Record<string, never>,
>(props: SharePresetTabsProps<Codecs>): ReactElement {
  const { presets, selected, onSelect, custom } = props;

  return (
    <section className="share-section" style={SECTION_STYLE}>
      <Tabs
        id="share-presets"
        className="share-presets"
        animate={false}
        renderActiveTabPanelOnly
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
            panel={<p style={DESCRIPTION_STYLE}>{preset.description}</p>}
          />
        ))}
        <Tab id={CUSTOM_TAB} title="Custom" panel={<>{custom}</>} />
      </Tabs>
    </section>
  );
}
