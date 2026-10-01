/**
 * The control that moves one axis between its two scales.
 *
 * It belongs on the figure rather than in the page around it: the scale is not
 * a property of the page but of the picture, a reader decides to change it
 * while looking at the picture, and a figure handed out on its own — embedded
 * in a course page, pasted into a deck — takes its controls with it. So it is
 * written as a control of an `OverlayBar`, floating in whichever corner the
 * marks leave emptiest.
 *
 * Its two segments are named here rather than by each site, because `Linear`
 * and `Log` are chrome: one translation reaches every figure in the family.
 */

import type { ReactElement } from 'react';

import type { HelpContent } from '../../help/ui/HelpBody.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import type { AxisScale } from '../core/axisScale.ts';

/** Which axis a control belongs to, which is how it names itself. */
export type AxisScaleAxis = 'x' | 'y';

/** What {@link AxisScaleControl} needs. */
export interface AxisScaleControlProps {
  /** The scale in force — what `resolveAxisScale` answered, not the choice. */
  value: AxisScale;
  /** Called with the scale the reader picked. */
  onChange: (scale: AxisScale) => void;
  /**
   * Which axis it sets, which names it `X scale` or `Y scale`. Leave it out on
   * a figure where only one axis offers the choice: the control is then simply
   * `Scale`, because naming the axis is only worth the width when there are two
   * of them to tell apart.
   * @default undefined — the control is named `Scale`
   */
  axis?: AxisScaleAxis;
  /**
   * What it is called, overriding both of the above. For a figure whose axis
   * has a name the reader already knows it by.
   * @default the chrome's own word, in the language of the page
   */
  label?: string;
  /**
   * What the two scales do, in a sentence.
   * @default the chrome's own explanation
   */
  help?: HelpContent;
  /**
   * Whether the name is announced but not written.
   * @default false
   */
  hideLabel?: boolean;
  /**
   * Whether the control is greyed and unreachable.
   * @default false
   */
  disabled?: boolean;
  /**
   * Value of the `data-testid` attribute.
   * @default undefined
   */
  testId?: string;
}

/**
 * The two scales, the one in force pressed.
 * @param props - See {@link AxisScaleControlProps}.
 * @returns The named pair of segments.
 */
export function AxisScaleControl(props: AxisScaleControlProps): ReactElement {
  const { value, onChange, axis, label, help, testId } = props;
  const { hideLabel = false, disabled = false } = props;
  const t = useChromeT();

  const options: ReadonlyArray<OverlayOption<AxisScale>> = [
    { value: 'linear', label: t('axis.linear') },
    { value: 'log', label: t('axis.logarithmic') },
  ];

  return (
    <OverlaySegmented<AxisScale>
      label={label ?? t(nameOf(axis))}
      help={help ?? { title: t('axis.scale'), body: t('axis.scaleHelp') }}
      hideLabel={hideLabel}
      disabled={disabled}
      value={value}
      options={options}
      onChange={onChange}
      testId={testId}
    />
  );
}

function nameOf(
  axis: AxisScaleAxis | undefined,
): 'axis.scale' | 'axis.xScale' | 'axis.yScale' {
  if (axis === 'x') return 'axis.xScale';
  if (axis === 'y') return 'axis.yScale';
  return 'axis.scale';
}
