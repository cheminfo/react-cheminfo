import type { ReactElement } from 'react';

import type { HeaderButtonProps } from '../../shared/ui/MenuButton.tsx';
import { MenuButton } from '../../shared/ui/MenuButton.tsx';

import type { CitedReferenceProps, CitedWorksProps } from './CitationMenu.tsx';
import { CitationMenu } from './CitationMenu.tsx';

interface CiteButtonBaseProps extends HeaderButtonProps {
  /**
   * Text of the button. In a compact bar it is not written, but it stays what
   * the pointer and a screen reader are told.
   * @default 'Cite'
   */
  label?: string;
}

/** The button of a site asking for one work. */
export interface CiteOneWorkProps
  extends CiteButtonBaseProps, CitedReferenceProps {}

/** The button of a site asking for the several works it is built on. */
export interface CiteWorksProps extends CiteButtonBaseProps, CitedWorksProps {}

export type CiteButtonProps = CiteOneWorkProps | CiteWorksProps;

/**
 * The Cite entry of a site header: one button opening the article at its DOI,
 * the reference in the style a journal asks for, and the files a reference
 * manager imports. A site built on several works passes `works` rather than
 * `reference`, and each is then listed behind what citing it credits.
 * @param props - The work or works being cited, and how the menu opens.
 * @returns The button and its menu.
 */
export function CiteButton(props: CiteButtonProps): ReactElement {
  const label = props.label ?? 'Cite';

  return (
    <MenuButton
      compact={props.compact}
      placement={props.placement}
      className="citation-button"
      icon="citation"
      label={label}
      menu={
        'works' in props ? (
          <CitationMenu works={props.works} guidance={props.guidance} />
        ) : (
          <CitationMenu reference={props.reference} />
        )
      }
    />
  );
}
