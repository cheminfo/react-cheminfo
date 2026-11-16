import { Button, FormGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { GraphicGradient } from '../core/graphicGradients.ts';
import { gradientCentre } from '../core/graphicGradients.ts';
import type { DrawGraphic, GraphicPatch } from '../core/graphics.ts';
import { PALETTE, joinColor, shadeOf, splitColor } from '../core/palette.ts';
import type { Patching } from '../core/shared.ts';
import { sharedValue } from '../core/shared.ts';
import type { Point } from '../core/types.ts';

import type { FillKind } from './GradientPickers.tsx';
import {
  CentreGrid,
  DirectionGrid,
  GradientKindRow,
} from './GradientPickers.tsx';
import { SharedNumberInput } from './MixedFields.tsx';
import { CustomColorButton, SwatchRow } from './SwatchRow.tsx';

/** What a shape with no fill is filled with when it is given a gradient. */
const FIRST_FILL = '#56b4e9';

/** The colours the fill blends into: white, then the palette. */
const BLENDS = [{ name: 'White', value: '#ffffff' }, ...PALETTE];

/**
 * How the fill of the closed shapes selected blends into a second colour:
 * flat, from side to side, from a middle line out to both sides as on a
 * cylinder, or out from a centre as on a sphere. Then the colour it blends
 * into, which may swap with the fill, and the direction a gradient runs in, or
 * the point a radial one starts from. A shape with no fill given a gradient is
 * filled first.
 * @param props - The shapes, and what to call with a change.
 * @param props.graphics - The closed shapes selected.
 * @param props.onChange - Called with the change every shape takes: one
 * patch for all of them, or one worked out from each.
 * @returns The fields.
 */
export function GraphicGradientFields(props: {
  graphics: readonly DrawGraphic[];
  onChange: (patch: Patching<GraphicPatch, DrawGraphic>) => void;
}): ReactElement {
  const { graphics, onChange } = props;
  const [first] = graphics;
  const from = first?.fill ?? FIRST_FILL;
  const to = first?.gradient?.color ?? shadeOf(from);
  const kind = sharedValue(graphics, (graphic) =>
    graphic.fill ? (graphic.gradient?.kind ?? 'flat') : 'flat',
  );
  const blended = graphics.every((graphic) => graphic.fill && graphic.gradient);
  const radial = graphics.map((graphic) => graphic.gradient?.kind === 'radial');
  const edit = (change: (gradient: GraphicGradient) => GraphicPatch) => {
    onChange((graphic) => (graphic.gradient ? change(graphic.gradient) : {}));
  };
  return (
    <>
      <FormGroup label="Gradient">
        <GradientKindRow
          value={kind}
          from={from}
          to={to}
          onPick={(next) => {
            onChange((graphic) => kindPatch(graphic, next));
          }}
        />
      </FormGroup>
      {blended ? (
        <FormGroup label="Blends into">
          <SwatchRow
            label="Blends into"
            colors={BLENDS}
            value={sharedValue(graphics, (graphic) =>
              graphic.gradient
                ? splitColor(graphic.gradient.color).hex
                : undefined,
            )}
            nameOf={(name) => `Blends into ${name.toLowerCase()}`}
            clip
            custom={
              <>
                <CustomColorButton
                  value={sharedValue(
                    graphics,
                    (graphic) => graphic.gradient?.color,
                  )}
                  presets={BLENDS.map((blend) => blend.value)}
                  label="Blends into another colour, with its opacity"
                  onPick={(color) => {
                    edit((gradient) => ({ gradient: { ...gradient, color } }));
                  }}
                />
                <Button
                  size="small"
                  variant="minimal"
                  icon="swap-horizontal"
                  aria-label="Swap the fill and the colour it blends into"
                  title="Swap the two colours"
                  onClick={() => {
                    onChange(swapPatch);
                  }}
                />
              </>
            }
            onPick={(picked) => {
              onChange((graphic) =>
                graphic.gradient && graphic.fill
                  ? {
                      gradient: {
                        ...graphic.gradient,
                        color: joinColor(
                          picked,
                          splitColor(graphic.fill).opacity,
                        ),
                      },
                    }
                  : {},
              );
            }}
          />
        </FormGroup>
      ) : null}
      {blended && radial.every(Boolean) ? (
        <FormGroup label="Centre">
          <CentreGrid
            centre={sharedCentre(graphics)}
            onPick={(point) => {
              edit((gradient) => {
                const { centre: _centre, ...rest } = gradient;
                const centre = gradientCentre(point);
                return { gradient: centre ? { ...rest, centre } : rest };
              });
            }}
          />
        </FormGroup>
      ) : null}
      {blended && !radial.some(Boolean) ? (
        <FormGroup label="Direction" labelInfo="°">
          <div className="gradient-direction">
            <DirectionGrid
              angle={sharedValue(
                graphics,
                (graphic) => graphic.gradient?.angle ?? 0,
              )}
              onPick={(angle) => {
                edit((gradient) => ({ gradient: withAngle(gradient, angle) }));
              }}
            />
            <SharedNumberInput
              size="small"
              className="gradient-direction__degrees"
              buttons={false}
              ariaLabel="Direction of the gradient, in degrees clockwise from left to right"
              objects={graphics}
              read={(graphic) => graphic.gradient?.angle ?? 0}
              min={0}
              max={359}
              step={15}
              integer
              onChange={(angle) => {
                edit((gradient) => ({ gradient: withAngle(gradient, angle) }));
              }}
            />
          </div>
        </FormGroup>
      ) : null}
    </>
  );
}

// What picking a way of blending changes on a shape: flat drops the gradient;
// a gradient keeps the colour already blended into, and its direction or its
// centre where the new kind has one, and fills a shape that had no fill.
function kindPatch(graphic: DrawGraphic, kind: FillKind): GraphicPatch {
  if (kind === 'flat') return { gradient: undefined };
  const fill = graphic.fill ?? FIRST_FILL;
  const { gradient } = graphic;
  const next: GraphicGradient = {
    kind,
    color: gradient?.color ?? shadeOf(fill),
  };
  if (kind !== 'radial' && gradient?.angle) next.angle = gradient.angle;
  if (kind === 'radial' && gradient?.centre) next.centre = gradient.centre;
  return { fill, gradient: next };
}

// The fill and the colour it blends into, swapped.
function swapPatch(graphic: DrawGraphic): GraphicPatch {
  const { fill, gradient } = graphic;
  if (!fill || !gradient) return {};
  return { fill: gradient.color, gradient: { ...gradient, color: fill } };
}

function withAngle(gradient: GraphicGradient, angle: number): GraphicGradient {
  const { angle: _angle, ...rest } = gradient;
  return angle ? { ...rest, angle } : rest;
}

// The centre every radial gradient selected starts from, if they agree.
function sharedCentre(graphics: readonly DrawGraphic[]): Point | undefined {
  const key = sharedValue(graphics, (graphic) => {
    const centre = graphic.gradient?.centre;
    return centre ? `${centre.x} ${centre.y}` : '0 0';
  });
  if (key === undefined) return undefined;
  const [x = 0, y = 0] = key.split(' ').map(Number);
  return { x, y };
}
