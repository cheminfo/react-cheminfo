import { Dialog, DialogBody } from '@blueprintjs/core';

import { Prose } from '../../i18n/ui/Prose.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { irCommands } from '../core/irCommands.ts';
import type { IrTechnique } from '../core/irTechnique.ts';

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
 * correlation table that generations of chemists compiled, every file it opens is
 * read by somebody else's parser, and the examples it opens on are somebody
 * else's measurements — so each is named here, with its licence where it has one.
 * @param props - Component props.
 * @returns The dialog.
 */
export function IrAboutDialog(props: IrAboutDialogProps) {
  const { isOpen, onClose, technique = 'infrared' } = props;
  const t = useChromeT();
  const title = (useIrText(technique).command('about') ?? irCommands.about)
    .title;
  const raman = technique === 'raman';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<IrLogo size={20} technique={technique} />}
      style={dialogStyle}
    >
      <DialogBody>
        <div style={brandStyle}>
          <IrLogo size={64} technique={technique} />
          <div>
            <p style={leadStyle}>{DOORS[technique]}</p>
            {raman ? (
              <p style={paragraphStyle}>{t('ir.raman.aboutLead')}</p>
            ) : (
              <p style={paragraphStyle}>
                Draws an infrared spectrum the way infrared is printed, reads it
                as absorbance or as percent transmittance, picks its bands and
                offers every functional group each band could be.
              </p>
            )}
          </div>
        </div>

        <h4 style={headingStyle}>Credits</h4>
        <ul style={listStyle}>
          {raman ? (
            <>
              <li>
                <Prose text={t('ir.raman.credit.picking')} />
              </li>
              <li>
                <Prose text={t('ir.raman.credit.jcamp')} />
              </li>
            </>
          ) : (
            <>
              <li>
                <strong>ir-spectrum</strong> (cheminfo, MIT) reads the JCAMP-DX
                and SPC files, derives the absorbance/transmittance pair, and
                picks the bands. This package deliberately does none of that
                arithmetic itself.
              </li>
              <li>
                <strong>common-spectrum</strong>,{' '}
                <strong>jcampconverter</strong> and <strong>spc-parser</strong>{' '}
                (cheminfo, MIT) are what it reads through.
              </li>
            </>
          )}
          <li>
            <strong>ml-spectra-processing</strong> (mljs, MIT) for the array
            work.
          </li>
          <li>
            The <strong>shared chart</strong> of this package for the drawing —
            the same arithmetic every other spectrum viewer of the family is
            drawn with.
          </li>
          <li>
            <strong>react-science</strong> and <strong>BlueprintJS</strong>
            (zakodium, Palantir) for the shell this viewer is shaped like.
          </li>
          {raman ? null : (
            <li>
              The <strong>correlation table</strong> is the conventional
              teaching set of group frequencies, as any introductory
              spectroscopy text tabulates them. The ranges are deliberately the
              rounded, generous ones: narrowing them to look precise would rule
              out assignments that are genuinely possible.
            </li>
          )}
          <li>
            The <strong>colours</strong> are Okabe and Ito&apos;s
            colour-universal palette, so two traces stay distinguishable for a
            reader with a colour vision deficiency.
          </li>
        </ul>
      </DialogBody>
    </Dialog>
  );
}

/** The entry point each technique's viewer is imported from. */
const DOORS: Record<IrTechnique, string> = {
  infrared: 'react-cheminfo/ir',
  raman: 'react-cheminfo/raman',
};

const dialogStyle = { width: 'min(680px, 92vw)' } as const;

const brandStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 16,
} as const;

const leadStyle = {
  margin: '0 0 4px',
  fontWeight: 600,
  fontSize: 16,
} as const;

const paragraphStyle = { margin: '0 0 6px' } as const;

const headingStyle = { margin: '14px 0 4px' } as const;

const listStyle = { margin: 0, paddingLeft: 20 } as const;
