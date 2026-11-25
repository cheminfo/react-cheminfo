import { Button, Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { normalizeHexColor } from '../core/hex.ts';
import { formatColorScale, resolveColorScale } from '../core/scaleText.ts';
import type { ColorScaleKind } from '../core/scales.ts';
import { COLOR_SCALES } from '../core/scales.ts';
import {
  UNIFORM_COLOR_SCALE_ID,
  formatUniformColorScale,
  isUniformColorScale,
  uniformSwatch,
} from '../core/uniform.ts';

import { ColorScaleEditor } from './ColorScaleEditor.tsx';
import { ColorScaleEntry } from './ColorScaleEntry.tsx';

// A `type="color"` input only takes six hex digits.
const UNREADABLE_COLOR = '#000000';

/** What {@link ColorScaleSelectMenu} offers, and where the choice goes. */
export interface ColorScaleSelectMenuProps {
  /** The scale in force, as the picker holds it. */
  value: string;
  /** Called with the text of the scale chosen, or built in the editor. */
  onChange: (value: string) => void;
  /** The kinds whose scales are listed, each under its heading. */
  kinds: readonly ColorScaleKind[];
  /** Whether a scale of the reader's own is offered. */
  allowCustom: boolean;
  /** Whether one colour for every value is offered. */
  allowUniform: boolean;
  /** Whether the editor shows instead of the strips. */
  editing: boolean;
  /** Called with `true` to open the editor, `false` to go back to the strips. */
  onEditing: (editing: boolean) => void;
  /** Called when the reader is done with the editor, to close the picker. */
  onDone: () => void;
}

/**
 * What the colour scale picker opens: the strips of the kinds it offers, in
 * the order the registry lists them, or the editor a scale of one's own is
 * built in.
 * @param props - See {@link ColorScaleSelectMenuProps}.
 * @returns The menu, or the editor.
 */
export function ColorScaleSelectMenu(
  props: ColorScaleSelectMenuProps,
): ReactElement {
  const { value, onChange, kinds, allowCustom, allowUniform } = props;
  const { editing, onEditing, onDone } = props;
  const t = useChromeT();
  const uniform = allowUniform && isUniformColorScale(value);
  const resolved = resolveColorScale(value);

  if (editing) {
    return (
      <div>
        <div style={EDITOR_HEADER_STYLE}>
          <Button
            icon="chevron-left"
            variant="minimal"
            size="small"
            text={t('color.scales')}
            onClick={() => {
              onEditing(false);
            }}
          />
          <Button size="small" text={t('color.done')} onClick={onDone} />
        </div>
        <ColorScaleEditor
          value={resolved.scale}
          onChange={(scale) => {
            onChange(formatColorScale(scale));
          }}
        />
      </div>
    );
  }

  const offered = COLOR_SCALES.filter((entry) => kinds.includes(entry.kind));
  const oneColor = uniformSwatch(uniform ? value : undefined).background;
  return (
    <Menu style={MENU_STYLE}>
      {allowUniform ? (
        <MenuItem
          roleStructure="listoption"
          selected={uniform}
          htmlTitle={t('color.uniformDescription')}
          text={
            <span style={UNIFORM_ITEM_STYLE}>
              <span>{t('color.uniform')}</span>
              <input
                type="color"
                aria-label={t('color.uniformColour')}
                title={t('color.uniformColour')}
                value={normalizeHexColor(oneColor) ?? UNREADABLE_COLOR}
                style={UNIFORM_INPUT_STYLE}
                // The swatch picks the colour; the rest of the row chooses
                // one colour and closes the menu.
                onClick={(event) => {
                  event.stopPropagation();
                }}
                onChange={(event) => {
                  onChange(formatUniformColorScale(event.target.value));
                }}
              />
            </span>
          }
          onClick={() => {
            onChange(uniform ? value : UNIFORM_COLOR_SCALE_ID);
          }}
        />
      ) : null}
      {offered.map((entry, index) => (
        <ColorScaleEntry
          key={entry.id}
          id={entry.id}
          label={entry.label}
          kind={entry.kind}
          description={entry.description}
          previous={offered[index - 1]?.kind}
          selected={!uniform && entry.id === resolved.id}
          onChange={onChange}
        />
      ))}
      {allowCustom ? (
        <>
          <MenuDivider />
          <MenuItem
            icon="edit"
            text={t('color.customEllipsis')}
            label={
              resolved.id === null && !uniform ? t('color.inUse') : undefined
            }
            shouldDismissPopover={false}
            onClick={() => {
              onEditing(true);
            }}
          />
        </>
      ) : null}
    </Menu>
  );
}

// The lines of the menu, so one colour reads as one more choice among them.
const UNIFORM_ITEM_STYLE = {
  display: 'grid',
  gridTemplateColumns: '7rem 1fr',
  alignItems: 'center',
  gap: 10,
  minWidth: 220,
} as const satisfies CSSProperties;

const UNIFORM_INPUT_STYLE = {
  width: '100%',
  height: 18,
  padding: 0,
  border: 0,
  background: 'none',
  cursor: 'pointer',
} as const satisfies CSSProperties;

const MENU_STYLE = {
  maxHeight: '60vh',
  overflowY: 'auto',
} as const satisfies CSSProperties;

const EDITOR_HEADER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '8px 12px 0',
} as const satisfies CSSProperties;
