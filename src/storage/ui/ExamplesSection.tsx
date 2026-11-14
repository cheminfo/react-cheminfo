import { Button } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import { CapsuleFilter } from '../../capsule/ui/CapsuleFilter.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { matchesNeedle } from '../../panel/core/textFilter.ts';
import {
  usePanelNeedle,
  usePanelTally,
} from '../../panel/ui/panelSearchContext.ts';

import { FolderNoMatch } from './FolderSearch.tsx';
import { FolderSection } from './FolderSection.tsx';
import type { ConfirmOpen } from './useOpenConfirmation.tsx';
import { useOpenConfirmation } from './useOpenConfirmation.tsx';

/** What an example is listed by. */
export interface FolderExample {
  /** Its identifier. */
  id: string;
  /** Its name. */
  name: string;
  /** What it shows, in a few words. */
  description: string;
  /**
   * What else the folder's search finds it by, never shown: a formula's
   * source, a diagram's text.
   * @default undefined — its name, its description and its category alone
   */
  keywords?: string;
  /**
   * The `id` of the {@link ExampleCategory} it belongs to, or the ids of all
   * of them when it belongs to several: it then carries a pill for each, in
   * that order, and each of their capsules lists it.
   * @default undefined — no pill, and only the "All" capsule lists it
   */
  category?: string | readonly string[];
}

/**
 * A category the examples are sorted into: a coloured pill on each of its
 * rows, and a capsule above the list keeping only its examples.
 */
export interface ExampleCategory {
  /** Its identifier, what an example's `category` names. */
  id: string;
  /** What its pill and its capsule read. */
  label: string;
  /** Its colour, as `#rgb` or `#rrggbb`. */
  color: string;
}

/** Props of {@link ExamplesSection}. */
export interface ExamplesSectionProps<TExample extends FolderExample> {
  /** The examples, in the order they are listed. */
  examples: readonly TExample[];
  /** Puts an example on screen, in place of what is there. */
  onOpen: (example: TExample) => void;
  /**
   * Adds an example beside what is on screen, from a `+` on its row.
   * @default undefined — a view that holds one document has no `+`
   */
  onAdd?: (example: TExample) => void;
  /**
   * The tooltip of the `+`.
   * @default the chrome's own sentence
   */
  addLabel?: string;
  /**
   * The tooltip of a row: what opening does to the document on screen.
   * @default the chrome's own sentence
   */
  openLabel?: string;
  /**
   * What is asked before an example replaces the document on screen.
   * @default undefined — nothing is asked
   */
  confirmOpen?: ConfirmOpen;
  /**
   * A small picture of an example, drawn at the start of its row.
   * @default undefined — the name alone
   */
  thumbnail?: (example: TExample) => ReactNode;
  /**
   * The categories the examples fall into, in the order their capsules are
   * drawn: each row then carries its category as a pill, and a row of
   * capsules keeps only the examples of some of them.
   * @default undefined — no pills and no capsules
   */
  categories?: readonly ExampleCategory[];
}

/**
 * The documents a site comes with, in a folder panel: a click shows one in
 * place of what is on screen, and the `+`, where the view holds several,
 * adds it. Given categories, each row carries its own as coloured pills, and
 * a row of capsules above the list keeps only some of them. Inside a
 * `<PanelSearch>`, only the examples whose name, description, keywords or
 * category hold the search are listed, and the capsules count those.
 * @param props - See {@link ExamplesSectionProps}.
 * @returns The section.
 */
export function ExamplesSection<TExample extends FolderExample>(
  props: ExamplesSectionProps<TExample>,
): ReactElement {
  const { examples, onOpen, onAdd, addLabel, openLabel, confirmOpen } = props;
  const t = useChromeT();
  const confirmation = useOpenConfirmation(confirmOpen);
  const needle = usePanelNeedle();
  const [selected, setSelected] = useState<string[]>([]);
  const categories = new Map<string, ExampleCategory>();
  for (const category of props.categories ?? []) {
    categories.set(category.id, category);
  }
  // The capsules are those of every example, so typing never moves them;
  // their counts are those of the examples the search keeps.
  const listed = new Set<string>();
  const counts = new Map<string, number>();
  const found: TExample[] = [];
  const pills = new Map<TExample, ExampleCategory[]>();
  for (const example of examples) {
    const own = categoriesOf(example, categories);
    pills.set(example, own);
    for (const category of own) listed.add(category.id);
    if (
      !matchesNeedle(
        needle,
        example.name,
        example.description,
        example.keywords,
        ...own.map((category) => category.label),
      )
    ) {
      continue;
    }
    found.push(example);
    for (const category of own) {
      counts.set(category.id, (counts.get(category.id) ?? 0) + 1);
    }
  }
  const kept = selected.filter((id) => listed.has(id));
  const shown =
    kept.length === 0
      ? found
      : found.filter((example) =>
          pills.get(example)?.some((category) => kept.includes(category.id)),
        );
  usePanelTally(shown.length, examples.length);
  return (
    <FolderSection
      name="examples"
      title={t('examples.heading')}
      count={examples.length}
    >
      {listed.size > 1 ? (
        <CapsuleFilter
          multiple
          className="folder-panel__categories no-print"
          label={t('examples.categories')}
          options={[...categories.values()]
            .filter((category) => listed.has(category.id))
            .map((category) => ({
              value: category.id,
              label: category.label,
              color: category.color,
              count: counts.get(category.id) ?? 0,
            }))}
          values={kept}
          allOption={{ label: t('examples.all'), count: found.length }}
          onChange={setSelected}
        />
      ) : null}
      {shown.length === 0 && needle !== '' ? <FolderNoMatch /> : null}
      <ul className="folder-panel__list">
        {shown.map((example) => (
          <li key={example.id} className="folder-panel__item">
            <button
              type="button"
              className="folder-panel__open"
              title={openLabel ?? t('examples.openTooltip')}
              onClick={() => {
                confirmation.open(() => {
                  onOpen(example);
                });
              }}
            >
              {props.thumbnail?.(example)}
              <span className="folder-panel__text">
                <span className="folder-panel__name">{example.name}</span>
                <span className="folder-panel__time">
                  {pills.get(example)?.map((category) => (
                    <CategoryPill key={category.id} category={category} />
                  ))}
                  {example.description}
                </span>
              </span>
            </button>
            {onAdd ? (
              <Button
                variant="minimal"
                size="small"
                icon="plus"
                className="no-print"
                aria-label={t('examples.add', { name: example.name })}
                title={addLabel ?? t('examples.addTooltip')}
                onClick={() => {
                  onAdd(example);
                }}
              />
            ) : null}
          </li>
        ))}
      </ul>
      {confirmation.alert}
    </FolderSection>
  );
}

function categoriesOf(
  example: FolderExample,
  categories: ReadonlyMap<string, ExampleCategory>,
): ExampleCategory[] {
  const { category: named } = example;
  if (named === undefined) return [];
  const ids = typeof named === 'string' ? [named] : named;
  const own: ExampleCategory[] = [];
  for (const id of ids) {
    const category = categories.get(id);
    if (category && !own.includes(category)) own.push(category);
  }
  return own;
}

function CategoryPill(props: { category: ExampleCategory }): ReactElement {
  const { category } = props;
  return (
    <span
      className="folder-panel__category"
      style={{ '--category': category.color } as CSSProperties}
    >
      {category.label}
    </span>
  );
}
