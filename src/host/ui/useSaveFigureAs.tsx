import { Alert } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { SaveDocumentDialog } from '../../document/ui/SaveDocumentDialog.tsx';
import type {
  DocumentFormat,
  SaveDocumentChoice,
} from '../../document/ui/saveDocumentTypes.ts';
import { downloadBlob } from '../../download/core/downloadBlob.ts';
import {
  siteFigureExtension,
  siteFigureName,
} from '../../download/core/figureFileName.ts';
import { FIGURE_SVG_TYPE } from '../../download/core/figureSvg.ts';
import { errorMessage } from '../../error/core/toError.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import {
  siteDocumentExtension,
  siteDocumentName,
  writeSiteDocument,
} from '../../storage/core/siteDocument.ts';

/** What {@link useSaveFigureAs} saves. */
export interface SaveFigureAsOptions {
  /** The site, as the family names it and its figures name it, e.g. `3d`. */
  site: string;
  /**
   * The site's figure, carrying the state it opens again from.
   * @returns The SVG, or `undefined` while there is nothing to save.
   */
  figure: () => Promise<string | undefined>;
  /**
   * The name the dialog offers, without its extension.
   * @returns E.g. `ethanol-conformer-1`.
   */
  stem: () => string;
  /**
   * The preferences a document keeps as its workspace, keyed as the site's
   * bucket keeps them.
   * @default undefined — the document holds the figure alone
   */
  workspace?: () => Record<string, unknown>;
  /**
   * The build that writes the document, e.g. `3d.cheminfo.org 1.4.0`.
   * @default undefined
   */
  generator?: string;
}

/** What {@link useSaveFigureAs} gives a site. */
export interface SaveFigureAs {
  /** Ask how to save the figure: Shift+Ctrl+S, or a Save as button. */
  open: () => void;
  /** The dialog, and the alert saying why a save failed. */
  dialog: ReactElement;
}

/**
 * Save as, the same way on every site of the family: the site's own SVG,
 * which opens here again and anywhere as a picture, is offered first; the
 * site's document, `.<site>.zip`, holds the same figure and the workspace
 * beside it.
 * @param options - See {@link SaveFigureAsOptions}.
 * @returns The opener, and the dialog to render beside it.
 */
export function useSaveFigureAs(options: SaveFigureAsOptions): SaveFigureAs {
  const { site, figure, stem, workspace, generator } = options;
  const t = useChromeT();
  const [initial, setInitial] = useState<SaveDocumentChoice | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const formats: readonly [DocumentFormat, ...DocumentFormat[]] = [
    {
      id: 'svg',
      label: t('figure.saveSvg'),
      extension: siteFigureExtension(site),
      holdsParts: false,
    },
    {
      id: 'document',
      label: t('figure.saveDocument'),
      extension: siteDocumentExtension(site),
      holdsParts: true,
    },
  ];

  async function save(choice: SaveDocumentChoice): Promise<void> {
    const svg = await figure();
    if (svg === undefined) return;
    const figureName = siteFigureName(choice.name, site);
    if (choice.format === 'svg') {
      downloadBlob(new Blob([svg], { type: FIGURE_SVG_TYPE }), figureName);
      return;
    }
    const kept =
      choice.workspace && workspace
        ? {
            preferences: {
              id: crypto.randomUUID(),
              name: choice.name,
              preferences: workspace(),
            },
          }
        : {};
    const document = await writeSiteDocument(
      { data: [{ path: figureName, content: svg }], ...kept },
      { site, ...(generator ? { generator } : {}) },
    );
    downloadBlob(document, siteDocumentName(choice.name, site));
  }

  const dialog = (
    <>
      <SaveDocumentDialog
        isOpen={initial !== null}
        onClose={() => setInitial(null)}
        formats={formats}
        initial={
          initial ?? { name: '', format: 'svg', view: false, workspace: true }
        }
        parts={{ view: false, workspace: workspace !== undefined }}
        onSave={(choice) => {
          setInitial(null);
          save(choice).catch((error: unknown) => {
            setFailure(errorMessage(error));
          });
        }}
      />
      <Alert
        isOpen={failure !== null}
        icon="error"
        intent="danger"
        canEscapeKeyCancel
        canOutsideClickCancel
        confirmButtonText={t('figure.close')}
        onClose={() => setFailure(null)}
      >
        {failure}
      </Alert>
    </>
  );
  return {
    open: () =>
      setInitial({
        name: stem(),
        format: 'svg',
        view: false,
        workspace: true,
      }),
    dialog,
  };
}
