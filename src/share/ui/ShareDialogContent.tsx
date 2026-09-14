import {
  AnchorButton,
  Button,
  Classes,
  DialogFooter,
  H6,
} from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { CodeBlock, CopyButton } from '../../clipboard/ui/index.ts';
import type {
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
import { SharePresetTabs } from './SharePresetTabs.tsx';
import { withPart } from './draft.ts';

const LEAD_STYLE: CSSProperties = {
  marginTop: 0,
  color: 'var(--text-muted, #5b6875)',
};
const SECTION_STYLE: CSSProperties = { marginBottom: 18 };
const ACTIONS_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 8,
};

const NO_PRESETS: readonly never[] = [];

// The dialog has a fixed height so switching preset does not resize it: the
// body takes what the header and footer leave, and scrolls.
const BODY_CLASS = `${Classes.DIALOG_BODY} ${Classes.DIALOG_BODY_SCROLL_CONTAINER}`;
const BODY_STYLE: CSSProperties = { maxHeight: 'none', minHeight: 0 };

/** Everything the dialog holds, minus what only its shell is concerned with. */
export type ShareDialogContentProps<
  Codecs extends ShareParamCodecs = Record<string, never>,
> = Omit<ShareDialogProps<Codecs>, 'isOpen' | 'usePortal'>;

/**
 * The sections of the share dialog: what the link says, what it hands out, and
 * the markup that frames it.
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
    children,
  } = props;

  const address = globalThis.location;
  const base = baseUrl ?? address?.href ?? '';
  const query = search ?? address?.search ?? '';
  const [config, setConfig] = useState<ShareConfig<Codecs>>(() =>
    initialDraft(query, vocabulary, findPreset(presets, defaultPreset ?? null)),
  );
  const [presetKey, setPresetKey] = useState<string | null>(
    () => findSharePreset(config, presets, vocabulary)?.key ?? null,
  );

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
      onEmbedChange={setEmbed}
      onPartChange={setPartHidden}
    />
  );

  return (
    <>
      <div className={BODY_CLASS} style={BODY_STYLE}>
        <p style={LEAD_STYLE}>
          A link to <b>{title}</b> as you have it set up now.
        </p>

        {presets.length === 0 ? (
          options
        ) : (
          <SharePresetTabs
            presets={presets}
            selected={presetKey}
            onSelect={selectPreset}
            custom={options}
          />
        )}

        {children === undefined ? null : (
          <section className="share-section" style={SECTION_STYLE}>
            {typeof children === 'function' ? children(draft) : children}
          </section>
        )}

        <section className="share-section" style={SECTION_STYLE}>
          <H6>Link</H6>
          <CodeBlock code={url} tone="muted" />
          <div style={ACTIONS_STYLE}>
            <CopyButton content={url} label="Copy the link" />
            <AnchorButton
              icon="share"
              text="Open in a new tab"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>
        </section>

        <section className="share-section" style={SECTION_STYLE}>
          <H6>Iframe</H6>
          <CodeBlock code={frame} tone="muted" />
          <div style={ACTIONS_STYLE}>
            <CopyButton content={frame} label="Copy the iframe" />
          </div>
        </section>
      </div>
      <DialogFooter
        actions={<Button intent="primary" text="Done" onClick={onClose} />}
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
