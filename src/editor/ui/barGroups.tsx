/**
 * A bar's buttons in groups, a rule between two groups that hold something:
 * an empty slot neither counts as a button nor leaves a rule behind it.
 */

import type { ReactElement, ReactNode } from 'react';
import { Fragment } from 'react';

/**
 * The nodes that draw something, in order.
 * @param nodes - Buttons and slots, some of them empty.
 * @returns The ones that are not `null`, `undefined`, a boolean or `''`.
 */
export function filled(nodes: readonly ReactNode[]): ReactNode[] {
  const kept: ReactNode[] = [];
  for (const node of nodes) {
    if (
      node === null ||
      node === undefined ||
      typeof node === 'boolean' ||
      node === ''
    ) {
      continue;
    }
    kept.push(node);
  }
  return kept;
}

/**
 * The groups that hold something, one after the other, a divider between two.
 * @param groups - The groups, each from {@link filled}.
 * @param divider - What is drawn between two groups.
 * @returns The bar's buttons.
 */
export function separated(
  groups: ReadonlyArray<readonly ReactNode[]>,
  divider: ReactElement,
): ReactElement {
  const drawn: ReactElement[] = [];
  for (let index = 0; index < groups.length; index++) {
    const group = groups[index];
    if (group === undefined || group.length === 0) continue;
    if (drawn.length > 0) {
      drawn.push(<Fragment key={`rule-${index}`}>{divider}</Fragment>);
    }
    for (let item = 0; item < group.length; item++) {
      drawn.push(<Fragment key={`${index}-${item}`}>{group[item]}</Fragment>);
    }
  }
  return <>{drawn}</>;
}
