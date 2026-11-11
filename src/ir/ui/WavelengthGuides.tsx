import { IR_MODE_RULES } from '../core/irMode.ts';

import { headingStyle, paragraphStyle } from './guideStyles.ts';

/**
 * What is true of reading a UV-vis spectrum here: the files `uv-spectrum`
 * reads, the axis running the usual way, and maxima rather than assignments.
 * @returns The sections.
 */
export function UvVisGuide() {
  return (
    <>
      <h4 style={headingStyle}>Opening a spectrum</h4>
      <p style={paragraphStyle}>
        JCAMP-DX (<code>.jdx</code>, <code>.dx</code>), SPC and PerkinElmer SP (
        <code>.spc</code>, <code>.sp</code>), Cary Eclipse CSV and two columns
        of text are read. A file holding several spectra gives one each.
      </p>

      <h4 style={headingStyle}>Absorbance or transmittance</h4>
      <p style={paragraphStyle}>
        The same measurement, read the other way up — the file carries both,
        whichever it was written in. In{' '}
        <strong>{IR_MODE_RULES.absorbance.title}</strong> the bands stand up out
        of zero; in <strong>{IR_MODE_RULES.transmittance.title}</strong> they
        hang down from 100.
      </p>

      <h4 style={headingStyle}>Reading the maxima</h4>
      <p style={paragraphStyle}>
        Every λmax of the <em>selected</em> spectrum is picked, marked on the
        chart and listed in the bands panel with its absorbance. With the hand
        tool a click on the chart adds the maximum under it, and a click on a
        mark takes it away; from then on the threshold leaves the list alone.
      </p>
      <p style={paragraphStyle}>
        A maximum is reported at the sampled point it peaked on, so on a 1 nm
        grid it is good to the nanometre and no better.
      </p>
    </>
  );
}

/**
 * What is true of reading a fluorescence spectrum here: the light emitted, on
 * one axis, over the same wavelengths as UV-vis, and its maxima.
 * @returns The sections.
 */
export function FluorescenceGuide() {
  return (
    <>
      <h4 style={headingStyle}>Opening a spectrum</h4>
      <p style={paragraphStyle}>
        Cary Eclipse CSV, JCAMP-DX (<code>.jdx</code>, <code>.dx</code>), SPC
        and two columns of text are read. A file holding several scans gives one
        spectrum each.
      </p>

      <h4 style={headingStyle}>Intensity, not absorbance</h4>
      <p style={paragraphStyle}>
        An emission spectrum is the light the sample gives off once excited, in
        the instrument&apos;s own units, so it has no transmittance to switch to
        and no scale shared between two instruments. The excitation wavelength
        and the slits are in the metadata panel, as the file states them.
      </p>

      <h4 style={headingStyle}>Reading the maxima</h4>
      <p style={paragraphStyle}>
        Every emission maximum of the <em>selected</em> spectrum is picked,
        marked on the chart and listed in the bands panel with its intensity.
        With the hand tool a click on the chart adds the maximum under it, and a
        click on a mark takes it away; from then on the threshold leaves the
        list alone.
      </p>
    </>
  );
}
