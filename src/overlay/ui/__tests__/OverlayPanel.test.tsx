import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { HelpContent } from '../../../help/ui/HelpBody.tsx';
import { OverlayAction } from '../OverlayAction.tsx';
import { OverlayLayer } from '../OverlayLayer.tsx';
import { OverlayPanel } from '../OverlayPanel.tsx';
import { OverlayRow } from '../OverlayRow.tsx';

const HELP: HelpContent = {
  title: 'One scale',
  body: 'Whether every panel is drawn against the same scale.',
};

test('a panel says which of the figures it configures', () => {
  const html = panel({ title: 'What differs' });

  expect(html).toContain('>What differs</span>');
  expect(html).toContain('role="group" aria-labelledby=');
});

test('a panel offers the way back, and draws none when it has none', () => {
  const withReset = panel({ onReset: () => null });
  const without = panel({});

  expect(withReset).toContain('>Reset</button>');
  expect(withReset).toContain('color:var(--text-faint)');
  expect(withReset).toContain('font-size:11px');
  expect(without).not.toContain('Reset');
});

test('the way back can be called something else', () => {
  const html = panel({ onReset: () => null, resetLabel: 'Start again' });

  expect(html).toContain('>Start again</button>');
  expect(html).not.toContain('>Reset</button>');
});

test('a panel teaches the help convention once, at the foot of its rows', () => {
  const html = panel({});

  expect(html.match(/Hover a name for what it does\./g)).toHaveLength(1);
  expect(html).toContain('color:var(--text-faint);font-size:10px');
});

test('a panel whose names carry no help makes no promise it cannot keep', () => {
  const html = panel({ hint: '' });

  expect(html).not.toContain('Hover a name');
});

test('commands sit under the body rather than among the settings', () => {
  const html = panel({
    actions: <OverlayAction text="Clear selection" onClick={() => null} />,
  });

  const footer = html.indexOf('padding:8px 12px 9px');

  expect(footer).toBeGreaterThan(html.indexOf('Hover a name'));
  expect(html).toContain('Clear selection');
  expect(html.match(/border-top:1px solid var\(--border\)/g)).toHaveLength(1);
});

test('a panel with no commands draws no footer at all', () => {
  const html = panel({});

  expect(html).not.toContain('border-top:1px solid var(--border)');
});

test('the header carries the one question mark the domain still allows', () => {
  const html = panel({ help: HELP });

  expect(html.match(/help-icon/g)).toHaveLength(1);
});

/**
 * One panel rendered to markup at the size the mockup was measured at.
 * @param props - What to override; everything else is a plain default.
 * @param props.title - What the panel is called.
 * @param props.onReset - The way back, when there is one.
 * @param props.resetLabel - What the way back reads.
 * @param props.help - The figure's own explanation.
 * @param props.actions - The commands at the foot.
 * @param props.hint - The line teaching the convention.
 * @returns The markup.
 */
function panel(props: {
  title?: string;
  onReset?: () => void;
  resetLabel?: string;
  help?: HelpContent;
  actions?: ReactNode;
  hint?: string;
}): string {
  const { title = 'Map', ...rest } = props;
  return renderToStaticMarkup(
    <OverlayLayer density="compact">
      <OverlayPanel title={title} {...rest}>
        <OverlayRow label="Across">
          <span>PC1</span>
        </OverlayRow>
      </OverlayPanel>
    </OverlayLayer>,
  );
}
