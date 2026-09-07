import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  PopoverNext,
} from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { ColorScale } from '../core/interpolate.ts';
import { formatColorScale, resolveColorScale } from '../core/scaleText.ts';
import type { ColorScaleKind } from '../core/scales.ts';
import { COLOR_SCALES, COLOR_SCALE_KIND_LABELS } from '../core/scales.ts';

import { ColorScaleBar } from './ColorScaleBar.tsx';
import { ColorScaleEditor } from './ColorScaleEditor.tsx';

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
  const { value, onChange, label = '', allowCustom = true, testId } = props;
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
        <ScaleEntry
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
    <label style={FIELD_STYLE}>
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

/**
 * One line of the menu, under the heading of its kind when the kind changes.
 * @param props - The scale the line offers, and what precedes it.
 * @param props.id - Id of the scale, which is what a link carries.
 * @param props.label - What the line is called.
 * @param props.kind - What the scale is for, which is the heading it sits under.
 * @param props.description - One line on when to reach for it, read on hover.
 * @param props.previous - Kind of the line above, so a heading is written once.
 * @param props.selected - Whether it is the scale in force.
 * @param props.onChange - Called with the id when the line is chosen.
 * @returns The line, with its heading when it opens a kind.
 */
function ScaleEntry(props: {
  id: string;
  label: string;
  kind: ColorScaleKind;
  description: string;
  previous: ColorScaleKind | undefined;
  selected: boolean;
  onChange: (value: string) => void;
}): ReactElement {
  const { id, label, kind, description, previous, selected, onChange } = props;
  const entry = (
    <MenuItem
      roleStructure="listoption"
      selected={selected}
      htmlTitle={description}
      text={
        <span style={ITEM_STYLE}>
          <span>{label}</span>
          <ColorScaleBar scale={scaleOf(id)} />
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
      <MenuDivider title={COLOR_SCALE_KIND_LABELS[kind]} />
      {entry}
    </>
  );
}

function scaleOf(id: string): ColorScale {
  return resolveColorScale(id).scale;
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
  color: 'var(--text-muted, #5b6875)',
  fontSize: 12,
  fontWeight: 600,
} as const satisfies CSSProperties;

const BUTTON_TEXT_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
} as const satisfies CSSProperties;

const ITEM_STYLE = {
  display: 'grid',
  gridTemplateColumns: '7rem 1fr',
  alignItems: 'center',
  gap: 10,
  minWidth: 220,
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
