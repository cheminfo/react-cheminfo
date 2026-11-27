import { credits } from '../../credits/core/credits.ts';
import { CreditsList } from '../../credits/ui/CreditsList.tsx';
import { paragraphStyle } from '../../panel/core/dialogStyles.ts';
import { AboutDialogFrame } from '../../panel/ui/AboutDialogFrame.tsx';
import { Section } from '../../panel/ui/Section.tsx';
import { massCommands } from '../core/massCommands.ts';

import { MassLogo } from './MassLogo.tsx';

export interface MassAboutDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Close it. */
  onClose: () => void;
}

/**
 * What the viewer is, what it stands on, and who is owed for it.
 *
 * The credits are read from the shared registry rather than written here, so
 * every page of the family names each work the same way, licence included.
 * @param props - Component props.
 * @returns The dialog.
 */
export function MassAboutDialog(props: MassAboutDialogProps) {
  const { isOpen, onClose } = props;

  return (
    <AboutDialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title={massCommands.about.title}
      mark={<MassLogo size={20} />}
      logo={<MassLogo size={64} />}
      name="react-cheminfo/mass"
      intro={
        <p style={paragraphStyle}>
          Draws mass spectra read from JCAMP-DX and text files, picks the peaks
          of a profile, labels them as you zoom, and says whether each spectrum
          is high resolution.
        </p>
      }
    >
      <Section title="Built on">
        <CreditsList entries={MASS_CREDITS} />
        <p style={paragraphStyle}>
          The <strong>colours</strong> are Okabe and Ito&apos;s colour-universal
          palette, so two traces stay distinguishable for a reader with a colour
          vision deficiency.
        </p>
      </Section>
    </AboutDialogFrame>
  );
}

/** Every work the viewer borrows, in the order it reads a file through them. */
const MASS_CREDITS = credits([
  'jcampconverter',
  'xy-parser',
  'ms-spectrum',
  'ml-gsd',
  'ml-spectra-processing',
  'convert-to-jcamp',
  'react-mf',
  'react-science',
  'blueprint',
]);
