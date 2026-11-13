import { Icon } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

import { formatRelativeTime } from '../../format/core/relativeTime.ts';
import { useLanguage } from '../../i18n/ui/useLanguage.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { FolderEntry } from '../core/siteFolderTypes.ts';

import { folderPathLabel } from './saveMessages.ts';

/**
 * The heading of a folder section: the chosen folder, then the folders open
 * inside it, each a step back up to it.
 * @param props - What it shows.
 * @param props.root - The chosen folder's name.
 * @param props.path - The folders open inside it.
 * @param props.onOpen - Opens the folder at a path.
 * @param props.toggle - What opens and closes the section, drawn first.
 * @param props.actions - What the section does, small and grey at the end
 * of the line.
 * @returns The heading.
 */
export function FolderCrumbs(props: {
  root: string;
  path: readonly string[];
  onOpen: (path: readonly string[]) => void;
  toggle?: ReactNode;
  actions?: ReactNode;
}): ReactElement {
  const { root, path, onOpen, toggle, actions } = props;
  const t = useChromeT();
  const steps = [root, ...path];
  const heading = (
    <h3 className="folder-panel__heading folder-panel__crumbs">
      {toggle}
      <Icon icon="folder-open" size={12} />
      {steps.map((name, index) => {
        const last = index === steps.length - 1;
        return (
          // A folder may repeat a name further down: its whole path is the key.
          <span
            key={steps.slice(0, index + 1).join('/')}
            className="folder-panel__crumb"
          >
            {index > 0 ? <span aria-hidden="true"> › </span> : null}
            {last ? (
              <span aria-current="location">{name}</span>
            ) : (
              <button
                type="button"
                className="folder-panel__crumb-link"
                title={t('folder.openFolder', { folder: name })}
                onClick={() => {
                  onOpen(path.slice(0, index));
                }}
              >
                {name}
              </button>
            )}
          </span>
        );
      })}
    </h3>
  );
  if (actions === undefined) return heading;
  return (
    <div className="folder-panel__heading-row">
      {heading}
      <span className="folder-panel__heading-actions no-print">{actions}</span>
    </div>
  );
}

/**
 * A command of a section, written small and grey on its heading line.
 * @param props - What it says and does.
 * @param props.text - What it reads.
 * @param props.onClick - What it does.
 * @returns The button.
 */
export function HeadingAction(props: {
  text: string;
  onClick: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      className="folder-panel__heading-action"
      onClick={props.onClick}
    >
      {props.text}
    </button>
  );
}

/**
 * A folder inside the one open: a click opens it.
 * @param props - What it shows.
 * @param props.name - Its name.
 * @param props.onOpen - Opens it.
 * @returns The row.
 */
export function SubfolderRow(props: {
  name: string;
  onOpen: () => void;
}): ReactElement {
  const { name, onOpen } = props;
  const t = useChromeT();
  return (
    <li className="folder-panel__item">
      <button
        type="button"
        className="folder-panel__open folder-panel__open--folder"
        title={t('folder.openFolder', { folder: name })}
        onClick={onOpen}
      >
        <Icon icon="folder-close" className="folder-panel__folder-icon" />
        <span className="folder-panel__text">
          <span className="folder-panel__name">{name}</span>
        </span>
      </button>
    </li>
  );
}

/**
 * A file of the folder: a click opens it, and Save then writes over it. A
 * file a search found deeper says where it is.
 * @param props - What it shows.
 * @param props.entry - The file.
 * @param props.root - The chosen folder's name.
 * @param props.path - The folders open inside it.
 * @param props.current - Whether it is the file on screen.
 * @param props.onOpen - Opens it.
 * @returns The row.
 */
export function FolderFileRow(props: {
  entry: FolderEntry;
  root: string;
  path: readonly string[];
  current: boolean;
  onOpen: () => void;
}): ReactElement {
  const { entry, root, path, current, onOpen } = props;
  const t = useChromeT();
  const language = useLanguage();
  const deeper = entry.path !== undefined && entry.path.length > 0;
  return (
    <li className="folder-panel__item">
      <button
        type="button"
        className="folder-panel__open"
        aria-current={current ? 'true' : undefined}
        title={t('documents.openTooltip')}
        onClick={onOpen}
      >
        <span className="folder-panel__text">
          <span className="folder-panel__name">{entry.name}</span>
          <span className="folder-panel__time">
            {current
              ? t('documents.onScreen')
              : deeper
                ? t('folder.found', {
                    path: folderPathLabel(root, [
                      ...path,
                      ...(entry.path ?? []),
                    ]),
                  })
                : t('documents.savedAgo', {
                    time: formatRelativeTime(entry.modified, {
                      locale: language,
                    }),
                  })}
          </span>
        </span>
      </button>
    </li>
  );
}
