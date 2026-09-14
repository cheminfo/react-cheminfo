/**
 * The two controls an orbital canvas owns: the cartesian frame, and the way
 * back to the framing the orbital opened on — a change of orbital keeps
 * whatever angle and zoom the student is on.
 */

import { Button } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { HelpContent } from '../../help/ui/HelpBody.tsx';
import { HelpTooltip } from '../../help/ui/HelpTooltip.tsx';

/** Props of {@link AtomicOrbitalControls}. */
interface AtomicOrbitalControlsProps {
  /** Whether the frame is drawn. */
  axes: boolean;
  /** Called when the frame button is pressed. */
  onToggleAxes: () => void;
  /** Called when the reset button is pressed. */
  onResetView: () => void;
}

/**
 * The frame and reset buttons, in the canvas's top-right corner.
 * @param props - See {@link AtomicOrbitalControlsProps}.
 * @returns The two buttons.
 */
export function AtomicOrbitalControls(
  props: AtomicOrbitalControlsProps,
): ReactElement {
  const { axes, onToggleAxes, onResetView } = props;
  return (
    <div style={CONTROLS_STYLE}>
      <HelpTooltip content={AXES_HELP} placement="bottom">
        <Button
          variant="minimal"
          size="small"
          icon="grid"
          active={axes}
          aria-label="Show the x, y, z axes"
          aria-pressed={axes}
          onClick={onToggleAxes}
        />
      </HelpTooltip>
      <HelpTooltip content={RESET_HELP} placement="bottom">
        <Button
          variant="minimal"
          size="small"
          icon="zoom-to-fit"
          aria-label="Reset the view"
          onClick={onResetView}
        />
      </HelpTooltip>
    </div>
  );
}

/** What the frame button says it is for. */
const AXES_HELP: HelpContent = {
  title: 'Cartesian axes',
  body: 'Draw x, y and z through the nucleus. The label names an orbital by where its lobes sit against them.',
  example: {
    code: '3d_yz',
    note: 'four lobes between the y and z axes, none on either.',
  },
};

/** What the reset button says it is for. */
const RESET_HELP: HelpContent = {
  title: 'Reset the view',
  body: 'Back to the angle and zoom the orbital opened on. A change of orbital keeps whatever view you have turned it to.',
};

const CONTROLS_STYLE: CSSProperties = {
  position: 'absolute',
  top: 4,
  right: 4,
  zIndex: 1,
  display: 'flex',
  gap: 2,
};
