/**
 * A crystal from its CIF: read, its cell filled by the space group, drawn in
 * 3D with the chips that say how, and a line saying what is on screen.
 *
 * Reached through `React.lazy` from `CrystalStructureViewer`: it bonds
 * atoms by the rule molstar draws bonds with, so what the packing completes is
 * what the viewer joins, and that rule is a molstar module.
 */

import { Callout } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useMemo } from 'react';

import type { CellAtoms } from '../../crystal/core/cellAtoms.ts';
import { crystalCellAtoms } from '../../crystal/core/cellAtoms.ts';
import { readCif } from '../../crystal/core/cif/read.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { useControlledState } from '../../molecule3d/ui/useControlledState.ts';
import { bondLimit } from '../../molstar/bonds/index.ts';
import { crystalView } from '../core/crystalView.ts';

import { CrystalViewControls } from './CrystalViewControls.tsx';
import { CrystalViewer3D } from './CrystalViewer3D.tsx';
import type { CrystalScene } from './crystalScene.ts';
import type { CrystalStructureViewerProps } from './crystalStructureViewerProps.ts';
import { DEFAULT_SETTINGS } from './crystalStructureViewerProps.ts';
import { useCrystalCaption } from './useCrystalCaption.ts';

/**
 * The crystal, or why its file could not be drawn.
 * @param props - See {@link CrystalStructureViewerProps}.
 * @returns The view, its chips and its caption.
 */
export function CrystalStructureView(
  props: CrystalStructureViewerProps,
): ReactElement {
  const {
    cif,
    name = '',
    settings: settingsProp,
    defaultSettings = DEFAULT_SETTINGS,
    onSettingsChange,
    height,
    tools,
    fileName,
    onHandle,
  } = props;
  const t = useChromeT();
  const [settings, setSettings] = useControlledState(
    settingsProp,
    defaultSettings,
    onSettingsChange,
  );
  const cell = useMemo(() => readCell(cif), [cif]);

  if (typeof cell === 'string') {
    return (
      <Callout intent="danger" title={t('crystal3d.unreadable')} compact>
        {cell}
      </Callout>
    );
  }
  if (cell.tooLarge) {
    return (
      <Callout intent="warning" compact>
        {t('crystal3d.tooLarge', { count: cell.count })}
      </Callout>
    );
  }
  return (
    <CrystalDrawing
      cell={cell}
      name={name}
      settings={settings}
      onSettingsChange={setSettings}
      height={height}
      tools={tools}
      fileName={fileName}
      onHandle={onHandle}
    />
  );
}

type CrystalDrawingProps = Required<
  Pick<CrystalStructureViewerProps, 'name' | 'settings' | 'onSettingsChange'>
> &
  Pick<
    CrystalStructureViewerProps,
    'height' | 'tools' | 'fileName' | 'onHandle'
  > & {
    cell: CellAtoms;
  };

function CrystalDrawing(props: CrystalDrawingProps): ReactElement {
  const { cell, name, settings, onSettingsChange, ...viewer } = props;
  const { packing, cells, unitCell } = settings;
  const view = useMemo(
    () => crystalView(cell.atoms, cell.lattice, { packing, cells, bondLimit }),
    [cell, packing, cells],
  );
  const scene = useMemo(
    (): CrystalScene => ({
      atoms: view.atoms,
      cell: unitCell ? cell.lattice.cell : null,
      repeat: [view.cells, view.cells, view.cells],
    }),
    [view, unitCell, cell],
  );
  const caption = useCrystalCaption(name, view, cells);
  return (
    <div style={COLUMN_STYLE}>
      <CrystalViewer3D {...viewer} scene={scene} caption={caption} />
      <CrystalViewControls
        packing={packing}
        onPackingChange={(next) => {
          onSettingsChange({ ...settings, packing: next });
        }}
        unitCell={unitCell}
        onUnitCellChange={(next) => {
          onSettingsChange({ ...settings, unitCell: next });
        }}
        cells={cells}
        onCellsChange={(next) => {
          onSettingsChange({ ...settings, cells: next });
        }}
      />
    </div>
  );
}

/**
 * The atoms of one cell, or the sentence saying why the file gives none.
 * @param cif - The file's text.
 * @returns The cell, or the sentence.
 */
function readCell(cif: string): CellAtoms | string {
  try {
    return crystalCellAtoms(readCif(cif));
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

const COLUMN_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};
