import { Button } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { CopyableValue } from '../../clipboard/ui/CopyableValue.tsx';
import { downloadText } from '../../download/core/downloadText.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { StructureNotation } from '../core/structureNotations.ts';

import { notationText } from './structureNotationText.ts';

/** What {@link StructureNotationRow} shows. */
export interface StructureNotationRowProps {
  /** The notation, as `structureNotations` wrote it. */
  notation: StructureNotation;
  /** Base name of the file this notation is saved as, extension excluded. */
  fileName: string;
}

/**
 * One notation: its name, the text, and the two ways of taking it away.
 *
 * The text is the button that copies it — a notation is only ever wanted
 * somewhere else — and a notation that is also a file carries a save button on
 * its name's line, where it cannot be hit while reaching for the text. The
 * name explains itself on hover, dotted-underlined to say so, so the row needs
 * no glyph of its own.
 * @param props - See {@link StructureNotationRowProps}.
 * @returns The row.
 */
export function StructureNotationRow(
  props: StructureNotationRowProps,
): ReactElement {
  const { notation, fileName } = props;
  const { kind, value, file, block } = notation;
  const t = useChromeT();
  const text = notationText(kind);

  return (
    <CopyableValue
      className="structure-export__notation"
      label={t(text.label)}
      hint={t(text.hint)}
      value={value}
      block={block}
      clip={block}
      maxHeight={block ? BLOCK_HEIGHT : undefined}
      action={
        file === undefined || value === '' ? undefined : (
          <Button
            variant="minimal"
            size="small"
            icon="download"
            text={t('download.save')}
            onClick={() => {
              downloadText(
                value,
                `${fileName}${file.suffix}.${file.extension}`,
                `${file.mimeType};charset=utf-8`,
              );
            }}
          />
        )
      }
    />
  );
}

/**
 * How much of a molfile is shown: its header and the first lines of its
 * connection table, which is enough to see which dialect and which molecule it
 * is. The rest is faded out rather than scrolled — the whole file is what a
 * click copies and what the save button writes.
 */
const BLOCK_HEIGHT = 92;
