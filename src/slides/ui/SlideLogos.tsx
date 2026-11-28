import type { ReactElement } from 'react';

/**
 * The logos a title slide carries, from the talk's front matter.
 * @param props - The logos.
 * @param props.logos - Their image addresses, in order.
 * @returns The row, or nothing when the talk names none.
 */
export function SlideLogos(props: {
  logos: readonly string[];
}): ReactElement | null {
  const { logos } = props;
  if (logos.length === 0) return null;
  return (
    <div className="slide-logos">
      {logos.map((logo) => (
        <img key={logo} className="slide-logo" src={logo} alt="" />
      ))}
    </div>
  );
}
