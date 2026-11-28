import { Button, FormGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { PALETTE } from '../core/palette.ts';

import { CustomColorButton } from './SwatchRow.tsx';

/** The backgrounds offered with one click: none, white, and a pale grey. */
const PRESETS = [
  { name: 'None', value: undefined },
  // tokens-ok: the paper of a figure, not a colour of the site.
  { name: 'White', value: '#ffffff' },
  // tokens-ok: the paper of a figure, not a colour of the site.
  { name: 'Grey', value: '#f2f2f2' },
] as const;

/** What {@link BackgroundRow} is given. */
export interface BackgroundRowProps {
  /** The drawing's background, `#rrggbb` or `#rrggbbaa`, when it has one. */
  value: string | undefined;
  /** Called with the background asked for; undefined for none. */
  onChange: (background: string | undefined) => void;
}

/**
 * What the drawing is set on: nothing, which a journal wants, or a colour
 * with its opacity, for a slide or a poster.
 * @param props - See {@link BackgroundRowProps}.
 * @returns A row of a form.
 */
export function BackgroundRow(props: BackgroundRowProps): ReactElement {
  const { value, onChange } = props;
  const presets: string[] = [];
  for (const preset of PRESETS) {
    if (preset.value) presets.push(preset.value);
  }
  for (const color of PALETTE) presets.push(color.value);
  return (
    <FormGroup
      label="Background"
      helperText="Journals want none: the page is the paper."
    >
      <div className="color-row">
        {PRESETS.map((preset) => (
          <Button
            key={preset.name}
            size="small"
            text={preset.name}
            active={value === preset.value}
            onClick={() => {
              onChange(preset.value);
            }}
          />
        ))}
        <CustomColorButton
          value={value}
          presets={presets}
          label="Another background colour, with its opacity"
          onPick={onChange}
        />
      </div>
    </FormGroup>
  );
}
