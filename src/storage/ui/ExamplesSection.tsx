import { Button } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

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
}

/**
 * The documents a site comes with, in a folder panel: a click shows one in
 * place of what is on screen, and the `+`, where the view holds several,
 * adds it.
 * @param props - See {@link ExamplesSectionProps}.
 * @returns The section.
 */
export function ExamplesSection<TExample extends FolderExample>(
  props: ExamplesSectionProps<TExample>,
): ReactElement {
  const { examples, onOpen, onAdd, addLabel, openLabel, confirmOpen } = props;
  const t = useChromeT();
  const confirmation = useOpenConfirmation(confirmOpen);
  return (
    <section
      className="folder-panel__section"
      aria-label={t('examples.heading')}
    >
      <h3 className="folder-panel__heading">{t('examples.heading')}</h3>
      <ul className="folder-panel__list">
        {examples.map((example) => (
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
    </section>
  );
}
