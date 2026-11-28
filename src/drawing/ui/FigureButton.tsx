import { Button, PopoverNext } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { dpiScale, figureDpi } from '../../download/core/figureDpi.ts';
import type { FigureSvg } from '../../download/core/figureSvg.ts';
import { useFigureDownload } from '../../download/ui/useFigureDownload.tsx';

/** What {@link FigureButton} is given. */
export interface FigureButtonProps {
  /** Whether there is nothing to save yet. */
  disabled: boolean;
  /** The figure: the selection, or the whole drawing. */
  writeFigure: () => Promise<FigureSvg>;
  /**
   * The name the figure is saved under, asked when the panel opens: a name
   * worked out from the drawing is not worth working out on every edit.
   */
  fileName: () => string;
  /** The dots per inch a PNG is painted at, kept between visits. */
  dpi: number;
  /** Called with the dots per inch picked in the panel. */
  onDpi: (dpi: number) => void;
  /**
   * What the button is wrapped in, such as the tooltip naming its command and
   * its key.
   * @default the button alone
   */
  wrapButton?: (button: ReactElement) => ReactElement;
}

/**
 * The family's figure panel over the selection, or the whole drawing, from an
 * editor's bar: a PNG at the dots per inch a journal or a slide asks for, or
 * the SVG, saved or copied.
 * @param props - See {@link FigureButtonProps}.
 * @returns The button and its panel.
 */
export function FigureButton(props: FigureButtonProps): ReactElement {
  const { disabled, writeFigure, dpi, onDpi, wrapButton = unwrapped } = props;
  const [fileName, setFileName] = useState('drawing');
  const figure = useFigureDownload({
    writeFigure,
    fileName,
    unit: 'dpi',
    defaultScale: dpiScale(dpi),
    onScaleChange: (scale) => {
      onDpi(figureDpi(scale));
    },
  });

  return (
    <>
      <PopoverNext
        isOpen={figure.isOpen}
        placement="bottom-start"
        disabled={disabled}
        onInteraction={(next) => {
          if (next) setFileName(props.fileName());
          figure.setOpen(next);
        }}
        content={figure.panel}
      >
        {wrapButton(
          <Button
            variant="minimal"
            icon="media"
            text="Figure"
            disabled={disabled}
          />,
        )}
      </PopoverNext>
      {figure.portal}
    </>
  );
}

function unwrapped(button: ReactElement): ReactElement {
  return button;
}
