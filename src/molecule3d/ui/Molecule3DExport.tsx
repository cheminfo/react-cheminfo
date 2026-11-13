/**
 * The export popover of the molecule viewer: the family's figure-saving panel,
 * fed by a render of the WebGL scene rather than by the SVG on the page, with
 * the model itself offered beside its pictures, as a molfile.
 */

import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';

import type { FigureNotice } from '../../download/core/copyFigure.ts';
import type { FigureFormat } from '../../download/core/downloadFigure.ts';
import {
  DEFAULT_FIGURE_DPI,
  FIGURE_DPIS,
  dpiScale,
} from '../../download/core/figureDpi.ts';
import type { FigurePixels } from '../../download/core/figureScale.ts';
import { FigureDownloadPanel } from '../../download/ui/FigureDownloadPanel.tsx';
import { useFigureSend } from '../../download/ui/useFigureSend.ts';
import { useFigureTask } from '../../download/ui/useFigureTask.ts';
import { useAsync } from '../../hooks/ui/useAsync.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import type { Molecule3DFile } from '../core/file.ts';

import type { MoleculeFileFormat } from './moleculeFileFormats.ts';
import {
  moleculeFileAtoms,
  moleculeFileChoices,
  moleculeFileText,
  saveMoleculeFile,
} from './moleculeFileFormats.ts';

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
   * Writes a file, which Send hands to the share sheet of the device: always
   * a still PNG at the resolution picked.
   * @default undefined — nothing is offered to send
   */
  writeFile?: (
    format: FigureFormat,
    scale: number,
    animated: boolean,
  ) => Promise<File>;
  /**
   * How many frames the scene holds. Above one, a PNG may hold them all, as an
   * animation.
   * @default 1
   */
  frameCount?: number;
  /**
   * The file on screen, offered beside the pictures as a molfile of either
   * dialect. Not one for an XYZ or a series of frames, which a molfile cannot
   * say.
   * @default undefined — only pictures are offered
   */
  molfile?: Molecule3DFile | null;
  /**
   * Base name of a molfile saved from here, extension excluded.
   * @default 'molecule'
   */
  fileName?: string;
}

/**
 * The export panel.
 * @param props - See {@link Molecule3DExportProps}.
 * @returns The panel.
 */
export function Molecule3DExport(props: Molecule3DExportProps): ReactElement {
  const { getSize, onExport, onCopy, writeFile, frameCount = 1 } = props;
  const { molfile, fileName = 'molecule' } = props;
  const t = useChromeT();
  const [size] = useState(getSize);
  const [format, setFormat] = useState<FigureFormat>('png');
  const [file, setFile] = useState<typeof MOLFILE | null>(null);
  const [version, setVersion] = useState<MoleculeFileFormat>('molfileV2000');
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [frames, setFrames] = useState<FrameChoice>('all');
  const offerFrames = frameCount > 1 && file === null && format === 'png';
  const animated = offerFrames && frames === 'all';
  const { run, busy, failure, notice, clear } = useFigureTask();
  const send = useFigureSend({ run, notice });
  const atoms = moleculeFileAtoms(molfile, frameCount);
  const versions = moleculeFileChoices(atoms, t);
  const writtenVersion = versions[0]?.disabled ? 'molfileV3000' : version;

  // Written once picked, so Save has it at hand.
  const written = useAsync(
    useCallback(
      () =>
        file !== null && molfile
          ? moleculeFileText(molfile, writtenVersion)
          : Promise.resolve(null),
      [file, molfile, writtenVersion],
    ),
  );
  const text = written.pending ? null : written.data;

  // What the last copy came to only describes the choices it was made with.
  function changed<T>(apply: (value: T) => void): (value: T) => void {
    return (value) => {
      clear();
      apply(value);
    };
  }

  return (
    <FigureDownloadPanel<typeof MOLFILE>
      title={t(
        atoms > 0
          ? 'molecule3d.exportImageOrMolfile'
          : 'molecule3d.exportImage',
      )}
      format={format}
      file={
        atoms > 0
          ? {
              options: MOLFILE_CHOICES,
              value: file,
              onChange: changed(setFile),
              hint: t('molecule3d.molfileHint', { count: atoms }),
            }
          : undefined
      }
      scale={scale}
      scales={DPI_SCALES}
      unit="dpi"
      size={size}
      failure={failure ?? written.failure?.message ?? null}
      notice={notice}
      saving={busy || (file !== null && text === null)}
      rasterSvg
      onFormatChange={changed(setFormat)}
      onScaleChange={changed(setScale)}
      onSave={() => {
        if (file === null) {
          run(onExport(format, scale, animated).then(() => null));
        } else if (text) {
          saveMoleculeFile(text, writtenVersion, fileName);
        }
      }}
      onCopy={() => {
        run(onCopy(scale));
      }}
      onSend={
        writeFile === undefined
          ? undefined
          : () => {
              send(() => writeFile('png', scale, false));
            }
      }
    >
      {file !== null && (
        <OverlaySegmented<MoleculeFileFormat>
          label={t('molecule3d.molfileVersion')}
          value={writtenVersion}
          options={versions}
          onChange={changed(setVersion)}
        />
      )}
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

/** The dots per inch offered, as the multiples the scene is rendered at. */
const DPI_SCALES = FIGURE_DPIS.map(dpiScale);

/** The resolution the panel opens on. */
const DEFAULT_SCALE = dpiScale(DEFAULT_FIGURE_DPI);

/** What the row of formats calls a molfile; the version is a row of its own. */
const MOLFILE = 'molfile';

const MOLFILE_CHOICES: ReadonlyArray<OverlayOption<typeof MOLFILE>> = [
  { value: MOLFILE, label: 'Molfile' },
];

/** The frame on screen, or every frame as an animated PNG. */
type FrameChoice = 'one' | 'all';
