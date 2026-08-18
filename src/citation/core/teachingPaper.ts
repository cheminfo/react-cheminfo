import type { Reference } from './reference.ts';
import type { CitedWork } from './works.ts';

/**
 * The twenty years of online teaching the pedagogic sites of the family come
 * out of: the tutorials, the exercises and the marking are the web-based tools
 * it describes. One record holds it, so no site can name a different version
 * of it.
 */
export const TEACHING_PAPER: Reference = {
  authors: [
    { given: 'R.', family: 'Turin' },
    { given: 'L.', family: 'Patiny' },
  ],
  title:
    'Two Decades of Online Teaching: Trends, Challenges, and Future Directions',
  journal: 'CHIMIA',
  journalAbbreviation: 'Chimia',
  year: 2023,
  volume: '77',
  issue: '10',
  firstPage: '683',
  lastPage: '687',
  doi: '10.2533/chimia.2023.683',
  publisher: 'Swiss Chemical Society',
};

/**
 * The teaching paper as one of the works a site that teaches asks to be cited,
 * beside `PLATFORM_WORK` and the work the tool itself implements.
 */
export const TEACHING_WORK: CitedWork = {
  reference: TEACHING_PAPER,
  what: 'Teaching chemistry online',
  note: 'Cite it for the exercises, which are the web-based teaching it describes.',
};
