import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  PopoverNext,
} from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { formatColorScale, resolveColorScale } from '../core/scaleText.ts';
import { COLOR_SCALES } from '../core/scales.ts';

import { ColorScaleBar } from './ColorScaleBar.tsx';
import { ColorScaleEditor } from './ColorScaleEditor.tsx';
import { ColorScaleEntry } from './ColorScaleEntry.tsx';

const BUTTON_BAR_WIDTH = 72;

/** What {@link ColorScaleSelect} chooses. */
export interface ColorScaleSelectProps {
  /**
   * The scale in force: the id of one of {@link COLOR_SCALES}, or a scale of
   * the reader's own as `formatColorScale` writes it.
   */
  value: string;
  /** Called with the text of the scale that was chosen. */
  onChange: (value: string) => void;
  /**
   * Caption written above the button.
   * @default '' — no caption
   */
  label?: string;
  /**
   * Whether the menu offers a scale of the reader's own.
   * @default true
   */
  allowCustom?: boolean;
  /**
   * Value of the `data-testid` attribute of the button, for the end-to-end tests.
   * @default undefined
   */
  testId?: string;
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * The picker a quantity's colours are chosen with: every scale drawn as itself,
 * and a way to build one.
 *
 * A ramp is picked by looking at it rather than by reading its name, so the
 * menu is the strips; the reader who needs the rainbow their course used, or
 * the grey a photocopier will keep, finds it without knowing what viridis is.
 * @param props - See {@link ColorScaleSelectProps}.
 * @returns The button, and the menu it opens.
 */
export function ColorScaleSelect(props: ColorScaleSelectProps): ReactElement {
  const {
    className,
    value,
    onChange,
    label = '',
    allowCustom = true,
    testId,
  } = props;
  const [isOpen, setOpen] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const resolved = resolveColorScale(value);

  const content = isEditing ? (
    <div>
      <div style={EDITOR_HEADER_STYLE}>
        <Button
          icon="chevron-left"
          variant="minimal"
          size="small"
          text="Scales"
          onClick={() => {
            setEditing(false);
          }}
        />
        <Button
          size="small"
          text="Done"
          onClick={() => {
            setEditing(false);
            setOpen(false);
          }}
        />
      </div>
      <ColorScaleEditor
        value={resolved.scale}
        onChange={(scale) => {
          onChange(formatColorScale(scale));
        }}
      />
    </div>
  ) : (
    <Menu style={MENU_STYLE}>
      {COLOR_SCALES.map((entry, index) => (
        <ColorScaleEntry
          key={entry.id}
          id={entry.id}
          label={entry.label}
          kind={entry.kind}
          description={entry.description}
          previous={COLOR_SCALES[index - 1]?.kind}
          selected={entry.id === resolved.id}
          onChange={onChange}
        />
      ))}
      {allowCustom ? (
        <>
          <MenuDivider />
          <MenuItem
            icon="edit"
            text="Custom…"
            label={resolved.id === null ? 'in use' : undefined}
            shouldDismissPopover={false}
            onClick={() => {
              setEditing(true);
            }}
          />
        </>
      ) : null}
    </Menu>
  );

  return (
    <label className={className} style={FIELD_STYLE}>
      {label === '' ? null : <span style={CAPTION_STYLE}>{label}</span>}
      <PopoverNext
        // A fade, like the pickers a site puts beside this one: the default
        // grows the panel from a third of its size over about a second, which
        // reads as the row behaving differently control by control.
        animation="minimal"
        arrow={false}
        placement="bottom-start"
        isOpen={isOpen}
        content={content}
        onInteraction={(next) => {
          setOpen(next);
          if (!next) setEditing(false);
        }}
      >
        <Button
          alignText="start"
          aria-label={label === '' ? 'Colour scale' : label}
          data-testid={testId}
          endIcon="caret-down"
          fill
          text={
            <span style={BUTTON_TEXT_STYLE}>
              <span>{resolved.label}</span>
              <ColorScaleBar
                scale={resolved.scale}
                style={{ width: BUTTON_BAR_WIDTH }}
              />
            </span>
          }
        />
      </PopoverNext>
    </label>
  );
}

const FIELD_STYLE = {
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  gap: 3,
  minWidth: 180,
  maxWidth: 420,
} as const satisfies CSSProperties;

const CAPTION_STYLE = {
  color: TOKEN.textMuted,
  fontSize: 12,
  fontWeight: 600,
} as const satisfies CSSProperties;

const BUTTON_TEXT_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
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
