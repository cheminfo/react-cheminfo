import { Dialog, DialogBody } from '@blueprintjs/core';

import { credits } from '../../credits/core/credits.ts';
import { CreditsList } from '../../credits/ui/CreditsList.tsx';
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
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={massCommands.about.title}
      icon={<MassLogo size={20} />}
      style={dialogStyle}
    >
      <DialogBody>
        <div style={brandStyle}>
          <MassLogo size={64} />
          <div>
            <p style={leadStyle}>react-cheminfo/mass</p>
            <p style={paragraphStyle}>
              Draws mass spectra read from JCAMP-DX and text files, picks the
              peaks of a profile, labels them as you zoom, and says whether each
              spectrum is high resolution.
            </p>
          </div>
        </div>

        <h4 style={headingStyle}>Built on</h4>
        <CreditsList entries={MASS_CREDITS} />
        <p style={paragraphStyle}>
          The <strong>colours</strong> are Okabe and Ito&apos;s colour-universal
          palette, so two traces stay distinguishable for a reader with a colour
          vision deficiency.
        </p>
      </DialogBody>
    </Dialog>
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
