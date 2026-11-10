import { credits } from '../../credits/core/credits.ts';
import { CreditsList } from '../../credits/ui/CreditsList.tsx';
import { paragraphStyle } from '../../panel/core/dialogStyles.ts';
import { AboutDialogFrame } from '../../panel/ui/AboutDialogFrame.tsx';
import { Link, Section } from '../../panel/ui/Section.tsx';

import { XpsLogo } from './XpsLogo.tsx';

export interface XpsAboutDialogProps {
  /** Whether the dialog is showing. */
  isOpen: boolean;
  /** Called when it is dismissed. */
  onClose: () => void;
}

/**
 * What this viewer is, what it is built on, and who the parts came from.
 *
 * The file reading, the CASA fit and the peak detection behind it are other
 * people's work, and the credit belongs somewhere a chemist can find it rather
 * than only in the source headers — particularly `xps-analysis`, which decides
 * what a VAMAS block and a CASA block comment mean and therefore what every
 * number in the panels is computed from. The works are read from the family's
 * registry, so each is named, linked and licensed the way every other page of
 * the family names it.
 * @param props - Component props.
 * @returns The dialog.
 */
export function XpsAboutDialog(props: XpsAboutDialogProps) {
  const { isOpen, onClose } = props;

  return (
    <AboutDialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title="About the XPS viewer"
      mark={<XpsLogo size={20} />}
      logo={<XpsLogo size={64} />}
      name="react-cheminfo/xps"
      intro={
        <p style={paragraphStyle}>
          Open an X-ray photoelectron spectrum, read its peaks against the
          reference binding energies, look at the fit somebody made of it, and
          see what that fit makes the surface composition.
        </p>
      }
    >
      <Section title="Built on">
        <CreditsList entries={XPS_CREDITS} />
        <p style={paragraphStyle}>
          VAMAS itself is parsed by{' '}
          <Link href="https://www.npmjs.com/package/vamas">vamas</Link>,
          underneath xps-analysis. Nothing is uploaded anywhere: every file is
          read in the browser.
        </p>
      </Section>

      <Section title="Examples">
        <p style={paragraphStyle}>
          The cellulose and poly(ethylene glycol) examples are from{' '}
          <i>The XPS of Polymers Database</i> by G. Beamson and D. Briggs,
          &copy; 2000 SurfaceSpectra Ltd., measured on a Scienta ESCA300 and
          exported through <Link href="https://www.casaxps.com">CasaXPS</Link>.
          The WS<sub>2</sub>/MoS<sub>2</sub>, TaO<sub>2</sub> and copper Auger
          examples were measured in-house on a Kratos instrument. All six travel
          with xps-analysis.
        </p>
      </Section>
    </AboutDialogFrame>
  );
}

/** Every work the viewer borrows, in the order a file is read through them. */
const XPS_CREDITS = credits([
  'xps-analysis',
  'xy-parser',
  'ml-gsd',
  'ml-spectra-processing',
  'xps-of-polymers',
  'react-science',
  'blueprint',
]);
