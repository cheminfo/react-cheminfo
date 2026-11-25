import { Button, PopoverNext } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { OverlayValueButton } from '../../overlay/ui/OverlayValueButton.tsx';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { sampleScale } from '../core/interpolate.ts';
import { resolveColorScale } from '../core/scaleText.ts';
import type { COLOR_SCALES, ColorScaleKind } from '../core/scales.ts';
import { DEFAULT_COLOR_SCALE_KINDS } from '../core/scales.ts';
import type { UNIFORM_COLOR_SCALE_ID } from '../core/uniform.ts';
import { isUniformColorScale, uniformSwatch } from '../core/uniform.ts';

import { ColorScaleBar } from './ColorScaleBar.tsx';
import { ColorScaleSelectMenu } from './ColorScaleSelectMenu.tsx';

const BUTTON_BAR_WIDTH = 72;
// Its two ends and its middle: the most dots `OverlaySwatchIcon` draws.
const BAR_SWATCHES = 3;

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
   * The kinds of scale the menu offers, each under its heading, in the order
   * {@link COLOR_SCALES} lists them. A site showing the channels of an image
   * adds `'channel'`: black to one colour, as a microscope shows a channel. A
   * scale in force that is not offered is still drawn and named.
   * @default DEFAULT_COLOR_SCALE_KINDS — sequential, diverging and cyclic
   */
  kinds?: readonly ColorScaleKind[];
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
 * The picker a quantity's colours are chosen with: every scale it offers drawn
 * as itself, and a way to build one.
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
    kinds = DEFAULT_COLOR_SCALE_KINDS,
    appearance = 'field',
    testId,
  } = props;
  const t = useChromeT();
  const [isOpen, setOpen] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const uniform = allowUniform && isUniformColorScale(value);
  const oneColor = uniformSwatch(uniform ? value : undefined).background;
  const resolved = resolveColorScale(value);

  const content = (
    <ColorScaleSelectMenu
      value={value}
      onChange={onChange}
      kinds={kinds}
      allowCustom={allowCustom}
      allowUniform={allowUniform}
      editing={isEditing}
      onEditing={setEditing}
      onDone={() => {
        setEditing(false);
        setOpen(false);
      }}
    />
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

const UNIFORM_BAR_STYLE = {
  display: 'inline-block',
  height: 12,
  borderRadius: 2,
} as const satisfies CSSProperties;
