import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  PopoverNext,
} from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { OverlayValueButton } from '../../overlay/ui/OverlayValueButton.tsx';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { normalizeHexColor } from '../core/hex.ts';
import { sampleScale } from '../core/interpolate.ts';
import { formatColorScale, resolveColorScale } from '../core/scaleText.ts';
import { COLOR_SCALES } from '../core/scales.ts';
import {
  UNIFORM_COLOR_SCALE_ID,
  formatUniformColorScale,
  isUniformColorScale,
  uniformSwatch,
} from '../core/uniform.ts';

import { ColorScaleBar } from './ColorScaleBar.tsx';
import { ColorScaleEditor } from './ColorScaleEditor.tsx';
import { ColorScaleEntry } from './ColorScaleEntry.tsx';

const BUTTON_BAR_WIDTH = 72;
// Its two ends and its middle: the most dots `OverlaySwatchIcon` draws.
const BAR_SWATCHES = 3;
// A `type="color"` input only takes six hex digits.
const UNREADABLE_COLOR = '#000000';

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
   * Whether the menu opens on one colour for every value, which a figure that
   * needs no key — a plain table to print — is drawn with. Chosen, it writes
   * {@link UNIFORM_COLOR_SCALE_ID}; its swatch picks the colour, written as
   * `formatUniformColorScale` does.
   * @default false
   */
  allowUniform?: boolean;
  /**
   * Whether it is a form field — a caption over a full-width button — or a
   * setting on a figure's bar, writing its name and its scale on one compact
   * line as `OverlayValueButton` does. The bar form needs an `OverlayLayer` or
   * a `FigureBar` above it for its measurements.
   * @default 'field'
   */
  appearance?: 'field' | 'bar';
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
    allowUniform = false,
    appearance = 'field',
    testId,
  } = props;
  const t = useChromeT();
  const [isOpen, setOpen] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const uniform = allowUniform && isUniformColorScale(value);
  const oneColor = uniformSwatch(uniform ? value : undefined).background;
  const resolved = resolveColorScale(value);

  const content = isEditing ? (
    <div>
      <div style={EDITOR_HEADER_STYLE}>
        <Button
          icon="chevron-left"
          variant="minimal"
          size="small"
          text={t('color.scales')}
          onClick={() => {
            setEditing(false);
          }}
        />
        <Button
          size="small"
          text={t('color.done')}
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
      {COLOR_SCALES.map((entry, index) => (
        <ColorScaleEntry
          key={entry.id}
          id={entry.id}
          label={entry.label}
          kind={entry.kind}
          description={entry.description}
          previous={COLOR_SCALES[index - 1]?.kind}
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
              setEditing(true);
            }}
          />
        </>
      ) : null}
    </Menu>
  );

  const scaleName = uniform
    ? t('color.uniform')
    : resolved.id === null
      ? t('color.custom')
      : t.or(`color.scale.${resolved.id}.label`, resolved.label);
  const name = label === '' ? t('color.colourScale') : label;

  const target =
    appearance === 'bar' ? (
      <OverlayValueButton
        label={name}
        value={scaleName}
        swatches={
          uniform ? [oneColor] : sampleScale(resolved.scale, BAR_SWATCHES)
        }
        active={isOpen}
        opensMenu
        testId={testId}
      />
    ) : (
      <Button
        alignText="start"
        aria-label={name}
        data-testid={testId}
        endIcon="caret-down"
        fill
        text={
          <span style={BUTTON_TEXT_STYLE}>
            <span>{scaleName}</span>
            {uniform ? (
              <span
                style={{
                  ...UNIFORM_BAR_STYLE,
                  width: BUTTON_BAR_WIDTH,
                  background: oneColor,
                }}
              />
            ) : (
              <ColorScaleBar
                scale={resolved.scale}
                style={{ width: BUTTON_BAR_WIDTH }}
              />
            )}
          </span>
        }
      />
    );

  const popover = (
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
      {target}
    </PopoverNext>
  );

  if (appearance === 'bar') return popover;

  return (
    <label className={className} style={FIELD_STYLE}>
      {label === '' ? null : <span style={CAPTION_STYLE}>{label}</span>}
      {popover}
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

// The lines of the menu, so one colour reads as one more choice among them.
const UNIFORM_ITEM_STYLE = {
  display: 'grid',
  gridTemplateColumns: '7rem 1fr',
  alignItems: 'center',
  gap: 10,
  minWidth: 220,
} as const satisfies CSSProperties;

const UNIFORM_BAR_STYLE = {
  display: 'inline-block',
  height: 12,
  borderRadius: 2,
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
