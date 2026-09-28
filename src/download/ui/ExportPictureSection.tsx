import { Button, HTMLSelect } from '@blueprintjs/core';
import { useState } from 'react';

import {
  exportButtonsStyle,
  exportNoteStyle,
  exportSectionStyle,
} from '../core/exportStyles.ts';
import {
  IMAGE_RESOLUTIONS,
  formatImageSize,
  imageResolution,
} from '../core/imageResolution.ts';
import type { PictureFrame } from '../core/pictureExport.ts';
import {
  copyPicture,
  pictureSize,
  savePngPicture,
  saveSvgPicture,
} from '../core/pictureExport.ts';
import { sanitizeFileName } from '../core/sanitizeFileName.ts';

import { ExportNameField } from './ExportNameField.tsx';

export interface ExportPictureSectionProps {
  /** The drawing a picture is taken of, as it is rendered. */
  getDrawing: () => SVGSVGElement | null;
  /** Which of the resolutions is picked. */
  resolutionId: string;
  /** Called with the resolution that was picked. */
  onResolutionChange: (id: string) => void;
  /**
   * The name the name box opens on, and falls back to when it is cleared,
   * without its extension.
   */
  filename: string;
  /** What the picture is read out as in the file it is written to. */
  label: string;
  /**
   * Whether the picture is the drawing inside the element or the element as it
   * is laid out.
   * @default 'content'
   */
  frame?: PictureFrame;
  /** Called with what became of the last thing written out. */
  onStatus: (status: string) => void;
}

/**
 * The drawing as a picture: how big it comes out, and where it goes.
 *
 * The size the file will be is shown beside the resolution rather than after
 * the fact, since that is the number the choice is made on — a figure for a
 * paper and a thumbnail for a slide are the same drawing at very different
 * sizes. What is measured is what the picture will be of and not whatever is on
 * screen, so the answer does not change when the window is resized or the
 * drawing panned.
 * @param props - Component props.
 * @returns The section.
 */
export function ExportPictureSection(props: ExportPictureSectionProps) {
  const {
    getDrawing,
    resolutionId,
    onResolutionChange,
    filename,
    label,
    frame,
    onStatus,
  } = props;

  const [name, setName] = useState(filename);

  const savedName = sanitizeFileName(name, filename);
  const { scale } = imageResolution(resolutionId);
  const size = pictureSize(getDrawing(), scale, { frame });
  const options = { scale, filename: savedName, label, frame };

  return (
    <section style={exportSectionStyle}>
      <div style={resolutionStyle}>
        <HTMLSelect
          value={resolutionId}
          aria-label="Resolution"
          onChange={(event) => onResolutionChange(event.currentTarget.value)}
        >
          {IMAGE_RESOLUTIONS.map((resolution) => (
            <option key={resolution.id} value={resolution.id}>
              {resolution.label}
            </option>
          ))}
        </HTMLSelect>
        <span style={exportNoteStyle}>{formatImageSize(size)}</span>
      </div>
      <div style={exportButtonsStyle}>
        <Button
          icon="duplicate"
          disabled={size === null}
          text="Copy PNG"
          onClick={() => {
            // The rasterization is started here rather than awaited: Safari
            // only allows a clipboard write the click itself started.
            void copyPicture(getDrawing(), options).then(
              (copied) =>
                onStatus(copied ? 'Picture copied.' : 'Nothing was copied.'),
              () => onStatus('Nothing was copied.'),
            );
          }}
        />
        <ExportNameField name={name} onChange={setName} />
        <Button
          icon="download"
          disabled={size === null}
          text="Save PNG"
          title={`Save as ${savedName}.png`}
          onClick={() => {
            void savePngPicture(getDrawing(), options).then((saved) => {
              if (saved) onStatus(`Saved as ${savedName}.png.`);
            });
          }}
        />
        <Button
          icon="download"
          disabled={size === null}
          text="Save SVG"
          title={`Save as ${savedName}.svg`}
          onClick={() => {
            if (saveSvgPicture(getDrawing(), options)) {
              onStatus(`Saved as ${savedName}.svg.`);
            }
          }}
        />
      </div>
    </section>
  );
}

const resolutionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
} as const;
