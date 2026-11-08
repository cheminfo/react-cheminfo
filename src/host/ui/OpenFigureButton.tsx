import type { ButtonProps } from '@blueprintjs/core';
import { Button } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useRef } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

import type { OpenFigureOptions } from './useOpenFigure.tsx';
import { useOpenFigure } from './useOpenFigure.tsx';

/** A button opening a figure saved from the site. */
export interface OpenFigureButtonProps
  extends OpenFigureOptions, Omit<ButtonProps, 'onClick'> {}

/**
 * Open a figure saved from the site, as an SVG or as a document, as it was
 * drawn: the button, the file picker it opens, and the alert of
 * {@link useOpenFigure}.
 * @param props - What opens the figure, and the button's own props.
 * @returns The button.
 */
export function OpenFigureButton(props: OpenFigureButtonProps): ReactElement {
  const { site, onOpen, onWorkspace, host, origins, ...buttonProps } = props;
  const t = useChromeT();
  const input = useRef<HTMLInputElement>(null);
  const { open, dialog } = useOpenFigure({
    site,
    onOpen,
    ...(onWorkspace === undefined ? {} : { onWorkspace }),
    ...(host === undefined ? {} : { host }),
    ...(origins === undefined ? {} : { origins }),
  });
  return (
    <>
      <Button
        icon="folder-open"
        variant="minimal"
        text={t('figure.open')}
        title={t('figure.openHelp')}
        {...buttonProps}
        className={joinClassNames('no-print', buttonProps.className)}
        onClick={() => input.current?.click()}
      />
      <input
        ref={input}
        type="file"
        accept=".svg,image/svg+xml,.zip,application/zip"
        hidden
        data-testid="open-figure-input"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file !== undefined) void open(file);
        }}
      />
      {dialog}
    </>
  );
}
