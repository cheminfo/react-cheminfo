import type { ReactElement } from 'react';

import type { HeaderButtonProps } from '../../shared/ui/MenuButton.tsx';
import { MenuButton } from '../../shared/ui/MenuButton.tsx';
import type { Reference } from '../core/reference.ts';

import { CitationMenu } from './CitationMenu.tsx';

export interface CiteButtonProps extends HeaderButtonProps {
  /** The work the site asks to be cited. */
  reference: Reference;
  /**
   * Text of the button. In a compact bar it is not written, but it stays what
   * the pointer and a screen reader are told.
   * @default 'Cite'
   */
  label?: string;
}

/**
 * The Cite entry of a site header: one button opening the article at its DOI,
 * the reference in the style a journal asks for, and the files a reference
 * manager imports.
 * @param props - The work being cited, and how the menu opens.
 * @returns The button and its menu.
 */
export function CiteButton(props: CiteButtonProps): ReactElement {
  const { reference, label = 'Cite', ...rest } = props;

  return (
    <MenuButton
      {...rest}
      className="citation-button"
      icon="citation"
      label={label}
      menu={<CitationMenu reference={reference} />}
    />
  );
}
