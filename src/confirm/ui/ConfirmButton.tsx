import type { ButtonProps, IconName, Intent } from '@blueprintjs/core';
import { Alert, Button } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

/** Props of {@link ConfirmButton}: a Blueprint button, and what it asks. */
export interface ConfirmButtonProps extends Omit<ButtonProps, 'onClick'> {
  /**
   * What the alert asks before anything happens: what is lost, and whether it
   * can be undone.
   */
  question: ReactNode;
  /** Does the thing, once the alert is confirmed. */
  onConfirm: () => void;
  /**
   * Text of the button that goes ahead: the verb of what happens, never `OK`.
   * @default the chrome's own word for it, in the language of the page
   */
  confirmLabel?: string;
  /**
   * Text of the button that backs out.
   * @default the chrome's own word for it, in the language of the page
   */
  cancelLabel?: string;
}

/**
 * A button whose action cannot be taken back, asked about in a real alert.
 *
 * Never `confirm()`: a browser may suppress it, it cannot be styled, and it is
 * dismissed by reflex. The alert takes the colour and the icon of the button
 * that opened it, so an amber "Replace the link" asks in amber and a red
 * "Delete" in red, and Escape or a click outside backs out.
 * @param props - The button, the question, and what confirming does.
 * @returns The button, and the alert it opens.
 */
export function ConfirmButton(props: ConfirmButtonProps): ReactElement {
  const { question, onConfirm, confirmLabel, cancelLabel, ...buttonProps } =
    props;
  const t = useChromeT();
  const [asking, setAsking] = useState(false);

  return (
    <>
      <Button
        {...buttonProps}
        onClick={() => {
          setAsking(true);
        }}
      />
      <Alert
        isOpen={asking}
        intent={alertIntent(buttonProps.intent)}
        icon={alertIcon(buttonProps.icon)}
        canEscapeKeyCancel
        canOutsideClickCancel
        cancelButtonText={cancelLabel ?? t('confirm.cancel')}
        confirmButtonText={confirmLabel ?? t('confirm.delete')}
        onCancel={() => {
          setAsking(false);
        }}
        onConfirm={() => {
          setAsking(false);
          onConfirm();
        }}
      >
        {question}
      </Alert>
    </>
  );
}

function alertIntent(intent: Intent | undefined): Intent {
  return intent === undefined || intent === 'none' ? 'danger' : intent;
}

function alertIcon(icon: ButtonProps['icon']): IconName {
  return typeof icon === 'string' ? icon : 'trash';
}
