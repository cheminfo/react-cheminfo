import type { IrTechnique } from '../core/irTechnique.ts';

import { useIrText } from './useIrText.ts';

export interface IrLogoProps {
  /**
   * How big to draw it, in pixels.
   * @default 16
   */
  size?: number;
  /**
   * What the spectra were measured with, which decides which way the bands
   * point.
   * @default 'infrared'
   */
  technique?: IrTechnique;
}

/**
 * The viewer's mark: three bands meeting a baseline.
 *
 * Drawn from the domain's own primitives rather than being a picture of a chart —
 * a transmittance baseline near the top with a strong band, a medium one and a
 * weak one dropping out of it, which is what an infrared spectrum looks like at a
 * glance and what nothing else looks like. A Raman spectrum's bands stand up from
 * a baseline near the foot instead, so its mark is the same three bands rising.
 * Three elements, because that is what survives 16 pixels.
 * @param props - Component props.
 * @returns The mark, as SVG.
 */
export function IrLogo(props: IrLogoProps) {
  const { size = 16, technique = 'infrared' } = props;
  const { mark } = useIrText(technique);
  const { baseline, bands } = MARKS[technique];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      role="img"
      aria-label={mark}
    >
      {/* The baseline: high up where 100 % transmittance runs, low for Raman. */}
      <path
        d={baseline}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1}
        strokeLinecap="round"
      />
      {/* Three bands meeting it, strong, medium, weak. */}
      <path
        d={bands}
        fill="none"
        stroke="#0072b2"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The two strokes of each technique's mark. */
const MARKS: Record<IrTechnique, { baseline: string; bands: string }> = {
  infrared: { baseline: 'M1 3H15', bands: 'M3 3V13M8 3V8.5M12.5 3V6' },
  raman: { baseline: 'M1 13H15', bands: 'M3 13V3M8 13V7.5M12.5 13V10' },
};
