import type { ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';

import { FigureDownload } from '../../download/ui/FigureDownload.tsx';
import type { OverlayMetrics } from '../../overlay/core/overlayMetrics.ts';
import { overlayMetrics } from '../../overlay/core/overlayMetrics.ts';
import { OverlayBar } from '../../overlay/ui/OverlayBar.tsx';
import { OverlayInfo } from '../../overlay/ui/OverlayInfo.tsx';
import { useCoarsePointer } from '../../overlay/ui/overlaySurface.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';
import type { ProjectionTab } from '../core/projectionTabs.ts';

import { ProjectionSurface } from './ProjectionSurface.tsx';
import { ProjectionTabStrip } from './ProjectionTabStrip.tsx';
import {
  projectionBarEndRoom,
  projectionBarGlyphs,
  projectionBarTier,
} from './projectionBarModel.ts';
import { projectionBarReadings } from './projectionBarReadings.ts';
import { projectionBarSlots } from './projectionBarSlots.tsx';
import {
  PROJECTION_CAPTION_TEXT_STYLE,
  projectionBarEndStyle,
  projectionBarRowStyle,
  projectionFoldedCaptionStyle,
} from './projectionBarStyles.ts';
import type { ProjectionMapView } from './projectionMapView.ts';
import type { ProjectionModels } from './projectionTabModels.ts';
import type { ProjectionStateApi } from './useProjectionState.ts';

/** What {@link ProjectionBar} needs. */
export interface ProjectionBarProps {
  /** The tab, the options and the selection every tab shares. */
  state: ProjectionStateApi;
  /** What the run produced, whatever produced it. */
  result: ProjectionResult;
  /** The words the viewer writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** The two figures the bar explains and a tab draws. */
  models: ProjectionModels;
  /** The map's frame and the three buttons that change it. */
  map: ProjectionMapView;
  /** Stem of the `id` every pill carries, for the panel to name its tab with. */
  baseId: string;
  /** The `id` of the panel the pills drive, which is also what is saved. */
  panelId: string;
  /** What a figure saved from the bar is called, without its extension. */
  fileName: string;
  /** Width of the viewer, in pixels, which decides how much it writes. */
  width: number;
}

/**
 * One bar across the top of the figure: the views at the start, the settings
 * of the view showing at the end, and the question mark between them.
 *
 * It belongs to the viewer rather than to any tab because it is the
 * component's own chrome — a reader moves between four figures with it, and
 * four bars, three of them hidden, would be four places for that row to sit a
 * pixel differently.
 *
 * It stays one row at every width, because a bar that wrapped would change the
 * figure's height as the host page resized. What a narrowing figure costs the
 * reader is words rather than controls: the key word in front of each setting
 * goes first, then the long form of the view names, then the boxes around the
 * settings, which gather into one chip still reading `Species · 95%`. Only on
 * the narrowest figures does anything leave the row at all, and it is the
 * question mark — whose paragraph is then written at the head of the panel the
 * cog opens, so nothing is lost, only moved.
 *
 * The one thing on the bar that acts on the figure rather than describing it
 * is the save glyph, which is why it rides beside the question mark rather than
 * among the settings: it is offered on every view, because every view draws a
 * figure somebody may want to keep, and it saves whatever the box below the bar
 * is currently holding — one map, or the sixteen charts of a pair grid.
 * @param props - See {@link ProjectionBarProps}.
 * @returns The bar.
 */
export function ProjectionBar(props: ProjectionBarProps): ReactElement {
  const { state, result, copy, models, map, baseId, panelId } = props;
  const { fileName, width } = props;
  const { tab, tabs, options, groups, selected, setOptions, setTab } = state;

  // Read here rather than off the surface below, because the row the bar is
  // laid into is the surface's own parent: it has to know how tall a control
  // will be before there is a surface to ask.
  const pointer = useCoarsePointer() ? 'coarse' : 'fine';
  const metrics = overlayMetrics('compact', pointer);
  const strip = tabs.length > 1;
  const labels = useMemo(
    () => (strip ? tabNames(tabs, copy.tab) : NO_LABELS),
    [strip, tabs, copy],
  );
  const shortLabels = useMemo(
    () => (strip ? tabNames(tabs, copy.shortTab) : NO_LABELS),
    [strip, tabs, copy],
  );

  const readings = projectionBarReadings({ tab, copy, options, groups });
  const room = {
    tabLabels: labels,
    shortTabLabels: shortLabels,
    readings,
    glyphs: projectionBarGlyphs(tab),
  };
  const tier = projectionBarTier(width, room, metrics);
  const strippable = Math.max(
    metrics.buttonSize,
    width - projectionBarEndRoom(room, metrics, tier),
  );

  const slots = projectionBarSlots({
    tab,
    result,
    copy,
    models,
    map,
    options,
    groups,
    selected,
    width,
    readings,
    tier,
    onChange: setOptions,
  });
  const folded = tier === 'tiny' && slots.info !== '';

  return (
    <ProjectionSurface width={width}>
      <div style={projectionBarRowStyle(metrics)}>
        <OverlayBar
          placement="stretch"
          label={copy.action.options}
          collapsed={false}
          morePadded={false}
          end={<div style={projectionBarEndStyle(metrics)}>{slots.end}</div>}
          more={
            folded ? withCaption(slots.info, slots.more, metrics) : slots.more
          }
          tools={
            <FigureDownload
              targetId={panelId}
              fileName={`${fileName}-${tab}`}
              label={copy.action.download}
            />
          }
          info={
            folded || slots.info === '' ? undefined : (
              <OverlayInfo>{slots.info}</OverlayInfo>
            )
          }
        >
          {strip ? (
            <ProjectionTabStrip
              tabs={tabs}
              tab={tab}
              onTabChange={setTab}
              labels={copy.tab}
              shortLabels={copy.shortTab}
              tier={tier}
              maxWidth={strippable}
              baseId={baseId}
              panelId={panelId}
            />
          ) : null}
        </OverlayBar>
      </div>
    </ProjectionSurface>
  );
}

/**
 * What each tab showing is called, in one of the two lengths.
 * @param tabs - The tabs the result can fill, in reading order.
 * @param names - What each tab is called at that length.
 * @returns The names, in the same order.
 */
function tabNames(
  tabs: readonly ProjectionTab[],
  names: Readonly<Record<ProjectionTab, string>>,
): readonly string[] {
  const labels: string[] = [];
  for (const tab of tabs) labels.push(names[tab]);
  return labels;
}

/**
 * The figure's explanation at the head of the panel the cog opens.
 *
 * On the narrowest figures the question mark is the one glyph that leaves the
 * row, because the settings and the second tier both have to stay reachable —
 * so its paragraph is written here instead. A reader short of room is exactly
 * the reader who has not been told what they are looking at, which is why it
 * is moved rather than dropped.
 *
 * It is a band above the panel rather than a row inside it: the panel's rows
 * are settings the reader changes, and a paragraph filed among them is one
 * more thing to scan past on the way to the switch they came for.
 * @param caption - The paragraph the question mark used to open.
 * @param more - The panel the cog already held.
 * @param metrics - The measurements the chrome is drawn from.
 * @returns The panel's contents.
 */
function withCaption(
  caption: string,
  more: ReactNode,
  metrics: OverlayMetrics,
): ReactNode {
  return (
    <>
      <div style={projectionFoldedCaptionStyle(metrics)}>
        <p style={PROJECTION_CAPTION_TEXT_STYLE}>{caption}</p>
      </div>
      {more}
    </>
  );
}

/** No pills at all, which is what one tab gets. */
const NO_LABELS: readonly string[] = [];
