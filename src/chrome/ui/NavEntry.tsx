import type { ReactElement } from 'react';

import { NavLink } from './NavLink.tsx';
import { NavMenuButton } from './NavMenuButton.tsx';
import type { NavItem } from './navItem.ts';

/**
 * One page of the bar: a link, or the menu it opens when the entry folds pages
 * of its own. A menu stands where its pages would, among them and not among the
 * utilities, because picking one of them changes what the page shows.
 * @param props - The entry and the page on show.
 * @param props.item - The entry.
 * @param props.activeId - The page on show.
 * @returns The entry.
 */
export function NavEntry(props: {
  item: NavItem;
  activeId: string | undefined;
}): ReactElement {
  const { item, activeId } = props;
  if (item.items === undefined) {
    return <NavLink item={item} active={item.id === activeId} />;
  }

  return (
    <NavMenuButton
      label={menuLabel(item)}
      icon={typeof item.icon === 'string' ? item.icon : undefined}
      items={item.items}
      activeId={activeId}
      placement="bottom-start"
    />
  );
}

// The trigger names itself to a screen reader, so an entry drawn as a glyph
// alone says what it opens through its title rather than through its id.
function menuLabel(item: NavItem): string {
  if (typeof item.label === 'string') return item.label;
  return item.title ?? item.id;
}
