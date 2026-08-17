import type { HelpContent } from '../src/help/ui/HelpBody.tsx';

/** A full payload: an explanation, a worked case, and where the rest lives. */
export const MONOISOTOPIC_MASS_HELP: HelpContent = {
  title: 'Monoisotopic mass',
  body: 'The mass of the molecule built from the most abundant isotope of every element. It is what a high-resolution spectrometer measures, and it is not the average mass a balance weighs.',
  example: {
    code: 'C8H10N4O2',
    input: 'caffeine',
    note: '194.0804 Da monoisotopic, against 194.1906 Da on average.',
  },
  link: 'https://www.chemcalc.org/',
};

/** The same shape without a link, so the tooltip closes as soon as it is left. */
export const ADDUCT_HELP: HelpContent = {
  title: 'Adduct',
  body: 'What the molecule picked up on its way into the spectrometer. The peak is the mass of the molecule plus the adduct, less the mass of the electron it gained or lost.',
  example: {
    code: '[M+H]+',
    input: 'C8H10N4O2',
    note: 'm/z 195.0877, one proton above the neutral mass.',
  },
};

/** The smallest a piece of help can be: a title and one sentence. */
export const SMILES_HELP: HelpContent = {
  title: 'SMILES',
  body: 'A structure written as a line of text, which is what a search box and a spreadsheet cell can both hold.',
};
