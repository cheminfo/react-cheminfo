import { Button, FormGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { DrawGraphic, GraphicPatch } from '../core/graphics.ts';
import { PALETTE, joinColor, splitColor } from '../core/palette.ts';
import type { Patching } from '../core/shared.ts';
import { sharedValue } from '../core/shared.ts';

import { GraphicGradientFields } from './GraphicGradientFields.tsx';
import { SharedNumberInput, SharedSwitch } from './MixedFields.tsx';
import { CustomColorButton, SwatchRow } from './SwatchRow.tsx';

/** What a shape filled with nothing reads as. */
const NO_FILL = 'none';

/**
 * The fill of the closed shapes selected: none, a colour of the palette or
 * any other, the gradient it blends along, then, once every one is filled,
 * its opacity and whether the outline is drawn. A colour picked keeps each
 * shape's own opacity; shapes filled differently have no swatch pressed.
 * @param props - The shapes, and what to call with a change.
 * @param props.graphics - The closed shapes selected.
 * @param props.onChange - Called with the change every shape takes: one
 * patch for all of them, or one worked out from each.
 * @returns The fields.
 */
export function GraphicFillFields(props: {
  graphics: readonly DrawGraphic[];
  onChange: (patch: Patching<GraphicPatch, DrawGraphic>) => void;
}): ReactElement {
  const { graphics, onChange } = props;
  const hex = sharedValue(graphics, (graphic) =>
    graphic.fill ? splitColor(graphic.fill).hex : NO_FILL,
  );
  const filled = graphics.every((graphic) => graphic.fill);
  const fill = sharedValue(graphics, (graphic) => graphic.fill);
  return (
    <>
      <FormGroup label="Fill">
        <SwatchRow
          label="Fill"
          colors={PALETTE}
          value={hex}
          nameOf={(name) => `Filled in ${name.toLowerCase()}`}
          clip
          leading={
            <Button
              size="small"
              variant="minimal"
              icon="disable"
              active={hex === NO_FILL}
              aria-label="No fill"
              title="No fill"
              onClick={() => {
                onChange({ fill: undefined });
              }}
            />
          }
          custom={
            <CustomColorButton
              value={fill}
              presets={PALETTE.map((color) => color.value)}
              label="Filled in another colour, with its opacity"
              onPick={(color) => {
                onChange({ fill: color });
              }}
            />
          }
          onPick={(color) => {
            onChange((graphic) => ({
              fill: joinColor(color, opacityOf(graphic) ?? 1),
            }));
          }}
        />
      </FormGroup>
      <GraphicGradientFields graphics={graphics} onChange={onChange} />
      {filled ? (
        <>
          <FormGroup label="Fill opacity" labelInfo="%">
            <SharedNumberInput
              size="small"
              ariaLabel="Opacity of the fill, in percent"
              objects={graphics}
              read={(graphic) => Math.round((opacityOf(graphic) ?? 1) * 100)}
              min={5}
              max={100}
              step={5}
              integer
              onChange={(percent) => {
                onChange((graphic) => opacityPatch(graphic, percent / 100));
              }}
            />
          </FormGroup>
          <SharedSwitch
            label="Outline"
            checked={sharedValue(
              graphics,
              (graphic) => graphic.outline !== false,
            )}
            onChange={(checked) => {
              onChange({ outline: checked ? undefined : false });
            }}
          />
        </>
      ) : null}
    </>
  );
}

// The fill and the colour it blends into, both at an opacity.
function opacityPatch(graphic: DrawGraphic, opacity: number): GraphicPatch {
  const { fill, gradient } = graphic;
  if (!fill) return {};
  return {
    fill: withOpacity(fill, opacity),
    ...(gradient
      ? {
          gradient: {
            ...gradient,
            color: withOpacity(gradient.color, opacity),
          },
        }
      : {}),
  };
}

function withOpacity(color: string, opacity: number): string {
  return joinColor(splitColor(color).hex, opacity);
}

function opacityOf(graphic: DrawGraphic): number | undefined {
  return graphic.fill ? splitColor(graphic.fill).opacity : undefined;
}
