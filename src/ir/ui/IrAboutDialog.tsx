import type { CreditEntry, CreditId } from '../../credits/core/credits.ts';
import { credits } from '../../credits/core/credits.ts';
import { CreditsList } from '../../credits/ui/CreditsList.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { paragraphStyle } from '../../panel/core/dialogStyles.ts';
import { AboutDialogFrame } from '../../panel/ui/AboutDialogFrame.tsx';
import { Section } from '../../panel/ui/Section.tsx';
import { irCommands } from '../core/irCommands.ts';
import type { IrTechnique } from '../core/irTechnique.ts';
import { IR_TECHNIQUE_RULES } from '../core/irTechnique.ts';

import { IrLogo } from './IrLogo.tsx';
import { useIrText } from './useIrText.ts';

export interface IrAboutDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Close it. */
  onClose: () => void;
  /**
   * What the spectra were measured with, which decides what the viewer says it
   * does and whom it credits for it.
   * @default 'infrared'
   */
  technique?: IrTechnique;
}

/**
 * What the viewer is, what it stands on, and who is owed for it.
 *
 * The credits are not decoration. Every band this viewer names is named out of a
 * correlation table that generations of chemists compiled, and every file it
 * opens is read by somebody else's parser. The works are read from the family's
 * registry, so each is named, linked and licensed the way every other page of
 * the family names it.
 * @param props - Component props.
 * @returns The dialog.
 */
export function IrAboutDialog(props: IrAboutDialogProps) {
  const { isOpen, onClose, technique = 'infrared' } = props;
  const t = useChromeT();
  const title = (useIrText(technique).command('about') ?? irCommands.about)
    .title;

  return (
    <AboutDialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      mark={<IrLogo size={20} technique={technique} />}
      logo={<IrLogo size={64} technique={technique} />}
      name={DOORS[technique]}
      intro={
        <p style={paragraphStyle}>
          {technique === 'raman' ? t('ir.raman.aboutLead') : LEADS[technique]}
        </p>
      }
    >
      <Section title="Built on">
        <CreditsList entries={CREDITS[technique]} />
      </Section>
      <Section title="Colours and tables">
        {IR_TECHNIQUE_RULES[technique].assignments ? (
          <p style={paragraphStyle}>
            The <strong>correlation table</strong> is the conventional teaching
            set of group frequencies, as any introductory spectroscopy text
            tabulates them. The ranges are deliberately the rounded, generous
            ones: narrowing them to look precise would rule out assignments that
            are genuinely possible.
          </p>
        ) : null}
        <p style={paragraphStyle}>
          The <strong>colours</strong> are Okabe and Ito&apos;s colour-universal
          palette, so two traces stay distinguishable for a reader with a colour
          vision deficiency.
        </p>
      </Section>
    </AboutDialogFrame>
  );
}

/** The entry point each technique's viewer is imported from. */
const DOORS: Record<IrTechnique, string> = {
  infrared: 'react-cheminfo/ir',
  raman: 'react-cheminfo/raman',
  uvvis: 'react-cheminfo/uvvis',
  fluorescence: 'react-cheminfo/uvvis',
};

/** What each viewer worded from the core records does, in a sentence. */
const LEADS: Record<Exclude<IrTechnique, 'raman'>, string> = {
  infrared:
    'Draws an infrared spectrum the way infrared is printed, reads it as absorbance or as percent transmittance, picks its bands and offers every functional group each band could be.',
  uvvis:
    'Draws UV-vis spectra over their wavelengths, reads them as absorbance or as percent transmittance, and picks every λmax.',
  fluorescence:
    'Draws fluorescence spectra over their wavelengths, as the intensity of the light emitted, and picks every emission maximum.',
};

/** The works each technique's viewer reads its files through, then draws with. */
const SHARED_CREDITS: readonly CreditId[] = [
  'common-spectrum',
  'jcampconverter',
  'spc-parser',
  'convert-to-jcamp',
  'ml-gsd',
  'ml-spectra-processing',
  'react-science',
  'blueprint',
];

/** Every work each technique's viewer borrows, its own reader first. */
const CREDITS: Record<IrTechnique, readonly CreditEntry[]> = {
  infrared: credits(['ir-spectrum', ...SHARED_CREDITS]),
  raman: credits(['raman-spectrum', 'ir-spectrum', ...SHARED_CREDITS]),
  uvvis: credits(['uv-spectrum', 'ir-spectrum', ...SHARED_CREDITS]),
  fluorescence: credits(['uv-spectrum', 'ir-spectrum', ...SHARED_CREDITS]),
};
