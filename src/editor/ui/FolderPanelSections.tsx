import type { ReactElement, ReactNode } from 'react';

import type { DraftStore } from '../../storage/core/createDraftStore.ts';
import type {
  SavedDocument,
  SavedDocuments,
} from '../../storage/core/createSavedDocuments.ts';
import type { DocumentFile } from '../../storage/core/documentFile.ts';
import type { DocumentSaver } from '../../storage/core/documentSaverTypes.ts';
import type { DraftSession } from '../../storage/core/draftSessionTypes.ts';
import { DocumentPlaceLine } from '../../storage/ui/DocumentPlaceLine.tsx';
import type { DraftsSectionProps } from '../../storage/ui/DraftsSection.tsx';
import { DraftsSection } from '../../storage/ui/DraftsSection.tsx';
import type {
  ExamplesSectionProps,
  FolderExample,
} from '../../storage/ui/ExamplesSection.tsx';
import { ExamplesSection } from '../../storage/ui/ExamplesSection.tsx';
import { FolderDocumentsSection } from '../../storage/ui/FolderDocumentsSection.tsx';
import { SavedDocumentsSection } from '../../storage/ui/SavedDocumentsSection.tsx';
import type { ConfirmOpen } from '../../storage/ui/useOpenConfirmation.tsx';

/** The drafts of a folder panel. */
export interface EditorFolderDrafts<D> {
  /** The site's draft store. */
  store: DraftStore<D>;
  /** The draft session keeping the document on screen. */
  session: DraftSession;
  /** Whether this browser keeps drafts; undefined until it is known. */
  available: boolean | undefined;
  /** Bumped whenever the drafts change, so the list is read again. */
  version: number;
  /** The draft the document on screen is kept in. */
  currentId: string | null;
  /**
   * The name a draft is listed under.
   * @default the section's own
   */
  name?: DraftsSectionProps<D>['name'];
  /**
   * A small picture of a draft.
   * @default undefined — none
   */
  thumbnail?: DraftsSectionProps<D>['thumbnail'];
}

/** The documents a folder panel lists as saved in this browser. */
export interface EditorFolderSaved<D> {
  /** The site's store of them. */
  store: SavedDocuments<D>;
  /**
   * Open one in place of the document on screen.
   * @param document - The document.
   */
  onOpen: (document: SavedDocument<D>) => void;
  /**
   * A small picture of one.
   * @default undefined — none
   */
  thumbnail?: (document: SavedDocument<D>) => ReactNode;
}

/** The examples a folder panel lists. */
export interface EditorFolderExamples<E extends FolderExample> {
  /** The examples, in the order listed. */
  examples: readonly E[];
  /**
   * Open one in place of the document on screen.
   * @param example - The example.
   */
  onOpen: (example: E) => void;
  /**
   * Add one beside the document on screen, from its `+`.
   * @default undefined — no `+`
   */
  onAdd?: ExamplesSectionProps<E>['onAdd'];
  /**
   * What the `+` says.
   * @default the section's own
   */
  addLabel?: string;
  /**
   * What opening one says.
   * @default the section's own
   */
  openLabel?: string;
  /**
   * The coloured categories they are sorted into.
   * @default undefined — one list
   */
  categories?: ExamplesSectionProps<E>['categories'];
  /**
   * A small picture of one.
   * @default undefined — none
   */
  thumbnail?: ExamplesSectionProps<E>['thumbnail'];
}

/** What the sections are given: the panel's own props, and the folder's open. */
interface FolderPanelSectionsProps<D, E extends FolderExample> {
  saver: DocumentSaver<D>;
  notify: (text: string, intent?: 'success' | 'danger') => void;
  live: D;
  empty: boolean;
  file: DocumentFile<D> | null;
  drafts: EditorFolderDrafts<D>;
  saved: EditorFolderSaved<D>;
  examples?: EditorFolderExamples<E> | null;
  confirmOpen?: ConfirmOpen;
  placeLine?: boolean;
  extensions?: readonly string[];
  children?: ReactNode;
  onFolderFile: (file: File, handle: FileSystemFileHandle) => void;
}

/**
 * The sections of an editor's folder panel, in the family's order.
 * @param props - The panel's props and the open of a file of the folder.
 * @returns The sections.
 */
export function FolderPanelSections<D, E extends FolderExample>(
  props: FolderPanelSectionsProps<D, E>,
): ReactElement {
  const { saver, notify, live, empty, file, drafts, saved } = props;
  const { examples = null, confirmOpen, children, onFolderFile } = props;
  const { placeLine = !(empty && file === null) } = props;
  const extensions = props.extensions ?? formatExtensions(saver);
  return (
    <div className="folder-panel">
      {placeLine ? (
        <DocumentPlaceLine
          saver={saver}
          file={file}
          live={live}
          notify={notify}
        />
      ) : null}
      <DraftsSection
        store={drafts.store}
        session={drafts.session}
        available={drafts.available}
        version={drafts.version}
        currentId={drafts.currentId}
        live={live}
        file={file}
        name={drafts.name}
        thumbnail={drafts.thumbnail}
        notify={notify}
      />
      <FolderDocumentsSection
        folder={saver.folder}
        extensions={extensions}
        currentName={file?.handle ? file.name : null}
        onOpen={onFolderFile}
        confirmOpen={confirmOpen}
      />
      <SavedDocumentsSection
        store={saved.store}
        currentId={file?.savedId ?? null}
        onOpen={saved.onOpen}
        confirmOpen={confirmOpen}
        thumbnail={saved.thumbnail}
        saver={saver}
        notify={notify}
      />
      {examples === null ? null : (
        <ExamplesSection
          examples={examples.examples}
          onOpen={examples.onOpen}
          onAdd={examples.onAdd}
          addLabel={examples.addLabel}
          openLabel={examples.openLabel}
          categories={examples.categories}
          thumbnail={examples.thumbnail}
          confirmOpen={confirmOpen}
        />
      )}
      {children}
    </div>
  );
}

function formatExtensions<D>(saver: DocumentSaver<D>): string[] {
  const extensions: string[] = [];
  for (const format of saver.formats) extensions.push(format.extension);
  return extensions;
}
