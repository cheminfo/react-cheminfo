import { CHROME_CATALOG } from '../../i18n/core/chromeCatalog.ts';
import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';
import { catalogTranslate } from '../../i18n/core/translate.ts';

import type {
  EmptyGuideFigure,
  EmptyGuideFigureStack,
} from './GuideFigures.tsx';

/**
 * The address of each example's figure, out of the glob a site keeps beside
 * its guide — which must stay in the site, since Vite resolves a glob where it
 * is written: `import.meta.glob('./figures/*.svg', { query: '?url', import:
 * 'default', eager: true })`.
 * @param figures - The glob, keyed by `./figures/<id>.svg`.
 * @returns The address of an example's figure, or `undefined` when it has none.
 */
export function guideFigureLookup(
  figures: Readonly<Record<string, string>>,
): (id: string) => string | undefined {
  return (id) => figures[`./figures/${id}.svg`];
}

/** How {@link exampleGuideFigures} reads one example. */
export interface ExampleGuideFiguresOptions<TExample> {
  /** The address of the example's figure, `undefined` when it has none. */
  src: (example: TExample) => string | undefined;
  /** What the example is called. */
  name: (example: TExample) => string;
  /** Open the example, as `?example=` does. */
  open: (example: TExample) => void;
  /**
   * The language of the tooltip.
   * @default 'en'
   */
  language?: Language;
}

/**
 * The faint figures of a guide, drawn from the site's examples: the first
 * takes half the room, the others share the other half one above the other —
 * a figure is wider than it is tall, and three side by side would leave each
 * a sliver. An example without a figure is left out.
 * @param examples - The examples the guide offers, simplest first.
 * @param options - How an example is read and opened.
 * @returns The layout `<EmptyGuide figures>` takes; empty with no figure.
 */
export function exampleGuideFigures<TExample>(
  examples: readonly TExample[],
  options: ExampleGuideFiguresOptions<TExample>,
): Array<EmptyGuideFigure | EmptyGuideFigureStack> {
  const t = catalogTranslate(
    CHROME_CATALOG,
    options.language ?? DEFAULT_LANGUAGE,
  );
  const figures: EmptyGuideFigure[] = [];
  for (const example of examples) {
    const src = options.src(example);
    if (src === undefined) continue;
    const name = options.name(example);
    figures.push({
      src,
      alt: name,
      title: t('guide.openExample', { name }),
      onSelect: () => {
        options.open(example);
      },
    });
  }
  const [first, ...others] = figures;
  return first === undefined ? [] : [first, { stack: others }];
}
