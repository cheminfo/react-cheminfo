/**
 * What the documentation says about quantifying a survey: the line each
 * element is read on, the instrument whose factors divide it, and the formulas
 * the composition could be.
 */

import { paragraphStyle } from '../../panel/core/dialogStyles.ts';
import type { DocumentationSection } from '../../panel/ui/DocumentationDialogFrame.tsx';

/** The section, read after the composition of a fit. */
export const surveySection: DocumentationSection = {
  id: 'survey',
  title: 'Quantifying a survey',
  body: (
    <>
      <p style={paragraphStyle}>
        Select a survey and open <b>Quantification</b>. Each element is read on
        one line — its strongest one inside the survey — over a window from 8 eV
        below the published level to 10 eV above it, and the window is shaded on
        the chart. The area over a Shirley or linear background is divided by
        the line&apos;s sensitivity factor, and the atomic percentages are those
        quotients over their sum.
      </p>
      <p style={paragraphStyle}>
        The factors belong to an instrument: the cog lists them. The viewer
        ships two for Al Kα: the Kratos library, relative to F 1s, which it
        starts with, and Scofield&apos;s cross-sections, relative to C 1s, which
        carry no transmission or escape-depth correction. Enter your
        instrument&apos;s own library — one line at a time, or pasted as a table
        such as <code>C 1s 0.278</code> — and quantify with it; it is kept in
        this browser.
      </p>
      <p style={paragraphStyle}>
        The elements start as those of the narrow scans of the same sample. Type
        others into the field above the table; a survey does not see hydrogen or
        helium. The formulas below are the ratios of whole numbers within five
        points of every percentage, the closest first — a survey is good to
        about ten per cent, so several usually fit.
      </p>
    </>
  ),
};
