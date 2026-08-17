import type { ShareVocabulary } from '../src/share/core/index.ts';
import { integerParam, suggestedShareConfig } from '../src/share/core/index.ts';

/** The largest page of hits a link may ask for, so an embed cannot hang the page. */
export const MAX_RESULTS = 200;

/** How many hits the page shows when no link asks for another number. */
export const DEFAULT_RESULT_LIMIT = 25;

/** The tool's own parameters — here the cap on how many hits a link asks for. */
export const SHARE_PARAMS = {
  limit: integerParam({
    min: 1,
    max: MAX_RESULTS,
    default: DEFAULT_RESULT_LIMIT,
  }),
};

/** The codecs of this fixture, so a story can name what the dialog carries. */
export type ShareParams = typeof SHARE_PARAMS;

/**
 * What one structure search's links can say: the four panels a host page may
 * have no use for, and the result cap. Modelled on what a real tool offers, so
 * the dialog has something honest to configure.
 */
export const SHARE_VOCABULARY: ShareVocabulary<ShareParams> = {
  parts: [
    {
      key: 'examples',
      label: 'Examples',
      description: 'The ready-to-load structures: benzene, caffeine, taxol.',
    },
    {
      key: 'substructure',
      label: 'Substructure search',
      description:
        'Hiding it leaves the exact search, on the structure the link carries.',
    },
    {
      key: 'hints',
      label: 'Hints',
      description: 'The hint ladder, revealed one rung at a time.',
      hiddenByDefault: true,
    },
    {
      key: 'limits',
      label: 'Result limit',
      description:
        'Hiding it keeps the limit the link asks for, and stops a visitor raising it.',
      hiddenByDefault: true,
    },
  ],
  params: SHARE_PARAMS,
};

/** Every part key, for a control that ticks them one by one. */
export const SHARE_PART_KEYS = SHARE_VOCABULARY.parts.map((part) => part.key);

/** The parts a host page has no use for, which is what a dialog opens on. */
export const SUGGESTED_HIDDEN = suggestedShareConfig(SHARE_VOCABULARY).hidden;

/** Where the page is served from — origin and path, no query. */
export const SHARE_BASE = 'https://smiles.cheminfo.org/search';

/** The tool's own input, which travels with every link: naphthalene. */
export const SHARE_SEARCH = 'smiles=c1ccc2ccccc2c1';

/** How the open page is named in the dialog. */
export const SHARE_PAGE_TITLE = 'Structure search';

/** What a screen reader announces the frame as, in someone else's page. */
export const SHARE_FRAME_TITLE = 'smiles.cheminfo.org — Structure search';
