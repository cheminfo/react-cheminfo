import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Toolbar } from 'react-science/ui';

import { useDocumentListNavigation } from '../../hooks/ui/useDocumentListNavigation.ts';
import { countLabel } from '../../panel/core/statusBar.ts';
import { PanelEmpty } from '../../panel/ui/PanelMessage.tsx';
import {
  countVisible,
  groupSpectraBySample,
  hasSampleGroups,
} from '../core/spectrumGroups.ts';

import { SampleGroup } from './SampleGroup.tsx';
import {
  panelBodyStyle as bodyStyle,
  panelStyle,
  panelSummaryStyle as summaryStyle,
  panelToolbarStyle as toolbarStyle,
} from './panelStyles.ts';
import { useXpsActions, useXpsEditorState } from './xpsStateContext.ts';

/**
 * What is loaded: one row per spectrum, grouped by the sample it was measured
 * on.
 *
 * The list is the viewer's selection as well as its legend. Whichever row is
 * selected is the spectrum the acquisition table describes, the peak list holds,
 * the elements are looked up from and the fit belongs to — so a row is not a
 * checkbox with a colour beside it, it is the control that decides what five
 * other panels are about.
 *
 * It is grouped because of what a VAMAS file is. One file is one experiment: six
 * samples measured over eight transitions each, forty-eight blocks, each of them
 * its own spectrum. A flat list of forty-eight rows answers neither of the two
 * questions actually asked of it — which sample, and which transition of it — so
 * the samples are headings and the transitions are the rows underneath.
 *
 * The arrow keys walk the whole list, headings and all, because stepping down
 * the transitions of a sample watching the chart is how the interesting block is
 * found in the first place.
 * @returns The panel.
 */
export function SpectraPanel(): ReactNode {
  const { state } = useXpsEditorState();
  const actions = useXpsActions();
  const { spectra } = state.data;
  const { selectedId } = state.view;

  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const groups = useMemo(() => groupSpectraBySample(spectra), [spectra]);
  const showHeadings = hasSampleGroups(groups);
  const drawn = countVisible(spectra);

  // Heard on the whole page, so the arrows walk the spectra without the list
  // having to be clicked first; the row reached is the one carrying
  // `data-selected`.
  const listRef = useDocumentListNavigation<HTMLDivElement>({
    length: spectra.length,
    selectedIndex: spectra.findIndex((spectrum) => spectrum.id === selectedId),
    onSelect: (index) => {
      const spectrum = spectra[index];
      if (spectrum !== undefined) actions.selectSpectrum(spectrum.id);
    },
  });

  function toggleGroup(id: string): void {
    const next = new Set(collapsed);
    if (!next.delete(id)) next.add(id);
    setCollapsed(next);
  }

  return (
    <div style={panelStyle}>
      <div style={toolbarStyle}>
        <Toolbar aria-label="Spectra">
          <Toolbar.Item
            icon="eye-on"
            tooltip="Draw only the selected spectrum"
            aria-label="Draw only the selected spectrum"
            disabled={selectedId === null}
            onClick={() => {
              if (selectedId !== null) actions.showOnly(selectedId);
            }}
          />
          <Toolbar.Item
            icon="eye-open"
            tooltip="Draw every spectrum that is open"
            aria-label="Draw every spectrum that is open"
            disabled={spectra.length === 0 || drawn === spectra.length}
            onClick={actions.showEvery}
          />
          <Toolbar.Item
            icon="trash"
            intent="danger"
            tooltip="Close every spectrum"
            aria-label="Close every spectrum"
            disabled={spectra.length === 0}
            onClick={actions.clear}
          />
        </Toolbar>
      </div>

      <div ref={listRef} style={bodyStyle}>
        {spectra.length === 0 ? (
          <PanelEmpty>
            Nothing is loaded. Drop a VAMAS or JCAMP file on the chart, or paste
            two columns of binding energy and counts.
          </PanelEmpty>
        ) : (
          <>
            <div style={summaryStyle}>
              {countLabel(spectra.length, 'spectrum', 'spectra')}, {drawn} drawn
              {showHeadings
                ? `, over ${countLabel(groups.length, 'sample', 'samples')}`
                : ''}
            </div>

            {groups.map((group) => (
              <SampleGroup
                key={group.id}
                group={group}
                selectedId={selectedId}
                showHeading={showHeadings}
                isCollapsed={collapsed.has(group.id)}
                onToggle={toggleGroup}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
