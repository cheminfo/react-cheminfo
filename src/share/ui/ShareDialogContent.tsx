import { DialogFooter } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useRef, useState } from 'react';

import { useContainerSize } from '../../hooks/ui/useContainerSize.ts';
import type {
  ShareConfig,
  ShareParamCodecs,
  ShareParamValues,
} from '../core/index.ts';
import {
  applySharePreset,
  buildEmbedCode,
  buildShareUrl,
  findSharePreset,
  visibleShareParts,
} from '../core/index.ts';

import { ShareConfigOptions } from './ShareConfigOptions.tsx';
import type { ShareDialogProps, ShareDraft } from './ShareDialog.tsx';
import { ShareLinkBar } from './ShareLinkBar.tsx';
import { SharePanes } from './SharePanes.tsx';
import { SharePresetSummary } from './SharePresetSummary.tsx';
import { SharePresetTabs } from './SharePresetTabs.tsx';
import { SharePreview } from './SharePreview.tsx';
import { withPart } from './draft.ts';
import {
  embeddedWhenSealed,
  findPreset,
  highlightOf,
  initialDraft,
  offeredWhenOpened,
} from './shareDialogDraft.ts';
import { useSealedUrl } from './useSealedUrl.ts';

const NO_PRESETS: readonly never[] = [];

/** Width below which the two panes stop fitting side by side and become tabs. */
const TWO_PANE_WIDTH = 720;

const SECTION_STYLE: CSSProperties = { marginBottom: 14 };

/** Everything the dialog holds, minus what only its shell is concerned with. */
export type ShareDialogContentProps<
  Codecs extends ShareParamCodecs = Record<string, never>,
> = Omit<ShareDialogProps<Codecs>, 'isOpen' | 'usePortal'>;

/**
 * The share dialog's body: the options on the left — under the notice, when
 * the site gives one, so it is in view when the dialog opens — and the page
 * they write on the right, and what one does with the link in the footer,
 * never scrolled away. A copy closes the dialog, since it was what the dialog was opened for.
 * @param props - What the site's links can say, how the page is named, and the extra section.
 * @returns The body and the footer of the dialog.
 */
export function ShareDialogContent<
  Codecs extends ShareParamCodecs = Record<string, never>,
>(props: ShareDialogContentProps<Codecs>): ReactElement {
  const {
    onClose,
    vocabulary,
    presets = NO_PRESETS,
    defaultPreset,
    title,
    baseUrl,
    search,
    frameTitle,
    frameHeight,
    preview = true,
    partDescriptions = 'inline',
    notice,
    children,
  } = props;

  const address = globalThis.location;
  const base = baseUrl ?? address?.href ?? '';
  const query = search ?? address?.search ?? '';
  const [config, setConfig] = useState<ShareConfig<Codecs>>(() =>
    initialDraft(query, vocabulary, findPreset(presets, defaultPreset ?? null)),
  );
  const [sealed, setSealed] = useState(false);
  const [pointed, setPointed] = useState<string | null>(null);
  const [presetKey, setPresetKey] = useState<string | null>(
    () => findSharePreset(config, presets, vocabulary)?.key ?? null,
  );
  const body = useRef<HTMLDivElement>(null);
  const { width } = useContainerSize(body);
  // Zero until the body is first measured, and the wide layout is the one that
  // renders both panes, so nothing is missing from a first paint or a render
  // with no layout at all.
  const narrow = width > 0 && width < TWO_PANE_WIDTH;

  function setEmbed(embed: boolean): void {
    setConfig((previous) => ({ ...previous, embed }));
    // A sealed page is always embedded, so leaving the frame drops the seal.
    setSealed((previous) => previous && embed);
  }

  function setPartHidden(part: string, hidden: boolean): void {
    setConfig((previous) => ({
      ...previous,
      hidden: withPart(previous.hidden, part, hidden),
    }));
  }

  function setParam<Key extends keyof ShareParamValues<Codecs>>(
    key: Key,
    value: ShareParamValues<Codecs>[Key],
  ): void {
    setConfig((previous) => ({
      ...previous,
      params: { ...previous.params, [key]: value },
    }));
  }

  function selectPreset(key: string | null): void {
    setPresetKey(key);
    const preset = findPreset(presets, key);
    if (preset === undefined) return;
    setConfig((previous) => applySharePreset(previous, preset, vocabulary));
  }

  const draft: ShareDraft<Codecs> = {
    config,
    setEmbed,
    setPartHidden,
    setParam,
  };
  const shown = embeddedWhenSealed(config, sealed);
  const url = buildShareUrl({ base, search: query, config: shown, vocabulary });
  const { link, ready } = useSealedUrl(url, sealed);
  const frame = buildEmbedCode({
    url: link,
    title: frameTitle ?? title,
    height: frameHeight,
  });
  const onSealedChange = offeredWhenOpened(setSealed);
  const options = (
    <ShareConfigOptions
      embed={shown.embed}
      parts={visibleShareParts(vocabulary.parts, shown.embed)}
      hidden={config.hidden}
      descriptions={partDescriptions}
      onEmbedChange={setEmbed}
      sealed={sealed}
      onSealedChange={onSealedChange}
      onPartChange={setPartHidden}
      onPartPointed={setPointed}
    />
  );

  const openPreset = findPreset(presets, presetKey);
  const optionsPane = (
    <div className="share-dialog__options">
      {notice === undefined ? null : (
        <section className="share-section share-dialog__notice">
          {notice}
        </section>
      )}
      {openPreset === undefined ? (
        options
      ) : (
        <SharePresetSummary
          description={openPreset.description}
          sealed={sealed}
          descriptions={partDescriptions}
          onSealedChange={onSealedChange}
        />
      )}

      {children === undefined ? null : (
        <section className="share-section" style={SECTION_STYLE}>
          {typeof children === 'function' ? children(draft) : children}
        </section>
      )}
    </div>
  );

  const previewPane = preview ? (
    <SharePreview
      url={link}
      title={frameTitle ?? title}
      highlight={highlightOf(vocabulary.parts, pointed)}
    />
  ) : null;

  return (
    <>
      <div className="share-dialog__body" ref={body}>
        {presets.length === 0 ? null : (
          <div className="share-dialog__top">
            <SharePresetTabs
              presets={presets}
              selected={presetKey}
              onSelect={selectPreset}
            />
          </div>
        )}

        <SharePanes
          options={optionsPane}
          preview={previewPane}
          narrow={narrow}
        />
      </div>
      <DialogFooter
        actions={
          <ShareLinkBar
            url={link}
            frame={frame}
            disabled={!ready}
            onCopied={onClose}
          />
        }
      />
    </>
  );
}
