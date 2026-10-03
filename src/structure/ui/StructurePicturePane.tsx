import { Button, SegmentedControl } from '@blueprintjs/core';
import type { Molecule } from 'openchemlib';
import type { CSSProperties, ReactElement } from 'react';
import { useMemo, useState } from 'react';

import { writeImageToClipboard } from '../../clipboard/core/copyPng.ts';
import { downloadBlob } from '../../download/core/downloadBlob.ts';
import { downloadText } from '../../download/core/downloadText.ts';
import { figurePng } from '../../download/core/figurePng.ts';
import {
  FIGURE_SCALES,
  figureScaleFits,
  figureScaleLabel,
  formatFigurePixels,
} from '../../download/core/figureScale.ts';
import { FIGURE_SVG_TYPE } from '../../download/core/figureSvg.ts';
import { HelpTooltip } from '../../help/ui/HelpTooltip.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { OVERLAY_HELP_NAME_STYLE } from '../../overlay/ui/overlayRowStyles.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { StructurePicture } from '../core/structurePicture.ts';
import {
  STRUCTURE_BOND_LENGTH,
  structurePicture,
} from '../core/structurePicture.ts';

/** What {@link StructurePicturePane} draws and saves. */
export interface StructurePicturePaneProps {
  /** The structure. Not modified. */
  molecule: Molecule;
  /** Base name of the saved files, extension excluded. */
  fileName: string;
}

/** The multiple the pictures are offered at first. */
const DEFAULT_SCALE = 2;

/**
 * The structure as a picture: what it looks like, how big it leaves, and the
 * three ways it leaves.
 *
 * What is shown is the file: the preview is the very SVG the save button
 * writes, laid out smaller, so nobody saves a picture they have not seen. The
 * resolution is a multiple rather than a pixel width because the multiple is
 * the part a reader has an opinion about — one for a note, two for a slide,
 * three or four for print — and the pixels it comes to are written under it.
 * @param props - See {@link StructurePicturePaneProps}.
 * @returns The pane.
 */
export function StructurePicturePane(
  props: StructurePicturePaneProps,
): ReactElement {
  const { molecule, fileName } = props;
  const t = useChromeT();
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [notice, setNotice] = useState<string | null>(null);

  // Drawn once per resolution, so what is previewed, measured and saved is one
  // picture rather than three that have to be kept in step.
  const picture = useMemo(
    () =>
      structurePicture(molecule, { bondLength: STRUCTURE_BOND_LENGTH * scale }),
    [molecule, scale],
  );
  // Shown as the document itself rather than as markup put into the page: the
  // dialog never writes HTML it did not author, and the preview is the file.
  const preview = `data:${FIGURE_SVG_TYPE},${encodeURIComponent(picture.markup)}`;
  // The crop is the structure's own shape, so the size at one resolution is
  // what every other one scales from: measured rather than assumed.
  const base = useMemo(() => structurePicture(molecule), [molecule]);

  async function png(): Promise<Blob> {
    return figurePng(picture, 1);
  }

  async function run(write: () => Promise<string | null>): Promise<void> {
    try {
      setNotice(await write());
    } catch (error) {
      setNotice(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <div className="structure-export__picture">
      <img
        className="structure-export__stage"
        src={preview}
        alt={t('structure.export.picture')}
      />
      <div className="structure-export__row">
        <HelpTooltip
          content={{
            title: t('download.resolution'),
            body: t('download.resolutionHelp'),
            example: { code: '2×', note: t('download.resolutionExample') },
          }}
          placement="top-start"
        >
          <span style={NAME_STYLE}>{t('download.resolution')}</span>
        </HelpTooltip>
        <SegmentedControl
          size="small"
          options={scaleOptions(base)}
          value={String(scale)}
          onValueChange={(picked) => {
            setNotice(null);
            setScale(Number(picked));
          }}
        />
      </div>
      <p className="structure-export__pixels" style={PIXELS_STYLE}>
        {formatFigurePixels(picture)}
      </p>
      <div className="structure-export__actions">
        <Button
          icon="download"
          size="small"
          text={t('structure.export.saveSvg')}
          onClick={() =>
            void run(async () => {
              downloadText(picture.markup, `${fileName}.svg`, FIGURE_SVG_TYPE);
              return null;
            })
          }
        />
        <Button
          icon="download"
          size="small"
          intent="primary"
          text={t('structure.export.savePng')}
          onClick={() =>
            void run(async () => {
              downloadBlob(await png(), `${fileName}.png`);
              return null;
            })
          }
        />
        <Button
          icon="clipboard"
          size="small"
          text={t('structure.export.copyPng')}
          onClick={() =>
            // Safari only allows a clipboard write the click itself started,
            // so the image is handed over as a promise rather than awaited
            // first — see `writeImageToClipboard`.
            void run(async () =>
              (await writeImageToClipboard(png()))
                ? t('download.hintCopied', {
                    pixels: formatFigurePixels(picture),
                  })
                : t('download.copyUnsupported'),
            )
          }
        />
      </div>
      {notice === null ? null : (
        <p className="structure-export__notice" style={NOTICE_STYLE}>
          {notice}
        </p>
      )}
    </div>
  );
}

/**
 * The multiples offered, each greyed when the picture it would produce is past
 * what a browser will paint — the ceiling is met here rather than as a blank
 * file, which is the rule the figure panel follows.
 * @param base - The picture at the smallest resolution, which the others are
 * multiples of.
 * @returns The choices, in the order offered.
 */
function scaleOptions(base: StructurePicture): Array<{
  label: string;
  value: string;
  disabled?: boolean;
}> {
  const options = [];
  for (const scale of FIGURE_SCALES) {
    options.push({
      label: figureScaleLabel(scale),
      value: String(scale),
      disabled: !figureScaleFits(base, scale),
    });
  }
  return options;
}

const NAME_STYLE = {
  ...OVERLAY_HELP_NAME_STYLE,
  color: TOKEN.textMuted,
  fontSize: 12,
  fontWeight: 600,
} as const satisfies CSSProperties;

const PIXELS_STYLE = {
  margin: 0,
  color: TOKEN.textFaint,
  fontSize: 11,
  fontVariantNumeric: 'tabular-nums',
} as const satisfies CSSProperties;

const NOTICE_STYLE = {
  margin: 0,
  color: TOKEN.textMuted,
  fontSize: 11,
} as const satisfies CSSProperties;
