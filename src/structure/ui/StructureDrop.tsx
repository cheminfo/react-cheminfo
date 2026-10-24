import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { StructureTransfer } from '../core/structureTransfer.ts';

import { StructureDropOverlay } from './StructureDropOverlay.tsx';
import { useStructureDrop } from './useStructureDrop.ts';

/** What {@link StructureDrop} needs. */
export interface StructureDropProps {
  /** Called with the files or the text dropped. */
  onDrop: (transfer: StructureTransfer) => void;
  /** What the drop lands on. */
  children: ReactNode;
  /**
   * What the overlay says while something is dragged over.
   * @default 'Drop to load the structure', in the page's language
   */
  label?: string;
  /**
   * Take no drop, while a load is already running for instance.
   * @default false
   */
  disabled?: boolean;
  /**
   * Class of the wrapping element.
   * @default undefined
   */
  className?: string;
  /**
   * Extra style for the wrapping element, which is positioned so the overlay
   * covers it.
   * @default undefined
   */
  style?: CSSProperties;
}

/**
 * Make an area take a structure file, or structure text dragged from another
 * page, with the same veil the structure editor raises over its canvas. What
 * was dropped is handed over unread: the page knows which formats it takes.
 * @param props - See {@link StructureDropProps}.
 * @returns The area.
 */
export function StructureDrop(props: StructureDropProps): ReactElement {
  const { onDrop, children, label, disabled = false } = props;
  const { className, style } = props;
  const t = useChromeT();
  const drop = useStructureDrop(disabled ? undefined : onDrop);

  return (
    <div
      className={className}
      style={{ position: 'relative', ...style }}
      {...drop.targetProps}
    >
      {children}
      {drop.over ? (
        <StructureDropOverlay
          label={label ?? t('structure.import.drop')}
          handlers={drop.overlayProps}
        />
      ) : null}
    </div>
  );
}
