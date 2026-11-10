/**
 * What the viewer's documentation says, as data.
 *
 * The content lives here rather than in the dialog that shows it, so it can be
 * read and extended by anyone — the dialog is only a renderer — and so a test
 * can check the two halves have not drifted apart.
 */

import { listStyle, paragraphStyle } from '../../panel/core/dialogStyles.ts';
import type { DocumentationSection } from '../../panel/ui/DocumentationDialogFrame.tsx';

/** The documentation, in the order it is read. */
export const xpsDocumentationSections: readonly DocumentationSection[] = [
  {
    id: 'opening',
    title: 'Opening a spectrum',
    body: (
      <>
        <p style={paragraphStyle}>
          Drop a file anywhere on the chart. VAMAS (<code>.vms</code>) and
          JCAMP-DX are read in the browser and nothing is uploaded anywhere. A
          VAMAS file holds one block per acquisition and each becomes one
          spectrum — six samples measured over eight transitions arrive as
          forty-eight of them, never merged — so the list beside the chart is
          also how a sample and a transition are picked.
        </p>
        <p style={paragraphStyle}>
          Two columns of binding energy and counts can simply be pasted in. A
          paste is delivered to whatever holds the caret, so click the viewer
          once first if it has not been touched yet. A pasted list says nothing
          about how it was acquired, the photon energy included, so it keeps the
          axis it was pasted on.
        </p>
      </>
    ),
  },
  {
    id: 'energy',
    title: 'Binding energy, and the axis it is drawn on',
    body: (
      <>
        <p style={paragraphStyle}>
          A photoelectron leaves the sample with whatever the photon gave it
          less what held it in, so <b>binding = hν − kinetic</b>. Binding energy
          is what a spectrum is published in and the only axis two instruments
          agree on: read in kinetic energy, the same C 1s line lands 253 eV
          apart on an Al Kα and a Mg Kα machine.
        </p>
        <p style={paragraphStyle}>
          The axis is therefore drawn with binding energy{' '}
          <b>decreasing from left to right</b>, which is the published
          convention: a reversed axis, never reversed data. The axis button on
          the toolbar to the left, or <kbd>k</kbd>, puts the chart on kinetic
          energy when that is what you want to read. A file that states no
          photon energy has no binding axis at all — its trace already holds
          kinetic energy, it stays there whatever the switch says, and the axis
          is titled so.
        </p>
      </>
    ),
  },
  {
    id: 'chart',
    title: 'Reading the chart',
    body: (
      <>
        <p style={paragraphStyle}>
          Drag across the region you want to zoom the energy axis — the question
          is nearly always <i>what is between 280 and 292 eV</i>. Hold shift and
          drag to slide the window along without changing its width. A double
          click puts it back to everything that is drawn.
        </p>
        <p style={paragraphStyle}>
          The wheel scales the counts axis on its own, which is how a satellite
          at a percent of the main line is brought up to a readable height: a
          survey scan spans four decades, so this is not a nicety. The two zoom
          buttons in the toolbar do the same by a fixed step. Resting the
          pointer on the chart reads out the energy under it and the nearest
          peak; clicking one hands its binding energy to the panels.
        </p>
      </>
    ),
  },
  {
    id: 'backgrounds',
    title: 'Backgrounds',
    body: (
      <>
        <p style={paragraphStyle}>
          Every photoelectron that lost energy on its way out of the solid is
          counted somewhere below its own line, so the counts under a peak are
          not all its own. An area means nothing until that is taken off, and
          each region of a fitted file names what its author took off, written
          above the region on the chart:
        </p>
        <ul style={listStyle}>
          <li>
            <b>None</b> — the trace as it was measured. What a survey scan is
            read on: nothing is being quantified, so nothing is subtracted.
          </li>
          <li>
            <b>Linear</b> — a straight line between the two ends of the region.
            Honest for a narrow line on a flat background, and quick.
          </li>
          <li>
            <b>Shirley</b> — the inelastic tail is taken to be proportional to
            the counts still above it at higher kinetic energy, solved
            iteratively. This is what a fitted narrow scan was quantified with,
            and what a CASA file usually states.
          </li>
        </ul>
        <p style={paragraphStyle}>
          The fit is the file’s: the viewer shows that background as CasaXPS
          wrote it and never substitutes one of its own.
        </p>
      </>
    ),
  },
  {
    id: 'components',
    title: 'What a component is',
    body: (
      <p style={paragraphStyle}>
        A <b>peak</b> is a feature of the data — a maximum the detection found
        in the trace — and it says nothing about chemistry. A <b>component</b>{' '}
        is a claim about chemistry made by whoever fitted the file: the two
        components under one C 1s envelope are a C–C carbon and a C–O carbon,
        and the whole point of the file having been fitted is that somebody
        decided which. They are never invented here — position, width, shape,
        area and sensitivity factor are as CASA wrote them — and they are drawn
        filled under their own curves with their sum dashed over the
        measurement, so a fit that does not account for the data shows up as the
        gap between the two.
      </p>
    ),
  },
  {
    id: 'composition',
    title: 'What the composition numbers mean',
    body: (
      <>
        <p style={paragraphStyle}>
          The atomic percentages are areas divided by relative sensitivity
          factors, normalised to sum to a hundred. The sensitivity factor is
          what turns a measured area into a number of atoms — it carries the
          photoionisation cross-section, the analyser transmission and the
          escape depth — and it is taken from the file, never from a table of
          our own, which would be another laboratory&apos;s numbers silently
          substituted for the ones the fit was actually done with.
        </p>
        <p style={paragraphStyle}>
          So they are the composition <i>of the volume XPS sampled</i>, the top
          few nanometres weighted towards the surface, and not of the material.
          A component whose file states no sensitivity factor cannot be counted
          and is listed as such, rather than being given a factor of one.
        </p>
      </>
    ),
  },
  {
    id: 'panels',
    title: 'The panels',
    body: (
      <>
        <p style={paragraphStyle}>
          The icons down the far right switch the panels on and off, one by one:
          several share the side at once, each taking a share of the height, and
          a panel header folds its own panel away. Every panel acts on the{' '}
          <b>selected</b> spectrum, which is the row highlighted in the spectra
          list.
        </p>
        <ul style={listStyle}>
          <li>
            <b>Spectra</b> — one row per spectrum: its colour, whether it is
            drawn, its name, and the way to close it. A VAMAS file arrives as
            many rows, so this is also the sample and transition picker.
          </li>
          <li>
            <b>Acquisition</b> — how the file said the spectrum was measured:
            source, photon energy, analyser mode, pass energy. A short table
            means a terse file, not a missing feature.
          </li>
          <li>
            <b>Peaks</b> — the maxima found in the selected trace, with their
            energies and counts. Resting on a row lights that peak on the chart.
          </li>
          <li>
            <b>Elements</b> — what each peak could be, by looking its binding
            energy up against the reference levels within the tolerance you set.
            Half an eV is a charge correction and two is a chemical shift; past
            about three the answer stops being one element.
          </li>
          <li>
            <b>Fit</b> — the components the file was fitted with: position,
            width, shape, area and sensitivity factor, one row each.
          </li>
          <li>
            <b>Composition</b> — what those components make the surface
            composition, element by element.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'window',
    title: 'The viewer itself',
    body: (
      <p style={paragraphStyle}>
        The toolbar down the left of the chart carries how every spectrum is
        drawn: the energy axis, and whether the counts are normalised so two
        spectra acquired with different dwell times can be compared by shape.
        The header carries what is asked of the viewer itself: the mark on the
        left opens <b>About</b>; on the right sit this documentation and{' '}
        <b>full screen</b>. It is the viewer that goes full screen rather than
        the page, so a chart sharing the window with something else takes the
        screen on its own; <kbd>Esc</kbd> gives it back. What a spectrum is read
        with — the VAMAS and CASA reading, the peak detection — is other
        people&apos;s work, credited in <b>About</b>.
      </p>
    ),
  },
];
