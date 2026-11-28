import type { ReactElement } from 'react';

import { PanelFrame } from '../../panel/ui/PanelFrame.tsx';
import type { DrawPage } from '../core/types.ts';
import { pagesLine } from '../render/pageGrid.ts';

import type { PageChange } from './PageField.tsx';
import { PageField } from './PageField.tsx';
import { PageToolbar } from './PageToolbar.tsx';

/** What {@link PageSetupPanel} is given. */
export interface PageSetupPanelProps {
  /** The paper or the slide the figure is laid out on. */
  page: DrawPage;
  /** Called with the page asked for, as `PageField` reports it. */
  onChange: (page: DrawPage, how: PageChange) => void;
  /** Whether the page lines are drawn across the canvas. */
  linesShown: boolean;
  /** Show the page lines, or hide them. */
  onToggleLines: () => void;
  /** Bring every page that holds something into view. */
  onFrame: () => void;
  /** How many sheets hold something, said under the fields while shown. */
  sheets: number;
  /**
   * What a test finds the panel by.
   * @default 'page-panel'
   */
  testId?: string;
}

/**
 * The page setup panel, first on the rail of every editor of the family: the
 * page lines shown or hidden and the whole of the pages brought into view,
 * then the paper or the slide the figure is laid out on, its orientation and
 * its sides, and how many sheets printing gives.
 * @param props - See {@link PageSetupPanelProps}.
 * @returns The panel.
 */
export function PageSetupPanel(props: PageSetupPanelProps): ReactElement {
  const { page, onChange, linesShown, onToggleLines, onFrame, sheets } = props;
  const { testId = 'page-panel' } = props;
  return (
    <PanelFrame
      testId={testId}
      toolbar={
        <PageToolbar
          shown={linesShown}
          onToggle={onToggleLines}
          onFrame={onFrame}
        />
      }
    >
      <div className="editor-page-panel">
        <PageField
          page={page}
          helperText={pagesLine(linesShown ? sheets : null)}
          onChange={onChange}
        />
      </div>
    </PanelFrame>
  );
}
