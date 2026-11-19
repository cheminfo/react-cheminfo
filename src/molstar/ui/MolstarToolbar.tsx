/**
 * The toolbars every 3D view of the family floats over its canvas: reset,
 * spin, export, full screen and help, then the measuring tools.
 *
 * It is `Molecule3DToolbar` placed in the top-left corner of the stage and fed
 * from `useMolstarTools` and `useImageExport`, so a site drawing its own
 * scene — orbitals, a crystal — gets the controls `<MoleculeViewer3D>` has
 * without wiring them a second time.
 */

import type { CSSProperties, ReactElement } from 'react';

import type { Molecule3DFile } from '../../molecule3d/core/file.ts';
import { Molecule3DExport } from '../../molecule3d/ui/Molecule3DExport.tsx';
import type { Molecule3DToolbarProps } from '../../molecule3d/ui/Molecule3DToolbar.tsx';
import { Molecule3DToolbar } from '../../molecule3d/ui/Molecule3DToolbar.tsx';
import type { ImageExport } from '../../molecule3d/ui/useImageExport.ts';

import type { MolstarTools } from './useMolstarTools.ts';

/** Props of {@link MolstarToolbar}. */
export interface MolstarToolbarProps extends Omit<
  Molecule3DToolbarProps,
  | 'measureKind'
  | 'onMeasureKindChange'
  | 'spinning'
  | 'onSpinningChange'
  | 'exportPanel'
> {
  /** The state `useMolstarTools` keeps. */
  controls: MolstarTools;
  /**
   * The pictures the export tool saves and copies; the tool is left out
   * without them.
   * @default undefined
   */
  imageExport?: ImageExport;
  /**
   * Base name of what the export tool saves, extension excluded.
   * @default 'molecule'
   */
  fileName?: string;
  /**
   * The file on screen, offered beside the pictures; say so in `exportLabel`.
   * @default undefined — only pictures are offered
   */
  molfile?: Molecule3DFile | null;
  /**
   * How many frames the scene holds. Above one, a PNG may hold them all.
   * @default 1
   */
  frameCount?: number;
}

/**
 * The toolbars, in the top-left corner of a positioned stage.
 * @param props - See {@link MolstarToolbarProps}.
 * @returns The toolbars.
 */
export function MolstarToolbar(props: MolstarToolbarProps): ReactElement {
  const { controls, imageExport, fileName, molfile, frameCount, ...toolbar } =
    props;
  return (
    <div style={OVERLAY_STYLE}>
      <Molecule3DToolbar
        {...toolbar}
        measureKind={controls.measureKind}
        onMeasureKindChange={controls.setMeasureKind}
        spinning={controls.spinning}
        onSpinningChange={controls.setSpinning}
        exportPanel={
          imageExport === undefined ? undefined : (
            <Molecule3DExport
              getSize={imageExport.canvasSize}
              onExport={imageExport.exportImage}
              onCopy={imageExport.copyImage}
              writeFile={imageExport.imageFile}
              frameCount={frameCount}
              molfile={molfile}
              fileName={fileName}
            />
          )
        }
      />
    </div>
  );
}

/**
 * `pointerEvents` is off here and back on inside the toolbars, so the empty
 * column beside them does not swallow a drag of the scene.
 */
const OVERLAY_STYLE: CSSProperties = {
  position: 'absolute',
  top: 8,
  bottom: 8,
  left: 8,
  zIndex: 2,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  pointerEvents: 'none',
};
