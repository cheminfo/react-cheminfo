import {
  AnchorButton,
  Button,
  Checkbox,
  DialogBody,
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
  ShareVocabulary,
} from '../core/index.ts';
import {
  buildEmbedCode,
  buildShareUrl,
  isShareConfigured,
  parseShareConfig,
  suggestedShareConfig,
} from '../core/index.ts';

import type { ShareDialogProps, ShareDraft } from './ShareDialog.tsx';
import { SharePartOptions } from './SharePartOptions.tsx';
import { withPart } from './draft.ts';

const LEAD_STYLE: CSSProperties = { marginTop: 0, color: '#5b6875' };
const SECTION_STYLE: CSSProperties = { marginBottom: 18 };
const ACTIONS_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 8,
};
const HINT_STYLE: CSSProperties = {
  display: 'block',
  marginLeft: 26,
  color: '#5b6875',
  fontSize: 12,
};

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
    initialDraft(query, vocabulary),
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

  return (
    <>
      <DialogBody>
        <p style={LEAD_STYLE}>
          A link to <b>{title}</b> as you have it set up now.
        </p>

        <section className="share-section" style={SECTION_STYLE}>
          <H6>Layout</H6>
          <Checkbox
            checked={config.embed}
            label="Embed in another page"
            onChange={(event) => {
              setEmbed(event.currentTarget.checked);
            }}
          />
          <span style={HINT_STYLE}>
            Drops the site header and its navigation, so the page sits inside a
            page of your own.
          </span>
        </section>

        {vocabulary.parts.length > 0 ? (
          <section className="share-section" style={SECTION_STYLE}>
            <H6>Show on the page</H6>
            <SharePartOptions
              parts={vocabulary.parts}
              hidden={config.hidden}
              onChange={setPartHidden}
            />
          </section>
        ) : null}

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
      </DialogBody>
      <DialogFooter
        actions={<Button intent="primary" text="Done" onClick={onClose} />}
      />
    </>
  );
}

function initialDraft<Codecs extends ShareParamCodecs>(
  search: string,
  vocabulary: ShareVocabulary<Codecs>,
): ShareConfig<Codecs> {
  const current = parseShareConfig(search, vocabulary);
  return isShareConfigured(current, vocabulary)
    ? current
    : suggestedShareConfig(vocabulary);
}
