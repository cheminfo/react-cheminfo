import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { HelpContent } from '../../../help/ui/HelpBody.tsx';
import { overlayMetrics } from '../../core/overlayMetrics.ts';
import { OverlayGroup } from '../OverlayGroup.tsx';
import { OverlayLayer } from '../OverlayLayer.tsx';
import { OverlayNumber } from '../OverlayNumber.tsx';
import { OverlayPanel } from '../OverlayPanel.tsx';
import { OverlayRow } from '../OverlayRow.tsx';
import { OverlayToggle } from '../OverlayToggle.tsx';
import {
  overlaySwitchStyle,
  overlaySwitchTrack,
} from '../overlaySwitchStyles.ts';

const HELP: HelpContent = {
  title: 'One scale',
  body: 'Whether every panel is drawn against the same scale.',
};

// What a name wears once it is the thing carrying the explanation.
const DOTTED =
  'text-decoration:underline dotted var(--border-strong);text-underline-offset:3px;cursor:help';

// The compact grid, which is the one the mockup was measured at.
const GRID =
  'display:grid;grid-template-columns:88px minmax(0, 1fr);align-items:center;column-gap:10px;min-height:24px;width:100%';

test('every row of a panel starts at the same x', () => {
  const html = panel(
    <>
      <OverlayRow label="Show">
        <span>a</span>
      </OverlayRow>
      <OverlayRow label="Panels">
        <span>b</span>
      </OverlayRow>
    </>,
  );

  expect(html.split(GRID)).toHaveLength(3);
});

test('a panel row carries no question mark and names its control out loud', () => {
  const html = panel(
    <OverlayRow label="One scale" help={HELP}>
      <span>a</span>
    </OverlayRow>,
  );

  expect(html.match(/help-icon/g)).toBeNull();
  expect(html).toContain(DOTTED);
  expect(html).toContain('>One scale</span>');
  expect(html.match(/role="group" aria-labelledby=/g)).toHaveLength(2);
});

test('a panel row writes its name even when the caller asked to hide it', () => {
  const html = panel(
    <OverlayRow label="Averages" hideLabel>
      <span>a</span>
    </OverlayRow>,
  );

  expect(html).toContain('>Averages</span>');
});

test('a switch says whether it is on without being pressed', () => {
  const on = panel(
    <OverlayToggle label="One scale" checked onChange={() => null} />,
  );
  const off = panel(
    <OverlayToggle label="One scale" checked={false} onChange={() => null} />,
  );

  expect(on).toContain('aria-pressed="true"');
  expect(off).toContain('aria-pressed="false"');
  expect(on).toContain(
    'width:30px;height:18px;border-radius:999px;background:var(--accent);transition:background 150ms ease',
  );
  expect(off).toContain(
    'width:30px;height:18px;border-radius:999px;background:var(--border-strong);transition:background 150ms ease',
  );
  expect(on).toContain('top:2px;left:14px;width:14px;height:14px');
  expect(off).toContain('top:2px;left:2px;width:14px;height:14px');
});

test('a toggle on a bar is still the pressed button a legend entry needs', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer density="compact">
      <OverlayToggle label="Setosa" checked onChange={() => null} />
    </OverlayLayer>,
  );

  expect(html).toContain('<span class="bp6-button-text">Setosa</span>');
  expect(html).not.toContain('border-radius:999px');
});

test('a switch grows to a fingertip target while the track it draws does not', () => {
  const coarse = overlayMetrics('compact', 'coarse');
  const track = overlaySwitchTrack(coarse);

  expect(track).toStrictEqual({
    width: 50,
    height: 30,
    knob: 26,
    inset: 2,
    travel: 20,
  });
  expect(overlaySwitchStyle(coarse, track, false).height).toBe(40);
});

test('a section rests on a hairline, and the first section of a panel does not', () => {
  const html = panel(
    <>
      <OverlayGroup label="Scale" divider={false}>
        <OverlayRow label="One scale">
          <span>a</span>
        </OverlayRow>
      </OverlayGroup>
      <OverlayGroup label="Drawing">
        <OverlayRow label="Average">
          <span>b</span>
        </OverlayRow>
      </OverlayGroup>
    </>,
  );

  expect(html.match(/border-top:1px solid var\(--border\)/g)).toHaveLength(1);
  expect(html).toContain(
    'margin-top:0;padding-top:0;color:var(--text-faint);font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase',
  );
  expect(html).toContain('margin-top:3px;padding-top:9px');
});

test('a stepper holds the width of the longest value its range can reach', () => {
  const html = panel(
    <OverlayNumber
      label="Panels"
      value={9}
      min={1}
      max={12}
      onChange={() => null}
    />,
  );

  // Two characters at 11px, not a floor borrowed from the control height: a
  // stepper that reserves a control's width for one digit is what made
  // "− 2 +" measure ninety-six pixels.
  expect(html).toContain('min-width:14px');
  expect(html).toContain('font-variant-numeric:tabular-nums');
});

test('a stepper writing a unit reserves the room the unit takes', () => {
  const html = panel(
    <OverlayNumber
      label="How far"
      value={2}
      min={1}
      max={3}
      digits={1}
      unit=" SD"
      onChange={() => null}
    />,
  );

  expect(html).toContain('min-width:40px');
});

/**
 * One panel of rows rendered to markup at the size the mockup was measured at.
 * @param children - The rows.
 * @returns The markup.
 */
function panel(children: ReactNode): string {
  return renderToStaticMarkup(
    <OverlayLayer density="compact">
      <OverlayPanel title="Map">{children}</OverlayPanel>
    </OverlayLayer>,
  );
}
