import type { PointerEvent, ReactElement } from 'react';
import { useRef, useState } from 'react';

import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';
import type { ProjectionSamples } from '../core/projectionSamples.ts';

import { ProjectionMapTab } from './ProjectionMapTab.tsx';
import { ProjectionPairsTab } from './ProjectionPairsTab.tsx';
import { ProjectionReadout } from './ProjectionReadout.tsx';
import { ProjectionSharesTab } from './ProjectionSharesTab.tsx';
import type { ProjectionVariableTrack } from './ProjectionVariablesTab.tsx';
import { ProjectionVariablesTab } from './ProjectionVariablesTab.tsx';
import type { ProjectionMapView } from './projectionMapView.ts';
import type { ProjectionModels } from './projectionTabModels.ts';
import type { ProjectionStateApi } from './useProjectionState.ts';

/** What {@link ProjectionPanel} needs. */
export interface ProjectionPanelProps {
  /** The tab, the options and the selection every tab shares. */
  state: ProjectionStateApi;
  /** What the run produced, whatever produced it. */
  result: ProjectionResult;
  /** Who the rows are. */
  samples: ProjectionSamples;
  /** The words the viewer writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** The two figures the bar explains and a tab draws. */
  models: ProjectionModels;
  /** The map's frame, its last report, and the words around it. */
  map: ProjectionMapView;
  /** Width of the figure, in pixels. */
  width: number;
  /** Height of the figure, in pixels. */
  height: number;
  /** How a number is written in a hover card and a readout. */
  formatValue: (value: number) => string;
  /** Stem of the `id` every pill carries, which names this panel's own tab. */
  baseId: string;
  /** The `id` the pills point at, when there are pills. */
  panelId: string;
  /** Whether the bar carries a strip of views at all. */
  strip: boolean;
  /**
   * Called with the row under the pointer on the map, or `null`.
   * @default undefined
   */
  onHoverSample?: (id: string | null) => void;
  /**
   * Called as the pointer crosses the "what differs" panels.
   * @default undefined
   */
  onTrackVariable?: (track: ProjectionVariableTrack | null) => void;
  /**
   * Whether a drag on a touch screen draws a lasso rather than scrolling.
   * @default false
   */
  touchLasso?: boolean;
  /**
   * Whether the wheel zooms the map, once the pointer has rested on it.
   * @default false
   */
  wheelZoom?: boolean;
}

/**
 * The one figure showing, and the card that follows the pointer over it.
 *
 * The four tabs are drawn here rather than in the shell because only one of
 * them is ever rendered and all four sit in the same box under the same bar: a
 * reader moving between them should see the picture change and nothing else
 * move. The pointer is tracked at this level for the same reason — the card is
 * the viewer's, so it says the same thing wherever it is raised.
 *
 * The box is named whether or not there is a strip of tabs above it, because
 * that name is what the save glyph in the bar points at: a figure is saved by
 * the `id` of the box holding it, and a box named only where there happen to be
 * several tabs would be savable on some viewers and not on others.
 * @param props - See {@link ProjectionPanelProps}.
 * @returns The panel.
 */
export function ProjectionPanel(props: ProjectionPanelProps): ReactElement {
  const { state, result, samples, copy, models, map } = props;
  const { width, height, formatValue, baseId, panelId, strip } = props;
  const { onHoverSample, onTrackVariable, touchLasso, wheelZoom } = props;

  const box = useRef<HTMLDivElement>(null);
  const pointer = useRef(NOWHERE);
  const [anchor, setAnchor] = useState(NO_ANCHOR);

  function trackPointer(event: PointerEvent<HTMLDivElement>): void {
    const rect = box.current?.getBoundingClientRect();
    if (rect === undefined) return;
    pointer.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function noteHover(index: number): void {
    setAnchor({ index, ...pointer.current });
    onHoverSample?.(index < 0 ? null : (samples.ids[index] ?? null));
  }

  return (
    <div
      ref={box}
      id={panelId}
      role={strip ? 'tabpanel' : undefined}
      aria-labelledby={strip ? `${baseId}-${state.tab}` : undefined}
      onPointerMove={trackPointer}
    >
      {state.tab === 'pairs' ? (
        <ProjectionPairsTab
          result={result}
          groups={state.groups}
          options={state.options}
          copy={copy}
          width={width}
          height={height}
          selected={state.selected}
          onSelectPair={state.selectPair}
        />
      ) : null}
      {state.tab === 'variables' ? (
        <ProjectionVariablesTab
          profiles={models.profiles}
          options={state.options}
          copy={copy}
          sampleName={models.sampleName}
          width={width}
          height={height}
          onTrackVariable={onTrackVariable}
          formatValue={formatValue}
        />
      ) : null}
      {state.tab === 'shares' ? (
        <ProjectionSharesTab
          result={result}
          shares={models.shares}
          copy={copy}
          width={width}
          height={height}
        />
      ) : null}
      {state.tab === 'map' ? (
        <ProjectionMapTab
          result={result}
          groups={state.groups}
          options={state.options}
          copy={copy}
          chrome={map.chrome}
          ids={samples.ids}
          viewport={map.viewport}
          onViewportChange={map.setViewport}
          wheelZoom={wheelZoom}
          report={map.report}
          width={width}
          height={height}
          selected={state.selected}
          onSelectionChange={map.settle}
          onHoverChange={noteHover}
          touchLasso={touchLasso}
          hoverCard={
            anchor.index < 0 ? null : (
              <ProjectionReadout
                index={anchor.index}
                result={result}
                samples={samples}
                groups={state.groups}
                xAxis={state.options.xAxis}
                yAxis={state.options.yAxis}
                x={anchor.x}
                y={anchor.y}
                boxWidth={width}
                boxHeight={height}
                formatValue={formatValue}
              />
            )
          }
        />
      ) : null}
    </div>
  );
}

/** Where the pointer is before it has been anywhere. */
const NOWHERE = { x: 0, y: 0 };

/**
 * No row under the pointer, which is what draws no card at all.
 *
 * The pointer's position is kept in a ref and read into this state only when
 * the row under it changes, because a card that re-rendered the figure on
 * every pointer move would repaint two thousand dots sixty times a second to
 * shift a tooltip by three pixels. Between two rows the card therefore stands
 * where it was raised, which is where the reader is already looking.
 */
const NO_ANCHOR = { index: -1, x: 0, y: 0 };
