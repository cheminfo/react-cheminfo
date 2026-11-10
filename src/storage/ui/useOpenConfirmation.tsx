import { Alert } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

/**
 * What a folder panel asks before a document replaces the one on screen: the
 * question, or undefined to go ahead at once — a site whose drafts keep every
 * document asks nothing, one keeping a single draft asks while it holds work.
 */
export type ConfirmOpen = () => ReactNode | undefined;

/** {@link useOpenConfirmation}'s answer. */
export interface OpenConfirmation {
  /** Run an opening, once the visitor agreed when there is something to ask. */
  open: (action: () => void) => void;
  /** The alert: render it once, anywhere. */
  alert: ReactElement;
}

/**
 * Ask before a document replaces the one on screen, when the site says there
 * is something to lose.
 * @param confirmOpen - See {@link ConfirmOpen}.
 * @default undefined — every opening goes ahead at once
 * @returns See {@link OpenConfirmation}.
 */
export function useOpenConfirmation(
  confirmOpen?: ConfirmOpen,
): OpenConfirmation {
  const t = useChromeT();
  const [pending, setPending] = useState<{
    question: ReactNode;
    action: () => void;
  } | null>(null);
  return {
    open: (action) => {
      const question = confirmOpen?.();
      if (question === undefined) action();
      else setPending({ question, action });
    },
    alert: (
      <Alert
        isOpen={pending !== null}
        intent="warning"
        icon="document-open"
        canEscapeKeyCancel
        canOutsideClickCancel
        cancelButtonText={t('documents.cancel')}
        confirmButtonText={t('documents.open')}
        onCancel={() => {
          setPending(null);
        }}
        onConfirm={() => {
          pending?.action();
          setPending(null);
        }}
      >
        {pending?.question}
      </Alert>
    ),
  };
}
