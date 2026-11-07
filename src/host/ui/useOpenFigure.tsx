import { Alert } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useState } from 'react';

import type { CarriedFigureState } from '../../download/core/figureState.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { FigureDestination } from '../core/figureForward.ts';
import { readOpenedFigure } from '../core/figureOpening.ts';

import { forwardFigure } from './forwardFigure.ts';

/** What {@link useOpenFigure} opens figures with. */
export interface OpenFigureOptions {
  /** The site, as the family names it and its figures name it, e.g. `3d`. */
  site: string;
  /**
   * Show a figure of the site, as it was drawn. Throwing, or rejecting, says
   * the file holds no figure the site can open.
   * @param state - The state the figure carries.
   */
  onOpen: (state: CarriedFigureState) => void | Promise<void>;
  /**
   * How this page introduces itself to a site it sends a figure on to.
   * @default the page's own host
   */
  host?: string;
  /**
   * The origin to open each site on instead of its own, as a development
   * server names its siblings running locally.
   * @default {}
   */
  origins?: Readonly<Record<string, string>>;
}

/** What {@link useOpenFigure} gives a site. */
export interface OpenFigure {
  /**
   * Open a file, picked or dropped, as a figure.
   * @param file - The file.
   */
  open: (file: File) => Promise<void>;
  /** The alert saying where a figure belongs, or why it opens nothing. */
  dialog: ReactElement;
}

type Notice =
  | { kind: 'none'; file: string }
  | { kind: 'elsewhere'; svg: string; destination: FigureDestination };

/**
 * Open the figures a site drew from a file, picked or dropped, the same way on
 * every site of the family: a figure of the site opens as it was drawn; one of
 * another site is sent on to that site, in a new tab, once the reader agrees;
 * any other file is said to hold no figure.
 * @param options - See {@link OpenFigureOptions}.
 * @returns The opener, and the alert to render beside it.
 */
export function useOpenFigure(options: OpenFigureOptions): OpenFigure {
  const { site, onOpen, host = globalThis.location?.host ?? site } = options;
  const { origins = {} } = options;
  const t = useChromeT();
  const [notice, setNotice] = useState<Notice | null>(null);

  async function open(file: File): Promise<void> {
    const opened = await readOpenedFigure(await file.text(), site, origins);
    if (opened.kind === 'elsewhere') {
      setNotice(opened);
      return;
    }
    try {
      if (opened.kind === 'none') throw new Error(file.name);
      await onOpen(opened.state);
      setNotice(null);
    } catch {
      setNotice({ kind: 'none', file: file.name });
    }
  }

  const elsewhere = notice?.kind === 'elsewhere' ? notice : null;
  const where = elsewhere ? new URL(elsewhere.destination.url).host : '';
  const dialog = (
    <Alert
      isOpen={notice !== null}
      icon={elsewhere ? 'share' : 'document'}
      intent={elsewhere ? 'primary' : 'none'}
      canEscapeKeyCancel
      canOutsideClickCancel
      cancelButtonText={elsewhere ? t('confirm.cancel') : undefined}
      confirmButtonText={
        elsewhere ? t('figure.openOn', { host: where }) : t('figure.close')
      }
      onClose={(confirmed) => {
        setNotice(null);
        if (confirmed && elsewhere) {
          forwardFigure(elsewhere.svg, elsewhere.destination, host);
        }
      }}
    >
      {elsewhere
        ? t('figure.drawnElsewhere', { host: where })
        : t('figure.notAFigure', {
            file: notice?.kind === 'none' ? notice.file : '',
          })}
    </Alert>
  );
  return { open, dialog };
}
