/**
 * The two controls an orbital canvas owns: the cartesian frame, and the way
 * back to the framing the orbital opened on — a change of orbital keeps
 * whatever angle and zoom the student is on.
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
  const t = useChromeT();
  const axesHelp: HelpContent = {
    title: t('orbital.axesTitle'),
    body: t('orbital.axesBody'),
    example: { code: '3d_yz', note: t('orbital.axesExample') },
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
