import { Dialog, DialogBody } from '@blueprintjs/core';

import { Prose } from '../../i18n/ui/Prose.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { IrCommand, IrCommandId } from '../core/irCommands.ts';
import { IR_MODE_RULES } from '../core/irMode.ts';
import type { IrTechnique } from '../core/irTechnique.ts';
import { irCommandsFor } from '../core/irTechniqueCommands.ts';

import { IrLogo } from './IrLogo.tsx';
import { useIrText } from './useIrText.ts';

export interface IrDocumentationDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Close it. */
  onClose: () => void;
  /**
   * What the spectra were measured with, which decides what the guide says:
   * only what is true of the technique, and only the commands it offers.
   * @default 'infrared'
   */
  technique?: IrTechnique;
}

/**
 * How to use the viewer, written in the viewer.
 *
 * In the component rather than on a site, so there is nowhere to leave for and
 * nothing to keep in step: every key in the table below is read out of the same
 * command table the toolbar and the key handler read, so a shortcut cannot be
 * documented as one thing and bound as another.
 * @param props - Component props.
 * @returns The dialog.
 */
export function IrDocumentationDialog(props: IrDocumentationDialogProps) {
  const { isOpen, onClose, technique = 'infrared' } = props;
  const text = useIrText(technique);
  const ids = Object.keys(irCommandsFor(technique)) as IrCommandId[];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={text.documentation}
      icon={<IrLogo size={20} technique={technique} />}
      style={dialogStyle}
    >
      <DialogBody>
        {technique === 'raman' ? <RamanGuide /> : <InfraredGuide />}

        <h4 style={headingStyle}>Gestures and keys</h4>
        <table style={tableStyle}>
          <tbody>
            {ids.map((id) => {
              const entry = text.command(id);
              return entry === undefined ? null : (
                <CommandRow key={id} entry={entry} />
              );
            })}
          </tbody>
        </table>
      </DialogBody>
    </Dialog>
  );
}

/**
 * What is true of reading an infrared spectrum here.
 * @returns The sections.
 */
function InfraredGuide() {
  return (
    <>
      <h4 style={headingStyle}>Opening a spectrum</h4>
      <p style={paragraphStyle}>
        JCAMP-DX (<code>.jdx</code>, <code>.dx</code>) and Thermo Galactic SPC (
        <code>.spc</code>) are read. A file holding several blocks — a sample
        beside its background, or an infrared spectrum beside a Raman one —
        gives one spectrum per infrared block; the others are left to their own
        viewers. Two columns of numbers are not read yet.
      </p>

      <h4 style={headingStyle}>The axis runs backwards</h4>
      <p style={paragraphStyle}>
        Wavenumber decreases to the right, from 4000 cm⁻¹ down to 400, which is
        how infrared spectra have been printed since the instruments scanned
        that way. Every window is still stated low end first.
      </p>

      <h4 style={headingStyle}>Absorbance or transmittance</h4>
      <p style={paragraphStyle}>
        The same measurement, read the other way up — the file carries both,
        whichever it was written in. In{' '}
        <strong>{IR_MODE_RULES.transmittance.title}</strong> the bands hang down
        from a baseline near 100; in{' '}
        <strong>{IR_MODE_RULES.absorbance.title}</strong> they stand up out of
        zero. The labels and the marks follow, so the pair reads the same way up
        in either.
      </p>

      <h4 style={headingStyle}>Reading the bands</h4>
      <p style={paragraphStyle}>
        The bands of the <em>selected</em> spectrum are picked, marked on the
        chart, and listed in the bands panel with{' '}
        <strong>every vibration whose range contains them</strong> — narrowest
        claim first. That is deliberate: a band at 1715 cm⁻¹ really is a ketone,
        an aldehyde and a carboxylic acid until something else decides between
        them, and the note on each candidate is what tells them apart. Hovering
        a row marks the band on the chart, and hovering the chart lights the
        row.
      </p>
      <p style={paragraphStyle}>
        The bands are found automatically until you pick them by hand: with the
        hand tool a click on the chart adds the band under it, at its top, and a
        click on a mark takes it away, as does the cross at the end of its row.
        From then on the threshold leaves the list alone, until it is found
        automatically again.
      </p>
      <p style={paragraphStyle}>
        A band is reported at the sampled point it peaked on, so on a 4 cm⁻¹
        grid a carbonyl centred at 1710 reads 1708 or 1712. Do not quote one as
        though it were measured to the wavenumber.
      </p>
    </>
  );
}

/**
 * What is true of reading a Raman spectrum here: only the bands, since it has
 * one value axis, runs the usual way, and is not assigned.
 * @returns The section.
 */
function RamanGuide() {
  const t = useChromeT();
  return (
    <>
      <h4 style={headingStyle}>Reading the bands</h4>
      <p style={paragraphStyle}>
        <Prose text={t('ir.raman.doc.bands')} />
      </p>
      <p style={paragraphStyle}>{t('ir.raman.doc.sampled')}</p>
    </>
  );
}

interface CommandRowProps {
  /** The command, as the viewer words it. */
  entry: IrCommand;
}

/**
 * One command: what it is called, its key, and what it does.
 * @param props - Component props.
 * @returns The row.
 */
function CommandRow(props: CommandRowProps) {
  const { entry } = props;
  const keys = entry.shortcut?.label ?? entry.shortcut?.keys;

  return (
    <tr>
      <th style={commandCellStyle}>{entry.title}</th>
      <td style={keyCellStyle}>
        {keys === undefined
          ? null
          : keys.map((key) => (
              <kbd key={key} style={keyStyle}>
                {key}
              </kbd>
            ))}
        {entry.gestures?.map((gesture) => (
          <span key={gesture.title} style={gestureStyle}>
            {gesture.shortcuts.join(', ')}
          </span>
        ))}
      </td>
      <td style={descriptionCellStyle}>{entry.description}</td>
    </tr>
  );
}

const dialogStyle = { width: 'min(760px, 92vw)' } as const;

const headingStyle = { margin: '14px 0 4px' } as const;

const paragraphStyle = { margin: '0 0 6px' } as const;

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
} as const;

const commandCellStyle = {
  textAlign: 'left',
  fontWeight: 600,
  verticalAlign: 'top',
  padding: '3px 8px 3px 0',
  whiteSpace: 'nowrap',
} as const;

const keyCellStyle = {
  verticalAlign: 'top',
  padding: '3px 8px 3px 0',
  whiteSpace: 'nowrap',
} as const;

const descriptionCellStyle = {
  verticalAlign: 'top',
  padding: '3px 0',
} as const;

const keyStyle = {
  display: 'inline-block',
  marginRight: 3,
  padding: '0 4px',
  border: `1px solid ${TOKEN.border}`,
  borderRadius: 3,
  background: TOKEN.surfaceSunken,
  fontSize: 11,
} as const;

const gestureStyle = { opacity: 0.7, fontSize: 12 } as const;
