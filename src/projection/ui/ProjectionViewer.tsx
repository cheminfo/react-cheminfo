import type { CSSProperties, ReactElement } from 'react';
import { useId, useMemo, useRef } from 'react';

import { useContainerSize } from '../../hooks/ui/useContainerSize.ts';
import { mergeProjectionCopy } from '../core/projectionCopy.ts';

import { ProjectionBar } from './ProjectionBar.tsx';
import { ProjectionPanel } from './ProjectionPanel.tsx';
import { formatProjectionValue } from './projectionFormat.ts';
import { useProjectionMapView } from './projectionMapView.ts';
import { useProjectionModels } from './projectionTabModels.ts';
import { PROJECTION_TAB_HEIGHT } from './projectionTabStyles.ts';
import type { ProjectionViewerProps } from './projectionViewerProps.ts';
import { useProjectionState } from './useProjectionState.ts';

export type { ProjectionVariableTrack } from './ProjectionVariablesTab.tsx';
export type { ProjectionSelection } from './projectionSelection.ts';
export type { ProjectionViewerProps } from './projectionViewerProps.ts';

/**
 * A dimension-reduction result, shown as a map a reader can interrogate.
 *
 * It knows nothing about principal components: a method fills in what it has
 * and leaves the rest out, and the viewer offers exactly the tabs the result
 * can support — which is why a two-dimensional UMAP renders as one clean chart
 * with no strip of views rather than four tabs, three of them empty.
 *
 * It is built to be a guest on somebody else's page, so it is one bar and one
 * figure and nothing else: the views, the settings of the view showing and the
 * question mark that explains it share a single thirty-pixel row above the
 * picture, and every pixel below that row is the picture. Nothing stands under
 * it — the key floats in the emptiest corner of the plot, and the paragraph
 * that used to sit beneath the figure is behind the question mark, kept whole
 * for the reader who wants it and costing nothing to the reader who does not.
 *
 * The four tabs are one tool rather than four because they share one piece of
 * state: a pair promoted from the grid arrives on the map, and the lasso drawn
 * there is still selected when the reader comes back to it. What the reader
 * picked leaves by name — `onSelectionChange` reports the ids from
 * `samples.ids` — so a page filtering its own table beside the figure never
 * has to keep a second copy of the row order to read them with.
 * @param props - See {@link ProjectionViewerProps}.
 * @returns The viewer.
 */
export function ProjectionViewer(props: ProjectionViewerProps): ReactElement {
  const { result, samples, className, testId, onTrackVariable } = props;
  const { onHoverSample, touchLasso, height = PROJECTION_TAB_HEIGHT } = props;
  const { wheelZoom = true } = props;
  const { formatValue = formatProjectionValue, fileName = 'projection' } =
    props;

  const copy = useMemo(() => mergeProjectionCopy(props.copy), [props.copy]);
  const state = useProjectionState(props);
  const figure = useRef<HTMLDivElement>(null);
  const measured = useContainerSize(figure);
  const width = measured.width > 0 ? measured.width : ASSUMED_WIDTH;

  const models = useProjectionModels({
    result,
    samples,
    options: state.options,
    selected: state.selected,
  });
  const map = useProjectionMapView({
    result,
    copy,
    groups: state.groups,
    options: state.options,
    selected: state.selected,
    onSettle: state.settleSelection,
  });

  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const strip = state.tabs.length > 1;

  return (
    <div
      ref={figure}
      className={
        className === undefined
          ? 'projection-viewer'
          : `projection-viewer ${className}`
      }
      data-testid={testId}
      style={VIEWER_STYLE}
    >
      <ProjectionBar
        state={state}
        result={result}
        copy={copy}
        models={models}
        map={map}
        baseId={baseId}
        panelId={panelId}
        fileName={fileName}
        width={width}
      />
      <ProjectionPanel
        state={state}
        result={result}
        samples={samples}
        copy={copy}
        models={models}
        map={map}
        width={width}
        height={height}
        formatValue={formatValue}
        baseId={baseId}
        panelId={panelId}
        strip={strip}
        onHoverSample={onHoverSample}
        onTrackVariable={onTrackVariable}
        touchLasso={touchLasso}
        wheelZoom={wheelZoom}
      />
    </div>
  );
}

/**
 * The width a figure is drawn at before its container has been measured.
 *
 * A guess corrected on the first measurement beats an empty box: the viewer
 * then renders on a server, renders in a test with no DOM at all, and never
 * leaves a hole in the page for the frame or two a resize observer takes to
 * report. The number is a common single-column figure, so the correction is
 * usually small enough that nothing visibly jumps.
 */
const ASSUMED_WIDTH = 640;

/**
 * The bar and the figure, with nothing between them.
 *
 * The gap is zero on purpose: the bar carries a hairline along its foot, and
 * that line is what separates the chrome from the picture. A gap as well would
 * read as a seam between two components rather than as one figure.
 */
const VIEWER_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
} as const satisfies CSSProperties;
