import { MenuDivider, MenuItem } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { resolveColorScale } from '../core/scaleText.ts';
import type { ColorScaleKind } from '../core/scales.ts';
import { COLOR_SCALE_KIND_LABELS } from '../core/scales.ts';

import { ColorScaleBar } from './ColorScaleBar.tsx';

/** One line of the colour scale menu, and what precedes it. */
interface ColorScaleEntryProps {
  /** Id of the scale, which is what a link carries. */
  id: string;
  /** What the line is called. */
  label: string;
  /** What the scale is for, which is the heading it sits under. */
  kind: ColorScaleKind;
  /** One line on when to reach for it, read on hover. */
  description: string;
  /** Kind of the line above, so a heading is written once; `undefined` for the first line. */
  previous: ColorScaleKind | undefined;
  /** Whether it is the scale in force. */
  selected: boolean;
  /** Called with the id when the line is chosen. */
  onChange: (value: string) => void;
}

/**
 * One line of the colour scale menu, under the heading of its kind when the
 * kind changes.
 * @param props - See {@link ColorScaleEntryProps}.
 * @returns The line, with its heading when it opens a kind.
 */
export function ColorScaleEntry(props: ColorScaleEntryProps): ReactElement {
  const { id, label, kind, description, previous, selected, onChange } = props;
  const t = useChromeT();
  const entry = (
    <MenuItem
      roleStructure="listoption"
      selected={selected}
      htmlTitle={t.or(`color.scale.${id}.description`, description)}
      text={
        <span style={ITEM_STYLE}>
          <span>{t.or(`color.scale.${id}.label`, label)}</span>
          <ColorScaleBar scale={resolveColorScale(id).scale} />
        </span>
      }
      onClick={() => {
        onChange(id);
      }}
    />
  );
  if (previous === kind) return entry;
  return (
    <>
      <MenuDivider
        title={t.or(`color.kind.${kind}`, COLOR_SCALE_KIND_LABELS[kind])}
      />
      {entry}
    </>
  );
}

const ITEM_STYLE = {
  display: 'grid',
  gridTemplateColumns: '7rem 1fr',
  alignItems: 'center',
  gap: 10,
  minWidth: 220,
} as const satisfies CSSProperties;
