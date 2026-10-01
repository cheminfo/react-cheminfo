/**
 * The three controls an orbital canvas owns: the cartesian frame, the slow
 * spin that makes a 3D shape readable on a flat screen, and the way back to the
 * framing the orbital opened on — a change of orbital keeps whatever angle and
 * zoom the student is on.
 */

import { Button } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { HelpContent } from '../../help/ui/HelpBody.tsx';
import { HelpTooltip } from '../../help/ui/HelpTooltip.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';

/** Props of {@link AtomicOrbitalControls}. */
interface AtomicOrbitalControlsProps {
  /** Whether the frame is drawn. */
  axes: boolean;
  /** Called when the frame button is pressed. */
  onToggleAxes: () => void;
  /** Whether the scene is turning. */
  spinning: boolean;
  /** Called when the spin button is pressed. */
  onToggleSpin: () => void;
  /** Called when the reset button is pressed. */
  onResetView: () => void;
}

/**
 * The frame, spin and reset buttons, in the canvas's top-right corner.
 * @param props - See {@link AtomicOrbitalControlsProps}.
 * @returns The three buttons.
 */
export function AtomicOrbitalControls(
  props: AtomicOrbitalControlsProps,
): ReactElement {
  const { axes, onToggleAxes, spinning, onToggleSpin, onResetView } = props;
  const t = useChromeT();
  const axesHelp: HelpContent = {
    title: t('orbital.axesTitle'),
    body: t('orbital.axesBody'),
    example: { code: '3d_yz', note: t('orbital.axesExample') },
  };
  const spinHelp: HelpContent = {
    title: t('orbital.spinTitle'),
    body: t('orbital.spinBody'),
  };
  const resetHelp: HelpContent = {
    title: t('orbital.resetTitle'),
    body: t('orbital.resetBody'),
  };
  return (
    <div style={CONTROLS_STYLE}>
      <HelpTooltip content={axesHelp} placement="bottom">
        <Button
          variant="minimal"
          size="small"
          icon="grid"
          active={axes}
          aria-label={t('orbital.showAxes')}
          aria-pressed={axes}
          onClick={onToggleAxes}
        />
      </HelpTooltip>
      <HelpTooltip content={spinHelp} placement="bottom">
        <Button
          variant="minimal"
          size="small"
          icon="refresh"
          active={spinning}
          aria-label={t('orbital.spin')}
          aria-pressed={spinning}
          onClick={onToggleSpin}
        />
      </HelpTooltip>
      <HelpTooltip content={resetHelp} placement="bottom">
        <Button
          variant="minimal"
          size="small"
          icon="zoom-to-fit"
          aria-label={t('orbital.resetTitle')}
          onClick={onResetView}
        />
      </HelpTooltip>
    </div>
  );
}

const CONTROLS_STYLE: CSSProperties = {
  position: 'absolute',
  top: 4,
  right: 4,
  zIndex: 1,
  display: 'flex',
  gap: 2,
};
