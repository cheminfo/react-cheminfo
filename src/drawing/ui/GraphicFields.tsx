import { Button, ButtonGroup, FormGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type {
  DrawGraphic,
  DrawPathGraphic,
  GraphicPatch,
} from '../core/graphics.ts';
import { isBoxGraphic, isClosedGraphic } from '../core/graphics.ts';
import type { Patching } from '../core/shared.ts';
import { sharedValue } from '../core/shared.ts';

import { BoxSizeFields } from './BoxSizeFields.tsx';
import { DashSelect } from './DashSelect.tsx';
import { GraphicFillFields } from './GraphicFillFields.tsx';
import { SharedNumberInput, SharedSwitch } from './MixedFields.tsx';

/** What {@link GraphicFields} needs. */
export interface GraphicFieldsProps {
  /** The shapes selected. */
  graphics: readonly DrawGraphic[];
  /** The drawing style, whose line width a shape falls back on. */
  style: {
    /** The drawing's line width, in points. */
    lineWidth: number;
  };
  /**
   * Called with the change every shape takes: one patch for all of them, or
   * one worked out from each.
   */
  onChange: (patch: Patching<GraphicPatch, DrawGraphic>) => void;
  /**
   * Whether the handles setting the tangents of the one curve selected are
   * shown.
   * @default false
   */
  editingTangents?: boolean;
  /**
   * Called with whether the tangent handles are to be shown, from the
   * Tangents field of a single curve; without it the field offers only Reset.
   * @default undefined — no Edit button
   */
  onEditTangents?: (editing: boolean) => void;
}

/**
 * The fields of the shapes selected, changed together: the size of
 * rectangles and ellipses, the width of their outline and their dashes,
 * whether polylines and polygons are drawn as smooth curves, the corners of
 * rectangles, and the fill of closed shapes and whether their outline is
 * drawn. A field is offered when every shape has it, and one they differ on
 * has nothing pressed or says "Mixed". The tangents of a curve are set on
 * one curve at a time. Their ink is the site's to offer.
 * @param props - See {@link GraphicFieldsProps}.
 * @returns The fields.
 */
export function GraphicFields(props: GraphicFieldsProps): ReactElement {
  const {
    graphics,
    style,
    onChange,
    editingTangents = false,
    onEditTangents,
  } = props;
  const boxes = graphics.filter((graphic) => isBoxGraphic(graphic));
  const rectangles = boxes.filter((graphic) => graphic.kind === 'rectangle');
  const curves = graphics.filter(
    (graphic): graphic is DrawPathGraphic =>
      graphic.kind === 'polyline' || graphic.kind === 'polygon',
  );
  const [only] = graphics;
  return (
    <>
      {boxes.length === graphics.length ? (
        <BoxSizeFields
          objects={boxes}
          label="Shape"
          minSide={1}
          edit={(resize) => {
            onChange((graphic) =>
              isBoxGraphic(graphic) ? resize(graphic) : {},
            );
          }}
        />
      ) : null}
      <FormGroup label="Line width" labelInfo="pt">
        <SharedNumberInput
          size="small"
          ariaLabel="Width of the shape's line, in points"
          objects={graphics}
          read={(graphic) => graphic.lineWidth ?? style.lineWidth}
          min={0.1}
          max={8}
          step={0.1}
          onChange={(lineWidth) => {
            onChange({ lineWidth });
          }}
        />
      </FormGroup>
      <FormGroup label="Dashes">
        <DashSelect
          label="Dashes of the shape's line"
          value={sharedValue(graphics, (graphic) => graphic.dashed ?? false)}
          onChange={(dashed) => {
            onChange({ dashed: dashed || undefined });
          }}
        />
      </FormGroup>
      {curves.length === graphics.length ? (
        <SharedSwitch
          label="Smooth"
          checked={sharedValue(curves, (graphic) => graphic.smooth ?? false)}
          onChange={(checked) => {
            onChange({ smooth: checked || undefined });
          }}
        />
      ) : null}
      {graphics.length === 1 && only && !isBoxGraphic(only) && only.smooth ? (
        <TangentFields
          graphic={only}
          editing={editingTangents}
          onEdit={onEditTangents}
          onReset={() => {
            onChange({ controls: undefined });
          }}
        />
      ) : null}
      {rectangles.length === graphics.length ? (
        <FormGroup label="Corner radius" labelInfo="pt">
          <SharedNumberInput
            size="small"
            ariaLabel="Radius of the rectangle's corners, in points"
            objects={rectangles}
            read={(graphic) => graphic.radius ?? 0}
            min={0}
            max={smallestHalfSide(rectangles)}
            step={0.5}
            onChange={(radius) => {
              onChange({ radius: radius || undefined });
            }}
          />
        </FormGroup>
      ) : null}
      {graphics.every((graphic) => isClosedGraphic(graphic)) ? (
        <GraphicFillFields graphics={graphics} onChange={onChange} />
      ) : null}
    </>
  );
}

// The largest corner radius every rectangle takes: half its shorter side.
function smallestHalfSide(
  rectangles: ReadonlyArray<{ width: number; height: number }>,
): number {
  let smallest = Infinity;
  for (const { width, height } of rectangles) {
    smallest = Math.min(smallest, width / 2, height / 2);
  }
  return smallest;
}

// The tangents of a curve: show the handles that set them, or let the curve
// pick them all again.
function TangentFields(props: {
  graphic: DrawPathGraphic;
  editing: boolean;
  onEdit: ((editing: boolean) => void) | undefined;
  onReset: () => void;
}): ReactElement {
  const { graphic, editing, onEdit, onReset } = props;
  return (
    <FormGroup label="Tangents">
      <ButtonGroup>
        {onEdit ? (
          <Button
            size="small"
            icon="edit"
            active={editing}
            onClick={() => {
              onEdit(!editing);
            }}
          >
            Edit
          </Button>
        ) : null}
        <Button
          size="small"
          icon="reset"
          disabled={!graphic.controls}
          onClick={onReset}
        >
          Reset
        </Button>
      </ButtonGroup>
    </FormGroup>
  );
}
