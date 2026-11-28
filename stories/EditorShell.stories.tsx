import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';
import { Toolbar } from 'react-science/ui';

import { A4 } from '../src/drawing/core/pages.ts';
import type { DrawPage } from '../src/drawing/core/types.ts';
import { PageSetupPanel } from '../src/drawing/ui/PageSetupPanel.tsx';
import { PaletteEntry } from '../src/drawing/ui/PaletteEntry.tsx';
import { usePaletteWords } from '../src/drawing/ui/usePaletteWords.ts';
import { EditorFileBar } from '../src/editor/ui/EditorFileBar.tsx';
import { EditorFolderPanel } from '../src/editor/ui/EditorFolderPanel.tsx';
import { EditorStatusBar } from '../src/editor/ui/EditorStatusBar.tsx';
import type { StatusNotice } from '../src/panel/core/statusNotice.ts';
import type { EditorPanel } from '../src/panel/ui/EditorPanels.tsx';
import {
  EditorPanelRail,
  EditorPanelStack,
} from '../src/panel/ui/EditorPanels.tsx';
import { PanelFrame } from '../src/panel/ui/PanelFrame.tsx';
import { PanelSection } from '../src/panel/ui/PanelSection.tsx';

import {
  BACKUP,
  DRAFTS,
  DRAFT_SESSION,
  EXAMPLES,
  SAVED_FIGURES,
  SAVER,
  writeFigure,
} from './editorFixtures.ts';

const FRAME: CSSProperties = {
  display: 'flex',
  width: 960,
  maxWidth: '100%',
  height: 520,
  border: '1px solid var(--border)',
};

const FIGURE: CSSProperties = {
  display: 'grid',
  flex: '1 1 1px',
  minHeight: 0,
  placeItems: 'center',
  color: 'var(--text-muted)',
};

type PanelId = 'page' | 'figures' | 'properties';

const PANELS: Array<EditorPanel<PanelId>> = [
  { id: 'page', title: 'Page setup', icon: 'document' },
  { id: 'figures', title: 'Figures', icon: 'folder-close' },
  { id: 'properties', title: 'Properties', icon: 'properties' },
];

const KINDS = ['spring', 'mass'] as const;

type Kind = (typeof KINDS)[number];

function KindIcon(props: { kind: Kind }): ReactElement {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden>
      {props.kind === 'spring' ? (
        <path d="M2 8h2l2-4 4 8 2-4h2" fill="none" stroke="currentColor" />
      ) : (
        <rect x="4" y="4" width="8" height="8" fill="currentColor" />
      )}
    </svg>
  );
}

function PagePanel(): ReactElement {
  const [page, setPage] = useState<DrawPage>(A4);
  const [lines, setLines] = useState(true);
  return (
    <PageSetupPanel
      page={page}
      onChange={setPage}
      linesShown={lines}
      onToggleLines={() => {
        setLines(!lines);
      }}
      onFrame={() => undefined}
      sheets={1}
    />
  );
}

function FiguresPanel(): ReactElement {
  return (
    <EditorFolderPanel
      name="Figures"
      testId="figures-panel"
      site="mechanics"
      saver={SAVER}
      notify={() => undefined}
      live="bench"
      empty={false}
      file={null}
      drafts={{
        store: DRAFTS,
        session: DRAFT_SESSION,
        available: true,
        version: 0,
        currentId: null,
      }}
      saved={{ store: SAVED_FIGURES, onOpen: () => undefined }}
      backup={BACKUP}
      examples={{ examples: EXAMPLES, onOpen: () => undefined }}
      onOpen={() => undefined}
      keepInFile={() => undefined}
    />
  );
}

function PropertiesPanel(): ReactElement {
  return (
    <PanelFrame testId="properties-panel">
      <PanelSection title="Spring" hint="Drag its free end to stretch it.">
        <ul className="panel-section__list">
          <li>Stiffness: 20 N/m</li>
          <li>Rest length: 10 cm</li>
        </ul>
      </PanelSection>
    </PanelFrame>
  );
}

const BODIES = {
  page: PagePanel,
  figures: FiguresPanel,
  properties: PropertiesPanel,
};

/**
 * A bench of the family, every part of its shell from the library.
 * @param props - Whether the bench is a lesson's, which is no document.
 * @param props.lesson - Whether Open, Save as and Clear are left out.
 * @returns The workbench.
 */
function Workbench(props: { lesson: boolean }): ReactElement {
  const { lesson } = props;
  const words = usePaletteWords();
  const [taken, setTaken] = useState<Kind | null>(null);
  const [count, setCount] = useState(0);
  const [shown, setShown] = useState<readonly PanelId[]>(['properties']);
  const [notice, setNotice] = useState<StatusNotice | null>(null);
  const toggle = (panel: PanelId) => {
    setShown(
      shown.includes(panel)
        ? shown.filter((open) => open !== panel)
        : [...shown, panel],
    );
  };
  return (
    <div style={FRAME}>
      <div className="editor-workbench">
        <EditorFileBar
          site="mechanics"
          saver={SAVER}
          notify={(text, intent) => {
            setNotice({ text, danger: intent === 'danger' });
          }}
          file={null}
          empty={count === 0}
          onOpen={() => undefined}
          download={{ testId: 'figure-download', writeFigure }}
          documents={!lesson}
          history={{
            canUndo: count > 0,
            canRedo: false,
            undo: () => {
              setCount(Math.max(0, count - 1));
            },
            redo: () => undefined,
          }}
          remove={{ disabled: true, onClick: () => undefined }}
          clear={
            lesson
              ? null
              : {
                  label: 'Clear the bench',
                  title: 'Clear the bench',
                  question: 'Clear the bench? Undo brings it back.',
                  confirmLabel: 'Clear the bench',
                  onConfirm: () => {
                    setCount(0);
                  },
                }
          }
        />
        <div className="editor-workbench__body">
          <div className="editor-workbench__tools">
            <div className="editor-palette">
              <Toolbar vertical aria-label="Pieces">
                {KINDS.map((kind) => (
                  <PaletteEntry
                    key={kind}
                    icon={<KindIcon kind={kind} />}
                    tooltip={words.tooltip(kind, 'bench')}
                    label={`Add a ${kind}`}
                    active={taken === kind}
                    onTake={() => {
                      setTaken(taken === kind ? null : kind);
                    }}
                    onAdd={() => {
                      setCount(count + 1);
                      setTaken(null);
                    }}
                  />
                ))}
              </Toolbar>
            </div>
          </div>
          <div className="editor-workbench__row">
            <div className="editor-view">
              <div style={FIGURE}>
                {count === 0 ? 'An empty bench' : `${count} pieces`}
              </div>
              <EditorStatusBar
                saver={SAVER}
                file={null}
                live="bench"
                empty={count === 0}
                notify={() => undefined}
                notice={notice}
                hint={
                  taken === null
                    ? 'Drag a piece onto the bench, or click it and then the bench.'
                    : `Click on the bench to put a ${taken} there.`
                }
              />
            </div>
            <EditorPanelStack
              panels={PANELS}
              bodies={BODIES}
              shown={shown}
              folded={[]}
              onClose={toggle}
              onFolded={() => undefined}
            />
          </div>
          <div className="editor-workbench__rail">
            <EditorPanelRail panels={PANELS} shown={shown} onToggle={toggle} />
          </div>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: 'Editor/EditorShell',
  component: Workbench,
  parameters: {
    docs: {
      description: {
        component:
          'The shell every figure editor of the family shares: the file bar, the palette, the panels and their rail, and the status line. A site passes what it holds; none of the parts reads a store.',
      },
    },
  },
} satisfies Meta<typeof Workbench>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Bench: Story = { args: { lesson: false } };

export const Lesson: Story = { args: { lesson: true } };
