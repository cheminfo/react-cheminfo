import {
  Button,
  Menu,
  MenuItem,
  PopoverNext,
  Tooltip,
} from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { TooltipHelpContent } from 'react-science/ui';

import { formatPercent } from '../../format/core/numbers.ts';
import { ZOOM_PRESETS, ZOOM_RANGE, zoomShare } from '../core/camera.ts';

import { MeasuredSlider } from './MeasuredSlider.tsx';

/** What {@link ZoomControl} is given. */
export interface ZoomControlProps {
  /** How close the view is: the camera's screen pixels per point. */
  zoom: number;
  /** Called with the share of the printed size asked for: 1 at 100 %. */
  onZoomShare: (share: number) => void;
  /** Called to bring the whole drawing back into view. */
  onFit: () => void;
  /**
   * What fitting brings into view, said in the fit button's tooltip.
   * @default 'Brings the whole drawing back into view.'
   */
  fitDescription?: string;
  /**
   * The fit button's name, for assistive technology.
   * @default 'Fit the drawing in view'
   */
  fitLabel?: string;
  /**
   * The closest the view goes, as a share of the printed size: the end of
   * the slider, and the last zoom the menu offers. A view drawn as layers too
   * large for a graphics card stops short of the editors' 1600 %.
   * @default ZOOM_RANGE.max
   */
  max?: number;
  /**
   * Whether the view fits now and follows its frame: the fit button shows it
   * on, and no zoom of the menu is marked as the one chosen.
   * @default false
   */
  fitted?: boolean;
}

/**
 * The zoom at the right of an editor's status bar, the same in every editor of
 * the family: a slider from 25 % to 1600 % of the printed size, running on the
 * logarithm so each step is the same factor; the value, which opens a menu of
 * the usual zooms; and zoom to fit, on `f`. A view that cannot go as close
 * ends both earlier, through `max`.
 * @param props - See {@link ZoomControlProps}.
 * @returns The control.
 */
export function ZoomControl(props: ZoomControlProps): ReactElement {
  const {
    zoom,
    onZoomShare,
    onFit,
    fitDescription = 'Brings the whole drawing back into view.',
    fitLabel = 'Fit the drawing in view',
    fitted = false,
  } = props;
  const share = zoomShare(zoom);
  const max = Math.min(ZOOM_RANGE.max, props.max ?? ZOOM_RANGE.max);
  const low = Math.log2(ZOOM_RANGE.min);
  const high = Math.log2(Math.max(ZOOM_RANGE.min, max));
  return (
    <span className="zoom-control">
      <MeasuredSlider
        min={low}
        max={high}
        initialValue={low}
        stepSize={0.01}
        labelRenderer={false}
        value={Math.min(high, Math.max(low, Math.log2(share)))}
        onChange={(value) => {
          onZoomShare(2 ** value);
        }}
        handleHtmlProps={{ 'aria-label': 'Zoom' }}
      />
      <PopoverNext
        placement="top-end"
        content={
          <Menu aria-label="Zoom">
            {ZOOM_PRESETS.filter((preset) => preset <= max).map((preset) => (
              <MenuItem
                key={preset}
                text={formatPercent(preset, 0)}
                active={!fitted && Math.abs(preset - share) < 0.005}
                onClick={() => {
                  onZoomShare(preset);
                }}
              />
            ))}
          </Menu>
        }
      >
        <Button
          className="zoom-control__level"
          variant="minimal"
          size="small"
          text={formatPercent(share, 0)}
          endIcon="caret-up"
          aria-label="Zoom level"
        />
      </PopoverNext>
      <Tooltip
        placement="top"
        hoverOpenDelay={400}
        content={
          <TooltipHelpContent
            title="Zoom to fit"
            description={fitDescription}
            shortcuts={['f']}
            subTitles={[
              { title: 'Zoom in and out', shortcuts: ['Wheel', '+', '-'] },
              { title: 'Move the view', shortcuts: ['Right-drag'] },
            ]}
          />
        }
      >
        <Button
          variant="minimal"
          size="small"
          icon="zoom-to-fit"
          aria-label={fitLabel}
          active={fitted}
          onClick={onFit}
        />
      </Tooltip>
    </span>
  );
}
