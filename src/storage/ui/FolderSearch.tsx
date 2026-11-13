import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { PanelEmpty } from '../../panel/ui/PanelMessage.tsx';
import { PanelSearchField } from '../../panel/ui/PanelSearch.tsx';

/**
 * The search box of a folder panel, for its toolbar row inside a
 * `<PanelSearch>`: the drafts, the documents saved in this browser, the files
 * of the folder and the examples are searched at once, each section keeping
 * only the rows that hold what is typed.
 * @param props - What it says.
 * @param props.placeholder - What the empty box says is searched.
 * @default placeholder the chrome's own sentence: your documents and the examples
 * @returns The box.
 */
export function FolderSearchField(props: {
  placeholder?: string;
}): ReactElement | null {
  const t = useChromeT();
  return (
    <PanelSearchField placeholder={props.placeholder ?? t('folder.search')} />
  );
}

/**
 * What a section shows in place of its rows while a search keeps none of
 * them: it says nothing matched rather than vanishing, so the reader sees
 * every section was searched.
 * @returns The line.
 */
export function FolderNoMatch(): ReactElement {
  const t = useChromeT();
  return <PanelEmpty>{t('folder.noMatch')}</PanelEmpty>;
}
