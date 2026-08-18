import type { Reference } from './reference.ts';
import type { CitedWork } from './works.ts';

/**
 * The platform every site of the family runs on: chemical data processed in the
 * browser, which is what makes these applications rather than queues of jobs.
 * One record holds it, so no site can name a different version of it.
 */
export const PLATFORM_PAPER: Reference = {
  authors: [{ given: 'L.', family: 'Patiny' }],
  title:
    'Unlocking the Potential of Browser-Based Scientific Data Analysis: A 20-Year Journey of Expertise',
  journal: 'CHIMIA',
  journalAbbreviation: 'Chimia',
  year: 2025,
  volume: '79',
  issue: '1-2',
  firstPage: '66',
  lastPage: '69',
  doi: '10.2533/chimia.2025.66',
  publisher: 'Swiss Chemical Society',
};

/**
 * The platform paper as the second work a site asks to be cited, after the work
 * the tool itself implements.
 */
export const PLATFORM_WORK: CitedWork = {
  reference: PLATFORM_PAPER,
  what: 'Data processing in the browser',
  note: 'Cite it for the site itself, which runs in the browser.',
};
