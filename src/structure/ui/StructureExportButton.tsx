import type { ReactElement } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { OverlayIconButton } from '../../overlay/ui/OverlayIconButton.tsx';

import { StructureExportDialog } from './StructureExportDialog.tsx';
import type { StructureExportPanelProps } from './StructureExportPanel.tsx';

/** What {@link StructureExportButton} hands over. */
export interface StructureExportButtonProps extends StructureExportPanelProps {
  /**
   * What the glyph is called, for the pointer and for a screen reader.
   * @default the chrome's own line, `Copy or save the structure: SMILES,
   *   molfile`
   */
  label?: string;
  /**
   * Value of the `data-testid` attribute of the glyph.
   * @default 'card-structure'
   */
  testId?: string;
}

/**
 * The glyph beside a figure that hands its one structure over: as a SMILES,
 * a molfile or an idCode, each copied with a click, or as a picture — the
 * export dialog, the one the chat opens on its own molecule cards. It is drawn
 * like the figure's other glyphs, so it sits in the `tools` of a `CardFigure`
 * or of any overlay bar.
 * @param props - The structure, the name of its files, and the glyph's name.
 * @returns The glyph; the dialog is drawn over the page while it is open.
 */
export function StructureExportButton(
  props: StructureExportButtonProps,
): ReactElement {
  const { label, testId = 'card-structure', ...structure } = props;
  const t = useChromeT();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <OverlayIconButton
        icon="export"
        label={label ?? t('structure.export.glyph')}
        active={isOpen}
        opensMenu
        testId={testId}
        onClick={() => setIsOpen(true)}
      />
      <StructureExportDialog
        {...structure}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
