/**
 * The canvas structure editor and the box it is drawn in.
 *
 * The canvas itself sits behind `React.lazy`: it is the half that imports
 * react-ocl, so a page that never opens an editor never downloads openchemlib,
 * and `react-cheminfo/structure` stays importable when those optional peers
 * are absent.
 */

import type { CSSProperties, ReactElement } from 'react';
import { Suspense, lazy, useCallback } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';

import { EditorHelpButton } from './EditorHelpButton.tsx';
import { EditorImportButton } from './EditorImportButton.tsx';
import { EditorImportProblem } from './EditorImportProblem.tsx';
import { StructureDropOverlay } from './StructureDropOverlay.tsx';
import { ToolbarTooltip } from './ToolbarTooltip.tsx';
import type { StructureEditorChange } from './editorChange.ts';
import type { StructureEditorProps } from './structureEditorProps.ts';
import { useDebouncedChange } from './useDebouncedChange.ts';
import { useEditorStructure } from './useEditorStructure.ts';
import { useStructureDrop } from './useStructureDrop.ts';
import { useStructureImport } from './useStructureImport.ts';
import { useToolbarFloor } from './useToolbarFloor.ts';

export type { StructureEditorProps } from './structureEditorProps.ts';

const EditorExportButton = lazy(async () => {
  const module = await import('./EditorExportButton.tsx');
  return { default: module.EditorExportButton };
});

const EditorCanvas = lazy(async () => {
  const module = await import('./EditorCanvas.tsx');
  return { default: module.EditorCanvas };
});

/**
 * The canvas structure editor, sized to fill its container and never to hide
 * part of its toolbar, with a tooltip on every toolbar button and a guide to
 * the keys.
 * @param props - What to draw, when to reload it, and where to send it.
 * @returns The editor.
 */
export function StructureEditor(props: StructureEditorProps): ReactElement {
  const {
    onChange,
    fragment = false,
    inputFormat = 'idcode',
    value = '',
    revision = 0,
    debounce = 300,
    minHeight = 320,
    mode = 'molecule',
    help = true,
    exportable = true,
    importable = true,
    onImport,
    className,
    style,
  } = props;

  const t = useChromeT();
  const containerRef = useToolbarFloor({ minHeight, revision });
  const handleChange = useDebouncedChange(onChange, debounce, revision);
  const drawing = useEditorStructure({ value, inputFormat, revision });
  const handleEdit = useCallback(
    (change: StructureEditorChange) => {
      // Tapped undebounced, so a button beside the canvas reads the structure
      // as it stands rather than as it stood before the last burst.
      drawing.track(change);
      handleChange(change);
    },
    [drawing, handleChange],
  );
  const imports = useStructureImport({
    revision,
    fragment,
    onImport,
    onRead: handleEdit,
  });
  const takesImports = importable && mode === 'molecule';
  const drop = useStructureDrop(takesImports ? imports.load : undefined);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ ...ROOT_STYLE, minHeight, ...style }}
      {...drop.targetProps}
    >
      <Suspense
        fallback={
          <div style={LOADING_STYLE}>{t('structure.loadingEditor')}</div>
        }
      >
        <EditorCanvas
          key={imports.canvasKey}
          onChange={handleEdit}
          fragment={fragment}
          inputFormat={imports.idCode === null ? inputFormat : 'idcode'}
          value={imports.idCode ?? value}
          mode={mode}
        />
        {help ? (
          <ToolbarTooltip containerRef={containerRef} mode={mode} />
        ) : null}
        <div style={CORNER_STYLE}>
          {takesImports ? (
            <EditorImportButton
              onImport={imports.load}
              accept={onImport === undefined ? STRUCTURE_FILES : undefined}
            />
          ) : null}
          {exportable && mode === 'molecule' ? (
            <EditorExportButton
              source={drawing.source}
              fragment={fragment}
              empty={drawing.empty}
            />
          ) : null}
          {help ? (
            <EditorHelpButton
              containerRef={containerRef}
              mode={mode}
              fragment={fragment}
            />
          ) : null}
        </div>
        {imports.problem === null ? null : (
          <EditorImportProblem
            problem={imports.problem}
            onDismiss={imports.dismiss}
          />
        )}
      </Suspense>
      {drop.over ? (
        <StructureDropOverlay
          label={t('structure.import.drop')}
          handlers={drop.overlayProps}
        />
      ) : null}
    </div>
  );
}

/**
 * The canvas is positioned out of the height computation, so the container's
 * own height is what the measured toolbar floor writes on it. The `minHeight`
 * prop is applied on top of this at first render: without a height before the
 * toolbar has been measured, the editor is built at zero size and never paints
 * the structure it was given.
 */
const ROOT_STYLE: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box',
  border: `1px solid ${TOKEN.border}`,
  borderRadius: 6,
  background: '#fff',
};

/**
 * The corner the editor's own buttons sit in: open, export, then help — the
 * drawing in, the drawing out, and the guide last.
 */
const CORNER_STYLE: CSSProperties = {
  position: 'absolute',
  top: 4,
  right: 4,
  display: 'flex',
  gap: 2,
};

/** The box the canvas will fill, so its arrival moves nothing. */
const LOADING_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: TOKEN.textFaint,
  fontSize: 13,
};

/** What the editor reads itself, offered first by the file picker. */
const STRUCTURE_FILES = '.mol,.sdf,.sd,.smi,.smiles,.txt';
