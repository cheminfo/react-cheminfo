import { Button, Callout } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

import type { StructureImportProblem } from './useStructureImport.ts';

/** What {@link EditorImportProblem} needs. */
export interface EditorImportProblemProps {
  /** What went wrong. */
  problem: StructureImportProblem;
  /** Forget it. */
  onDismiss: () => void;
}

/**
 * The line along the bottom of the canvas that says a drop loaded nothing,
 * and that the drawing is still there.
 * @param props - See {@link EditorImportProblemProps}.
 * @returns The line.
 */
export function EditorImportProblem(
  props: EditorImportProblemProps,
): ReactElement {
  const { problem, onDismiss } = props;
  const t = useChromeT();
  return (
    <div role="alert" style={PLACE}>
      <Callout intent="danger" icon={null} compact style={LINE}>
        <span style={TEXT}>
          {problem.file === null
            ? t('structure.import.unreadableText')
            : t('structure.import.unreadableFile', { name: problem.file })}
        </span>
        <Button
          variant="minimal"
          size="small"
          icon="cross"
          aria-label={t('overlay.dismiss')}
          onClick={onDismiss}
        />
      </Callout>
    </div>
  );
}

/** Clear of the tool palette, two 21px columns in a 2px border, at the left. */
const PLACE: CSSProperties = {
  position: 'absolute',
  right: 4,
  bottom: 4,
  left: 52,
  zIndex: 10,
};

const LINE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12,
};

const TEXT: CSSProperties = { flex: 1 };
