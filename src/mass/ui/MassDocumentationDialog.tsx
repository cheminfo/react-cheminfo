import type { ReactNode } from 'react';

import type { DocumentationSection } from '../../panel/ui/DocumentationDialogFrame.tsx';
import { DocumentationDialogFrame } from '../../panel/ui/DocumentationDialogFrame.tsx';
import type { MassCommand } from '../core/massCommands.ts';
import { massCommandLabel, massCommands } from '../core/massCommands.ts';
import { HIGH_RESOLVING_POWER } from '../core/massResolution.ts';

export interface MassDocumentationDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Close it. */
  onClose: () => void;
}

/**
 * How to use the viewer, written in the viewer.
 *
 * In the component rather than on a site, so there is nowhere to leave for and
 * nothing to keep in step: every key in the last section is read out of the
 * same command table the toolbar and the key handler read, so a shortcut cannot
 * be documented as one thing and bound as another.
 * @param props - Component props.
 * @returns The dialog.
 */
export function MassDocumentationDialog(props: MassDocumentationDialogProps) {
  const { isOpen, onClose } = props;
  return (
    <DocumentationDialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title="Using the mass spectrum viewer"
      sections={SECTIONS}
    />
  );
}

/**
 * One row of the gestures table: a command, its key and what it does.
 * @param props - Component props.
 * @param props.entry - The command, as the table words it.
 * @returns The row.
 */
function CommandRow(props: { entry: MassCommand }): ReactNode {
  const { entry } = props;
  const keys = entry.shortcut?.label ?? entry.shortcut?.keys ?? [];
  const gestures = (entry.gestures ?? []).flatMap(
    (gesture) => gesture.shortcuts,
  );
  return (
    <tr>
      <th style={labelCellStyle}>{entry.title}</th>
      <td style={keyCellStyle}>{[...keys, ...gestures].join(' · ')}</td>
      <td style={cellStyle}>{entry.description}</td>
    </tr>
  );
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 12,
} as const;

const cellStyle = { padding: '3px 6px', verticalAlign: 'top' } as const;

const labelCellStyle = {
  ...cellStyle,
  textAlign: 'left',
  whiteSpace: 'nowrap',
} as const;

const keyCellStyle = {
  ...cellStyle,
  whiteSpace: 'nowrap',
  opacity: 0.7,
} as const;

/** What the guide says, in reading order. */
const SECTIONS: readonly DocumentationSection[] = [
  {
    id: 'open',
    title: 'Opening a spectrum',
    body: (
      <p>
        Drop JCAMP-DX files (<code>.jdx</code>, <code>.dx</code>) or two columns
        of m/z and intensity (<code>.txt</code>, <code>.csv</code>,{' '}
        <code>.xy</code>) on the chart, or use {massCommandLabel('openFiles')}.
        A JCAMP holding several blocks, or a GC/MS export holding a page per
        scan, gives one spectrum per block or page.
      </p>
    ),
  },
  {
    id: 'peaks',
    title: 'Profile and centroid',
    body: (
      <p>
        A continuous profile is peak picked as it is read; a peak table is taken
        as it stands. Each row of the Spectra panel draws a spectrum as its
        profile or as its picked peaks, never both. The peaks of the selected
        spectrum are labelled on the chart: zoom onto a cluster and every line
        of it is labelled.
      </p>
    ),
  },
  {
    id: 'resolution',
    title: 'High or low resolution',
    body: (
      <p>
        A profile is measured: the median resolving power of its tallest peaks,
        at half height, is high resolution from{' '}
        {HIGH_RESOLVING_POWER.toLocaleString('en-US')}. A peak table has no
        widths, so the instrument its file names decides, and failing that the
        decimals its masses were written with. Masses are written as high
        resolution, to four decimals, or as nominal masses, whole. To write them
        another way, pick the number of decimals in the Peaks panel toolbar; it
        holds for the chart and the tables alike.
      </p>
    ),
  },
  {
    id: 'keys',
    title: 'Gestures and keys',
    body: (
      <table style={tableStyle}>
        <tbody>
          {Object.values(massCommands).map((entry) => (
            <CommandRow key={entry.title} entry={entry} />
          ))}
        </tbody>
      </table>
    ),
  },
];
