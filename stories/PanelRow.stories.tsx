import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { useState } from 'react';

import type { RailPanel } from '../src/panel/ui/PanelRail.tsx';
import { PanelRail } from '../src/panel/ui/PanelRail.tsx';
import { PanelRow } from '../src/panel/ui/PanelRow.tsx';
import { SidePanelStack } from '../src/panel/ui/SidePanelStack.tsx';

const FRAME: CSSProperties = {
  display: 'flex',
  height: 420,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
};

const COLUMN: CSSProperties = { display: 'flex', minWidth: 0, flex: '1 1 0%' };

const STACK: CSSProperties = {
  display: 'flex',
  height: '100%',
  minHeight: 0,
  flexDirection: 'column',
  borderLeft: '1px solid var(--border)',
  background: 'var(--surface)',
};

const FIGURE: CSSProperties = {
  display: 'grid',
  height: '100%',
  placeItems: 'center',
  color: 'var(--text-muted)',
};

const PANELS: Array<RailPanel<'style' | 'object'>> = [
  { id: 'style', icon: 'style', title: 'Style' },
  { id: 'object', icon: 'edit', title: 'Object' },
];

/**
 * A figure and its panels, with the one panel on show kept the way an editor
 * keeps it.
 * @param props - Whether the panels are collapsed.
 * @param props.collapsed - Whether the figure keeps the row.
 * @returns The editor.
 */
function Editor(props: { collapsed: boolean }) {
  const { collapsed } = props;
  const [open, setOpen] = useState<readonly string[]>(['style']);
  const [onShow, setOnShow] = useState<string | null>(null);
  const shown = collapsed ? (onShow === null ? [] : [onShow]) : open;

  function toggle(id: string): void {
    if (collapsed) {
      setOnShow((current) => (current === id ? null : id));
    } else {
      setOpen((current) =>
        current.includes(id)
          ? current.filter((other) => other !== id)
          : [...current, id],
      );
    }
  }

  return (
    <div style={FRAME}>
      <div style={COLUMN}>
        <PanelRow
          collapsed={collapsed}
          ratio={null}
          defaultRatio={70}
          onRatio={() => undefined}
          view={<div style={FIGURE}>The figure</div>}
          panels={
            shown.length === 0 ? null : (
              <div style={STACK}>
                <SidePanelStack
                  panels={PANELS}
                  openPanelIds={shown}
                  onClose={toggle}
                >
                  {(panel) => <p style={{ padding: 8 }}>{panel.title}</p>}
                </SidePanelStack>
              </div>
            )
          }
        />
      </div>
      <PanelRail panels={PANELS} openIds={shown} onToggle={toggle} />
    </div>
  );
}

const meta = {
  title: 'Panels/PanelRow',
  component: Editor,
  parameters: {
    docs: {
      description: {
        component:
          'The figure and its panels. With room they share the row; without room the figure keeps it, and the rail brings one panel over it.',
      },
    },
  },
} satisfies Meta<typeof Editor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithRoom: Story = { args: { collapsed: false } };

export const Collapsed: Story = { args: { collapsed: true } };
