import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { SvgLogoDoi } from 'cheminfo-font';
import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import { copyCitation } from '../core/clipboard.ts';
import type { CitationFormat } from '../core/formats.ts';
import { CITATION_DOWNLOADS, CITATION_FORMATS } from '../core/formats.ts';
import type { Reference } from '../core/reference.ts';
import { doiUrl } from '../core/reference.ts';
import type { CitationStyle } from '../core/segments.ts';
import { CITATION_STYLES } from '../core/segments.ts';

import type { CopyState } from './entries.tsx';
import { CopyEntry, DownloadEntry } from './entries.tsx';

// How long the tick replaces the clipboard glyph of an entry after a copy.
const FEEDBACK_MS = 1500;

const MENU_STYLE: CSSProperties = { minWidth: 240 };
const DOI_ICON_STYLE: CSSProperties = { width: 16, height: 16 };

export interface CitationMenuProps {
  /** The work being cited. */
  reference: Reference;
}

/**
 * What the Cite button opens: the article at its DOI, the reference copied in
 * the style a journal asks for, and the files a reference manager imports.
 * @param props - The work being cited.
 * @returns The citation menu.
 */
export function CitationMenu(props: CitationMenuProps): ReactElement {
  const { reference } = props;
  // Which entry showed feedback last, keyed `format` or `format:style`.
  const [copied, setCopied] = useState<string | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const timeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current !== null) window.clearTimeout(timeout.current);
    };
  }, []);

  function announce(key: string, failed: boolean): void {
    setCopied(key);
    setHasFailed(failed);
    if (timeout.current !== null) window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => {
      setCopied(null);
      setHasFailed(false);
    }, FEEDBACK_MS);
  }

  function copy(format: CitationFormat, style?: CitationStyle): void {
    const key = style === undefined ? format.id : `${format.id}:${style.id}`;
    copyCitation(reference, format.id, style?.id).then(
      () => {
        announce(key, false);
      },
      () => {
        // A denied clipboard permission is the usual cause, and the menu is the
        // only place the user can be told about it.
        announce(key, true);
      },
    );
  }

  function stateOf(key: string): CopyState | null {
    return copied === key ? feedback(hasFailed) : null;
  }

  return (
    <Menu className="citation-menu" style={MENU_STYLE}>
      <MenuItem
        icon={<SvgLogoDoi style={DOI_ICON_STYLE} />}
        text={`${reference.journalAbbreviation} ${reference.year}`}
        label={reference.doi}
        href={doiUrl(reference)}
        target="_blank"
        rel="noreferrer"
      />
      <MenuDivider title="Copy the reference as" />
      {CITATION_FORMATS.map((format) =>
        format.styled ? (
          <MenuItem
            key={format.id}
            icon="clipboard"
            text={format.label}
            label={format.hint}
          >
            {CITATION_STYLES.map((style) => (
              <CopyEntry
                key={style.id}
                reference={reference}
                format={format}
                style={style}
                state={stateOf(`${format.id}:${style.id}`)}
                onCopy={copy}
              />
            ))}
          </MenuItem>
        ) : (
          <CopyEntry
            key={format.id}
            reference={reference}
            format={format}
            state={stateOf(format.id)}
            onCopy={copy}
          />
        ),
      )}
      <MenuDivider title="Import into a reference manager" />
      {CITATION_DOWNLOADS.map((download) => (
        <DownloadEntry
          key={download.format}
          reference={reference}
          download={download}
        />
      ))}
    </Menu>
  );
}

function feedback(failed: boolean): CopyState {
  if (failed) {
    return { icon: 'cross', intent: 'danger', label: 'copy failed' };
  }
  return { icon: 'tick', intent: 'success', label: 'copied' };
}
