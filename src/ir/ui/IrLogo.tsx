export interface IrLogoProps {
  /**
   * How big to draw it, in pixels.
   * @default 16
   */
  size?: number;
}

/**
 * The viewer's mark: three bands hanging from a baseline.
 *
 * Drawn from the domain's own primitives rather than being a picture of a chart —
 * a transmittance baseline near the top with a strong band, a medium one and a
 * weak one dropping out of it, which is what an infrared spectrum looks like at a
 * glance and what nothing else looks like. Three elements, because that is what
 * survives 16 pixels.
 * @param props - Component props.
 * @returns The mark, as SVG.
 */
export function IrLogo(props: IrLogoProps) {
  const { size = 16 } = props;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      role="img"
      aria-label="Infrared viewer"
    >
      {/* The baseline, high up, where 100 % transmittance runs. */}
      <path
        d="M1 3H15"
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1}
        strokeLinecap="round"
      />
      {/* Three bands dropping out of it, strong, medium, weak. */}
      <path
        d="M3 3V13M8 3V8.5M12.5 3V6"
        fill="none"
        stroke="#0072b2"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
