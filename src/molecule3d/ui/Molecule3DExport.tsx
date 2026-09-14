/**
 * The export popover of the molecule viewer: the family's figure-saving panel,
 * fed by a render of the WebGL scene rather than by the SVG on the page.
 */

import type { ReactElement } from 'react';
import { useState } from 'react';

import type { FigureFormat } from '../../download/core/downloadFigure.ts';
import type { FigurePixels } from '../../download/core/figureScale.ts';
import {
  DEFAULT_FIGURE_SCALE,
  FIGURE_SCALES,
} from '../../download/core/figureScale.ts';
import { FigureDownloadPanel } from '../../download/ui/FigureDownloadPanel.tsx';

/** Props of {@link Molecule3DExport}. */
export interface Molecule3DExportProps {
  /** Reads the size of the canvas on screen, when the popover opens. */
  getSize: () => FigurePixels | null;
  /** Writes the file. */
  onExport: (format: FigureFormat, scale: number) => Promise<void>;
}

/**
 * The export panel.
 * @param props - See {@link Molecule3DExportProps}.
 * @returns The panel.
 */
export function Molecule3DExport(props: Molecule3DExportProps): ReactElement {
  const { getSize, onExport } = props;
  const [size] = useState(getSize);
  const [format, setFormat] = useState<FigureFormat>('png');
  const [scale, setScale] = useState(DEFAULT_FIGURE_SCALE);
  const [failure, setFailure] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(): Promise<void> {
    setSaving(true);
    try {
      await onExport(format, scale);
      setFailure(null);
    } catch (error) {
      setFailure(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <FigureDownloadPanel
      title="Export image"
      format={format}
      scale={scale}
      scales={FIGURE_SCALES}
      size={size}
      failure={failure}
      saving={saving}
      rasterSvg
      onFormatChange={setFormat}
      onScaleChange={setScale}
      onSave={() => void save()}
    />
  );
}
