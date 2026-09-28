import { useState } from 'react';

import { DEFAULT_IMAGE_RESOLUTION } from '../core/imageResolution.ts';
import type { PictureFrame } from '../core/pictureExport.ts';

import { ExportDialogFrame } from './ExportDialogFrame.tsx';
import { ExportPictureSection } from './ExportPictureSection.tsx';

export interface ExportImageDialogProps {
  /** Whether the dialog is showing. */
  isOpen: boolean;
  /**
   * The drawing the picture is taken of, as it is rendered. Read when a button
   * is pressed rather than passed in, since a drawing is laid out again on
   * every resize. `null` when nothing is drawn.
   */
  getDrawing: () => SVGSVGElement | null;
  /**
   * The name saved files take, without their extension.
   * @default 'picture'
   */
  filename?: string;
  /**
   * What the picture is read out as in the file it is written to, in place of
   * the instructions the element carries for whoever is working it.
   * @default 'Drawing'
   */
  label?: string;
  /**
   * Whether the picture is the drawing inside the element — a canvas, which is
   * mostly the empty space around what is on it — or the element as it is laid
   * out, which is what a chart drawn to the box it was given is.
   * @default 'content'
   */
  frame?: PictureFrame;
  /** Called when the dialog is dismissed. */
  onClose: () => void;
}

/**
 * A drawing as a picture: PNG at a chosen resolution, or SVG.
 *
 * How big it comes out is asked rather than guessed, since only one size could
 * be the default and neither a figure nor a thumbnail is it. SVG is the honest
 * answer wherever it is accepted — it is drawn again at whatever size it is
 * printed — so the resolution there is only the size the file opens at.
 *
 * The same dialog writes out a glycan, a molecule and a spectrum, because none
 * of what it does depends on what is drawn: it is handed an SVG element that is
 * already on the page, and asks it how big it is.
 * @param props - Component props.
 * @returns The dialog.
 */
export function ExportImageDialog(props: ExportImageDialogProps) {
  const {
    isOpen,
    getDrawing,
    filename = 'picture',
    label = 'Drawing',
    frame,
    onClose,
  } = props;

  const [resolutionId, setResolutionId] = useState<string>(
    DEFAULT_IMAGE_RESOLUTION.id,
  );

  return (
    <ExportDialogFrame
      isOpen={isOpen}
      title="Export as an image"
      icon="media"
      filename={filename}
      width={460}
      mountWhileOpen
      onClose={onClose}
    >
      {(onStatus) => (
        <ExportPictureSection
          getDrawing={getDrawing}
          resolutionId={resolutionId}
          onResolutionChange={setResolutionId}
          filename={filename}
          label={label}
          frame={frame}
          onStatus={onStatus}
        />
      )}
    </ExportDialogFrame>
  );
}
