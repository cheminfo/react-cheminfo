import type { ReactElement, ReactNode } from 'react';
import { Fragment } from 'react';

import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import { splitOrganismName } from '../core/organismName.ts';
import { isAboveGenus } from '../core/ranks.ts';

/** What an {@link OrganismName} needs. */
export interface OrganismNameProps {
  /** The name, as its source writes it. */
  name: string;
  /**
   * The rank of the taxon the name belongs to. A name ranked above the genus
   * (a family, an order) is set upright whatever its shape.
   * @default undefined — the name is read by its shape alone
   */
  rank?: string;
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * An organism's name, with the genus and the epithets in italics and the
 * authority, the strain and `sp.` upright, as nomenclature sets them.
 *
 * The italics are `<i>`, the element HTML names for a taxonomic designation,
 * and the name keeps every character its source gave it.
 * @param props - See {@link OrganismNameProps}.
 * @returns The name.
 */
export function OrganismName(props: OrganismNameProps): ReactElement {
  const { name, rank, className } = props;
  const parts =
    rank !== undefined && isAboveGenus(rank)
      ? [{ text: name, italic: false }]
      : splitOrganismName(name);

  const children: ReactNode[] = [];
  let offset = 0;
  for (const part of parts) {
    children.push(
      part.italic ? (
        <i key={offset}>{part.text}</i>
      ) : (
        <Fragment key={offset}>{part.text}</Fragment>
      ),
    );
    offset += part.text.length;
  }

  return (
    <span className={joinClassNames('organism-name', className)}>
      {children}
    </span>
  );
}
