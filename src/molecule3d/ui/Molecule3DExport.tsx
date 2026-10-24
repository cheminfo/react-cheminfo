/**
 * The export popover of the molecule viewer: the family's figure-saving panel,
 * fed by a render of the WebGL scene rather than by the SVG on the page.
 */

import type { ReactElement } from 'react';
import { useState } from 'react';

import type { FigureNotice } from '../../download/core/copyFigure.ts';
import type { FigureFormat } from '../../download/core/downloadFigure.ts';
import type { FigurePixels } from '../../download/core/figureScale.ts';
import {
  DEFAULT_FIGURE_SCALE,
  FIGURE_SCALES,
} from '../../download/core/figureScale.ts';
import { FigureDownloadPanel } from '../../download/ui/FigureDownloadPanel.tsx';
import { useFigureTask } from '../../download/ui/useFigureTask.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';

/** Props of {@link Molecule3DExport}. */
export interface Molecule3DExportProps {
  /** Reads the size of the canvas on screen, when the popover opens. */
  getSize: () => FigurePixels | null;
  /**
   * Writes the file: every frame, as an animated PNG, when `animated` is set.
   */
  onExport: (
    format: FigureFormat,
    scale: number,
    animated: boolean,
  ) => Promise<void>;
  /** Puts a PNG at that scale on the clipboard, and says what came of it. */
  onCopy: (scale: number) => Promise<FigureNotice>;
  /**
   * How many frames the scene holds. Above one, a PNG may hold them all, as an
   * animation.
   * @default 1
   */
  frameCount?: number;
}

/**
 * The export panel.
 * @param props - See {@link Molecule3DExportProps}.
 * @returns The panel.
 */
export function Molecule3DExport(props: Molecule3DExportProps): ReactElement {
  const { getSize, onExport, onCopy, frameCount = 1 } = props;
  const t = useChromeT();
  const [size] = useState(getSize);
  const [format, setFormat] = useState<FigureFormat>('png');
  const [scale, setScale] = useState(DEFAULT_FIGURE_SCALE);
  const [frames, setFrames] = useState<FrameChoice>('all');
  const offerFrames = frameCount > 1 && format === 'png';
  const animated = offerFrames && frames === 'all';
  const { run, busy, failure, notice, clear } = useFigureTask();

  // What the last copy came to only describes the choices it was made with.
  function changed<T>(apply: (value: T) => void): (value: T) => void {
    return (value) => {
      clear();
      apply(value);
    };
  }

  return (
    <FigureDownloadPanel
      title={t('molecule3d.exportImage')}
      format={format}
      scale={scale}
      scales={FIGURE_SCALES}
      size={size}
      failure={failure}
      notice={notice}
      saving={busy}
      rasterSvg
      onFormatChange={changed(setFormat)}
      onScaleChange={changed(setScale)}
      onSave={() => run(onExport(format, scale, animated).then(() => null))}
      onCopy={() => run(onCopy(scale))}
    >
      {offerFrames && (
        <OverlaySegmented<FrameChoice>
          label={t('molecule3d.frames')}
          help={{
            title: t('molecule3d.frames'),
            body: t('molecule3d.framesHelp'),
          }}
          value={frames}
          options={[
            { value: 'one', label: t('molecule3d.frames.one') },
            {
              value: 'all',
              label: t('molecule3d.frames.all', { count: frameCount }),
            },
          ]}
          onChange={changed(setFrames)}
        />
      )}
    </FigureDownloadPanel>
  );
}

/** The frame on screen, or every frame as an animated PNG. */
type FrameChoice = 'one' | 'all';
