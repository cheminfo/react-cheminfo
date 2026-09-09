import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { HelpContent } from '../../../help/ui/HelpBody.tsx';
import { OverlayAction } from '../OverlayAction.tsx';
import { OverlayDivider } from '../OverlayDivider.tsx';
import { OverlayGroup } from '../OverlayGroup.tsx';
import { OverlayNumber } from '../OverlayNumber.tsx';
import type { OverlayOption } from '../OverlayRow.tsx';
import { OverlayRow } from '../OverlayRow.tsx';
import { OverlaySelect } from '../OverlaySelect.tsx';
import { OverlayToggle } from '../OverlayToggle.tsx';

const COLOUR_BY: readonly OverlayOption[] = [
  { value: 'cluster', label: 'Cluster' },
  { value: 'species', label: 'Species' },
  {
    value: 'weights',
    label: 'Weights in your units',
    disabled: true,
    title: 'Only when the model divided each measurement by its spread.',
  },
];

const HELP: HelpContent = {
  title: 'Colour by',
  body: 'What the dots are coloured by.',
};

test('a toggle reports being pressed, and shows the colour it stands for', () => {
  const html = renderToStaticMarkup(
    <OverlayToggle
      label="Setosa"
      checked
      swatch="#e69f00"
      onChange={() => null}
    />,
  );

  expect(html).toContain('aria-pressed="true"');
  expect(html).toContain('aria-label="Setosa"');
  expect(html).toContain('<span class="bp6-button-text">Setosa</span>');
  expect(html.match(/background:#e69f00/g)).toHaveLength(1);
  expect(html).toContain('width:10px;height:10px');
});

test('a toggle short of room keeps the name a screen reader reads', () => {
  const html = renderToStaticMarkup(
    <OverlayToggle
      label="Setosa"
      hideLabel
      icon="eye-open"
      checked={false}
      onChange={() => null}
    />,
  );

  expect(html).toContain('aria-pressed="false"');
  expect(html).toContain('aria-label="Setosa"');
  expect(html).toContain('title="Setosa"');
  expect(html).not.toContain('>Setosa<');
});

test('a picker offers every choice, marks the one in force, and greys the one that is out', () => {
  const html = renderToStaticMarkup(picker('species'));

  expect(html.match(/<option /g)).toHaveLength(3);
  expect(html).toContain(
    '<option value="species" selected="">Species</option>',
  );
  expect(html).toContain(
    '<option value="weights" title="Only when the model divided each measurement by its spread." disabled="">Weights in your units</option>',
  );
});

test('a hidden caption moves into the name and out of the markup', () => {
  const html = renderToStaticMarkup(picker('cluster', { hideLabel: true }));

  expect(html).toContain('<select aria-label="Colour by">');
  expect(html).not.toContain('>Colour by<');
});

test('a stepper goes dead at whichever end of its range it has reached', () => {
  const atBottom = renderToStaticMarkup(stepper(3));
  const atTop = renderToStaticMarkup(stepper(12));

  // A real `disabled` rather than Blueprint's `aria-disabled`: the stepper's
  // buttons are plain elements now, so the browser stops the click itself.
  // Asserted per button rather than on attribute order, which React owns.
  expect(deadEnds(atBottom)).toStrictEqual(['Decrease Dot size']);
  expect(deadEnds(atTop)).toStrictEqual(['Increase Dot size']);
});

test('a stepper writes its value with the digits and the unit it was given', () => {
  const html = renderToStaticMarkup(
    <OverlayNumber
      label="Ellipse spread"
      value={2}
      min={1}
      max={3}
      step={0.5}
      digits={1}
      unit=" SD"
      onChange={() => null}
    />,
  );

  expect(html).toContain('>2.0 SD</span>');
  expect(html).toContain('font-variant-numeric:tabular-nums');
});

test('an action stays on the card when it cannot be taken', () => {
  const html = renderToStaticMarkup(
    <OverlayAction
      text="Zoom to selection"
      icon="zoom-in"
      intent="primary"
      disabled
      onClick={() => null}
    />,
  );

  expect(html).toContain('Zoom to selection');
  expect(html).toContain('aria-disabled="true"');
  expect(html).toContain('bp6-intent-primary');
});

test('a titled cluster names itself, an untitled one is only its controls', () => {
  const titled = renderToStaticMarkup(
    <OverlayGroup label="Ellipses" help={HELP}>
      <OverlayDivider />
    </OverlayGroup>,
  );
  const bare = renderToStaticMarkup(
    <OverlayGroup>
      <OverlayDivider />
    </OverlayGroup>,
  );

  expect(titled).toContain('role="group" aria-labelledby=');
  expect(titled).toContain('text-transform:uppercase');
  expect(titled).toContain('>Ellipses</span>');
  expect(titled.match(/help-icon/g)).toBeNull();
  expect(titled).toContain('underline dotted var(--border-strong)');
  expect(bare).not.toContain('role="group"');
  expect(bare.match(/role="separator"/g)).toHaveLength(1);
});

test('a divider is a separator rather than a decorated line', () => {
  const html = renderToStaticMarkup(<OverlayDivider />);

  expect(html).toBe(
    '<span role="separator" aria-orientation="vertical" style="width:1px;align-self:stretch;min-height:22px;background:var(--border);margin:0 4px"></span>',
  );
});

test('a control with no layer above it is still drawn from real measurements', () => {
  const html = renderToStaticMarkup(
    <OverlayRow label="Dot size">
      <span>x</span>
    </OverlayRow>,
  );

  expect(html).toBe(
    '<div style="display:inline-flex;align-items:center;gap:6px;min-height:30px">' +
      '<span style="color:var(--text-muted);font-size:11px;font-weight:500;white-space:nowrap;user-select:none">Dot size</span>' +
      '<span>x</span></div>',
  );
});

test('a caption written above its control fades with it when it is unreachable', () => {
  const html = renderToStaticMarkup(
    <OverlayRow label="Ellipse spread" labelPlacement="above" disabled>
      <span>x</span>
    </OverlayRow>,
  );

  expect(html).toContain('flex-direction:column');
  expect(html).toContain('user-select:none;opacity:0.6">Ellipse spread</span>');
});

function picker(
  value: string,
  extra?: { hideLabel?: boolean; help?: HelpContent },
): ReactElement {
  return (
    <OverlaySelect
      label="Colour by"
      hideLabel={extra?.hideLabel}
      help={extra?.help}
      value={value}
      options={COLOUR_BY}
      onChange={() => null}
    />
  );
}

function stepper(value: number, help?: HelpContent): ReactElement {
  return (
    <OverlayNumber
      label="Dot size"
      help={help}
      value={value}
      min={3}
      max={12}
      onChange={() => null}
    />
  );
}

/**
 * Which of a stepper's buttons the browser will refuse to click.
 * @param html - The rendered markup.
 * @returns The accessible name of each disabled button, in document order.
 */
function deadEnds(html: string): string[] {
  const dead: string[] = [];
  for (const button of html.split('<button').slice(1)) {
    const tag = button.slice(0, button.indexOf('>'));
    if (!tag.includes('disabled')) continue;
    const name = /aria-label="([^"]*)"/.exec(tag);
    if (name?.[1] !== undefined) dead.push(name[1]);
  }
  return dead;
}

test('a spent end of a stepper fades, so the reader sees the limit before pressing it', () => {
  const atTop = renderToStaticMarkup(stepper(12));

  // The `disabled` attribute stops the click but says nothing before it: a
  // reader who presses `+` on a four-component model and sees nothing happen
  // can only read the control as broken.
  const buttons = atTop.split('<button').slice(1);
  const increase = buttons.find((one) => one.includes('Increase Dot size'));
  const decrease = buttons.find((one) => one.includes('Decrease Dot size'));

  expect(increase).toContain('opacity:0.45');
  expect(increase).toContain('cursor:default');
  expect(decrease).toContain('opacity:1');
  expect(decrease).toContain('cursor:pointer');
});
