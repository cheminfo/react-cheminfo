import { Button, DialogFooter } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useRef, useState } from 'react';

import { useContainerSize } from '../../hooks/ui/useContainerSize.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type {
  HideablePart,
  ShareConfig,
  ShareParamCodecs,
  ShareParamValues,
  SharePreset,
  ShareVocabulary,
} from '../core/index.ts';
import {
  applySharePreset,
  buildEmbedCode,
  buildShareUrl,
  findSharePreset,
  isShareConfigured,
  parseShareConfig,
  suggestedShareConfig,
  visibleShareParts,
} from '../core/index.ts';

import { ShareConfigOptions } from './ShareConfigOptions.tsx';
import type { ShareDialogProps, ShareDraft } from './ShareDialog.tsx';
import { ShareLinkBar } from './ShareLinkBar.tsx';
import { SharePanes } from './SharePanes.tsx';
import { SharePresetTabs } from './SharePresetTabs.tsx';
import { SharePreview } from './SharePreview.tsx';
import { withPart } from './draft.ts';

const NO_PRESETS: readonly never[] = [];

/** Width below which the two panes stop fitting side by side and become tabs. */
const TWO_PANE_WIDTH = 720;

const SECTION_STYLE: CSSProperties = { marginBottom: 14 };

/** Everything the dialog holds, minus what only its shell is concerned with. */
export type ShareDialogContentProps<
  Codecs extends ShareParamCodecs = Record<string, never>,
> = Omit<ShareDialogProps<Codecs>, 'isOpen' | 'usePortal'>;

/**
 * The share dialog's body: what one does with the link above, never scrolled
 * away, then the options on the left and the page they write on the right.
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
    children,
  } = props;
  const t = useChromeT();

  const address = globalThis.location;
  const base = baseUrl ?? address?.href ?? '';
  const query = search ?? address?.search ?? '';
  const [config, setConfig] = useState<ShareConfig<Codecs>>(() =>
    initialDraft(query, vocabulary, findPreset(presets, defaultPreset ?? null)),
  );
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
  const url = buildShareUrl({ base, search: query, config, vocabulary });
  const frame = buildEmbedCode({
    url,
    title: frameTitle ?? title,
    height: frameHeight,
  });
  const options = (
    <ShareConfigOptions
      embed={config.embed}
      parts={visibleShareParts(vocabulary.parts, config.embed)}
      hidden={config.hidden}
      descriptions={partDescriptions}
      onEmbedChange={setEmbed}
      onPartChange={setPartHidden}
      onPartPointed={setPointed}
    />
  );

  const openPreset = findPreset(presets, presetKey);
  const optionsPane = (
    <div className="share-dialog__options">
      {openPreset === undefined ? (
        options
      ) : (
        <p className="share-dialog__preset">{openPreset.description}</p>
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
      url={url}
      title={frameTitle ?? title}
      highlight={highlightOf(vocabulary.parts, pointed)}
    />
  ) : null;

  return (
    <>
      <div className="share-dialog__body" ref={body}>
        <div className="share-dialog__top">
          {presets.length === 0 ? null : (
            <SharePresetTabs
              presets={presets}
              selected={presetKey}
              onSelect={selectPreset}
            />
          )}
          <ShareLinkBar url={url} frame={frame} />
        </div>

        <SharePanes
          options={optionsPane}
          preview={previewPane}
          narrow={narrow}
        />
      </div>
      <DialogFooter
        actions={
          <Button intent="primary" text={t('share.done')} onClick={onClose} />
        }
      />
    </>
  );
}

function initialDraft<Codecs extends ShareParamCodecs>(
  search: string,
  vocabulary: ShareVocabulary<Codecs>,
  preset: SharePreset<Codecs> | undefined,
): ShareConfig<Codecs> {
  const current = parseShareConfig(search, vocabulary);
  if (isShareConfigured(current, vocabulary)) return current;
  const suggested = suggestedShareConfig(vocabulary);
  return preset === undefined
    ? suggested
    : applySharePreset(suggested, preset, vocabulary);
}

// The name in the list and the box on the page are the same thing, so the
// preview is told what the reader is pointing at rather than a key it would
// have to look a name up for.
function highlightOf(
  parts: readonly HideablePart[],
  pointed: string | null,
): { part: string; label: string } | null {
  if (pointed === null) return null;
  for (const part of parts) {
    if (part.key === pointed) return { part: part.key, label: part.label };
  }
  return null;
}

function findPreset<Codecs extends ShareParamCodecs>(
  presets: ReadonlyArray<SharePreset<Codecs>>,
  key: string | null,
): SharePreset<Codecs> | undefined {
  if (key === null) return undefined;
  for (const preset of presets) {
    if (preset.key === key) return preset;
  }
  return undefined;
}
