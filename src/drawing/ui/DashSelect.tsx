import { Button, Menu, MenuItem, PopoverNext } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { LineDash } from '../core/dashes.ts';
import { LINE_DASHES } from '../core/dashes.ts';
import { MIXED, MIXED_VALUE } from '../core/mixed.ts';
import { dashCap, strokeDash, withDash } from '../render/dashes.ts';

/** The width of the line each sample is drawn in, in pixels. */
const SAMPLE_WIDTH = 2;

/** What {@link DashSelect} needs. */
export interface DashSelectProps {
  /** Whether and how the lines are dashed, undefined when they differ. */
  value: LineDash | undefined;
  /** What the menu sets, for a screen reader. */
  label: string;
  /** Called with the pattern picked. */
  onChange: (dashed: LineDash) => void;
}

/**
 * How a line is dashed, picked from a menu that draws every pattern: the
 * button shows the one in use, or "Mixed" while the objects differ on it.
 * @param props - See {@link DashSelectProps}.
 * @returns The button and its menu.
 */
export function DashSelect(props: DashSelectProps): ReactElement {
  const { value, label, onChange } = props;
  const current = LINE_DASHES.find((dash) => dash.value === value);
  return (
    <PopoverNext
      placement="bottom-start"
      content={
        <Menu role="listbox" aria-label={label}>
          {LINE_DASHES.map((dash) => (
            <MenuItem
              key={String(dash.value)}
              roleStructure="listoption"
              selected={dash.value === value}
              text={
                <span className="dash-option">
                  <DashSample dashed={dash.value} />
                  {dash.name}
                </span>
              }
              onClick={() => {
                onChange(dash.value);
              }}
            />
          ))}
        </Menu>
      }
    >
      <Button
        size="small"
        fill
        alignText="start"
        endIcon="caret-down"
        aria-label={`${label}: ${current?.name ?? MIXED}`}
        title={current?.name ?? MIXED}
      >
        {current ? (
          <DashSample dashed={current.value} />
        ) : (
          <span className={MIXED_VALUE}>{MIXED}</span>
        )}
      </Button>
    </PopoverNext>
  );
}

// A short line drawn in a pattern, in the colour of the text.
function DashSample(props: { dashed: LineDash }): ReactElement {
  const line = withDash<{ dash?: readonly number[]; cap?: 'round' }>(
    {},
    strokeDash(props.dashed, SAMPLE_WIDTH),
  );
  return (
    <svg
      className="dash-sample"
      width="56"
      height="8"
      viewBox="0 0 56 8"
      aria-hidden="true"
    >
      <line
        x1="1"
        y1="4"
        x2="55"
        y2="4"
        stroke="currentColor"
        strokeWidth={SAMPLE_WIDTH}
        strokeDasharray={line.dash?.join(' ')}
        strokeLinecap={dashCap(line) ?? 'butt'}
      />
    </svg>
  );
}
