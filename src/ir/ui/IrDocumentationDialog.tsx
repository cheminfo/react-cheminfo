import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import { Prose } from '../../i18n/ui/Prose.tsx';
import type { Translate } from '../../i18n/ui/useT.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { EditorCommand } from '../../panel/core/editorCommands.ts';
import { CommandKeysTable } from '../../panel/ui/CommandKeysTable.tsx';
import type { DocumentationSection } from '../../panel/ui/DocumentationDialogFrame.tsx';
import { DocumentationDialogFrame } from '../../panel/ui/DocumentationDialogFrame.tsx';
import type { IrCommandId } from '../core/irCommands.ts';
import { IR_MODE_RULES } from '../core/irMode.ts';
import type { IrTechnique } from '../core/irTechnique.ts';
import { irCommandsFor } from '../core/irTechniqueCommands.ts';

import { FLUORESCENCE_GUIDE, UV_VIS_GUIDE } from './WavelengthGuides.tsx';
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
  const t = useChromeT();
  const text = useIrText(technique);
  const commands: EditorCommand[] = [];
  for (const id of Object.keys(irCommandsFor(technique)) as IrCommandId[]) {
    const entry = text.command(id);
    if (entry !== undefined) commands.push(entry);
  }
  const sections: DocumentationSection[] = [
    ...(technique === 'raman' ? ramanGuide(t) : GUIDES[technique]),
    {
      id: 'keys',
      title: 'Gestures and keys',
      body: <CommandKeysTable commands={commands} />,
    },
  ];

  return (
    <DocumentationDialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title={text.documentation}
      sections={sections}
    />
  );
}

/** What is true of reading an infrared spectrum here. */
const INFRARED_GUIDE: readonly DocumentationSection[] = [
  {
    id: 'open',
    title: 'Opening a spectrum',
    body: (
      <p>
        JCAMP-DX (<code>.jdx</code>, <code>.dx</code>) and Thermo Galactic SPC (
        <code>.spc</code>) are read. A file holding several blocks — a sample
        beside its background, or an infrared spectrum beside a Raman one —
        gives one spectrum per infrared block; the others are left to their own
        viewers. Two columns of numbers are not read yet.
      </p>
    ),
  },
  {
    id: 'axis',
    title: 'The axis runs backwards',
    body: (
      <p>
        Wavenumber decreases to the right, from 4000 cm⁻¹ down to 400, which is
        how infrared spectra have been printed since the instruments scanned
        that way. Every window is still stated low end first.
      </p>
    ),
  },
  {
    id: 'modes',
    title: 'Absorbance or transmittance',
    body: (
      <p>
        The same measurement, read the other way up — the file carries both,
        whichever it was written in. In{' '}
        <strong>{IR_MODE_RULES.transmittance.title}</strong> the bands hang down
        from a baseline near 100; in{' '}
        <strong>{IR_MODE_RULES.absorbance.title}</strong> they stand up out of
        zero. The labels and the marks follow, so the pair reads the same way up
        in either.
      </p>
    ),
  },
  {
    id: 'bands',
    title: 'Reading the bands',
    body: (
      <>
        <p>
          The bands of the <em>selected</em> spectrum are picked, marked on the
          chart, and listed in the bands panel with{' '}
          <strong>every vibration whose range contains them</strong> — narrowest
          claim first. That is deliberate: a band at 1715 cm⁻¹ really is a
          ketone, an aldehyde and a carboxylic acid until something else decides
          between them, and the note on each candidate is what tells them apart.
          Hovering a row marks the band on the chart, and hovering the chart
          lights the row.
        </p>
        <p>
          The bands are found automatically until you pick them by hand: with
          the hand tool a click on the chart adds the band under it, at its top,
          and a click on a mark takes it away, as does the cross at the end of
          its row. From then on the threshold leaves the list alone, until it is
          found automatically again.
        </p>
        <p>
          A band is reported at the sampled point it peaked on, so on a 4 cm⁻¹
          grid a carbonyl centred at 1710 reads 1708 or 1712. Do not quote one
          as though it were measured to the wavenumber.
        </p>
      </>
    ),
  },
];

/** The guide each technique's documentation opens on, Raman's aside. */
const GUIDES: Record<
  Exclude<IrTechnique, 'raman'>,
  readonly DocumentationSection[]
> = {
  infrared: INFRARED_GUIDE,
  uvvis: UV_VIS_GUIDE,
  fluorescence: FLUORESCENCE_GUIDE,
};

/**
 * What is true of reading a Raman spectrum here: only the bands, since it has
 * one value axis, runs the usual way, and is not assigned.
 * @param t - The chrome's formatter.
 * @returns The section.
 */
function ramanGuide(t: Translate<ChromeKey>): readonly DocumentationSection[] {
  return [
    {
      id: 'bands',
      title: 'Reading the bands',
      body: (
        <>
          <p>
            <Prose text={t('ir.raman.doc.bands')} />
          </p>
          <p>{t('ir.raman.doc.sampled')}</p>
        </>
      ),
    },
  ];
}
