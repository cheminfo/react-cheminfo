import { Button, ButtonGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import { downloadBlob } from '../../download/core/downloadBlob.ts';
import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import { errorMessage } from '../../error/core/toError.ts';
import { formatInteger } from '../../format/core/numbers.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type {
  MoleculeFile,
  MoleculeFileFormat,
  MoleculeFileRow,
} from '../core/moleculeFileTypes.ts';
import { MOLECULE_FILE_LIMIT } from '../core/moleculeFileTypes.ts';

/** What {@link MoleculeExport} saves. */
export interface MoleculeExportProps {
  /**
   * The molecules, a page at a time. Called when somebody asks for a file, and
   * stopped once the limit is reached.
   */
  read: (signal: AbortSignal) => AsyncIterable<readonly MoleculeFileRow[]>;
  /** What the file is called, without its extension. */
  fileName: string;
  /**
   * How many molecules match, when that is known.
   * @default undefined — the control says only how many it would save at most
   */
  total?: number;
  /**
   * The most molecules a file holds.
   * @default MOLECULE_FILE_LIMIT
   */
  limit?: number;
  /**
   * Told of a file once it has been handed to the browser.
   * @default undefined
   */
  onSaved?: (file: MoleculeFile) => void;
}

/**
 * Save the molecules a search matches, not only the page on show, as an SDF or
 * as a text file with their SMILES, saying how far it has got and offering to
 * stop. The structures are written in the visitor's browser, so a site's
 * server does no more than answer its usual pages.
 * @param props - See {@link MoleculeExportProps}.
 * @returns The control.
 */
export function MoleculeExport(props: MoleculeExportProps): ReactElement {
  const { read, fileName, total, limit = MOLECULE_FILE_LIMIT, onSaved } = props;
  const t = useChromeT();
  const [done, setDone] = useState<number | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const running = useRef<AbortController | null>(null);
  const goal = Math.min(total ?? limit, limit);

  useEffect(
    () => () => {
      running.current?.abort();
    },
    [],
  );

  async function save(format: MoleculeFileFormat): Promise<void> {
    const controller = new AbortController();
    running.current = controller;
    setDone(0);
    setProblem(null);
    try {
      const { writeMoleculeFile } = await import('../core/moleculeFile.ts');
      const file = await writeMoleculeFile(read(controller.signal), {
        format,
        limit,
        total: goal,
        signal: controller.signal,
        onProgress: setDone,
      });
      if (file.rows === 0) {
        setProblem(t('moleculeFile.nothing'));
        return;
      }
      downloadBlob(file.blob, `${sanitizeFileName(fileName)}.${format}`);
      if (file.skipped > 0) {
        setProblem(
          t(
            file.skipped === 1
              ? 'moleculeFile.skippedOne'
              : 'moleculeFile.skippedMany',
            { count: formatInteger(file.skipped) },
          ),
        );
      }
      onSaved?.(file);
    } catch (error: unknown) {
      if (!controller.signal.aborted) {
        setProblem(t('moleculeFile.failed', { reason: errorMessage(error) }));
      }
    } finally {
      running.current = null;
      setDone(null);
    }
  }

  return (
    <span className="molecule-export no-print" data-testid="molecule-export">
      {done === null ? (
        <>
          <span className="molecule-export__note">
            {total !== undefined && total <= limit
              ? t('moleculeFile.export')
              : t('moleculeFile.exportUpTo', { limit: formatInteger(limit) })}
          </span>
          <ButtonGroup>
            <Button
              size="small"
              icon="download"
              text="SDF"
              title={t('moleculeFile.sdf')}
              disabled={total === 0}
              onClick={() => void save('sdf')}
            />
            <Button
              size="small"
              icon="download"
              text="TXT"
              title={t('moleculeFile.txt')}
              disabled={total === 0}
              onClick={() => void save('txt')}
            />
          </ButtonGroup>
        </>
      ) : (
        <>
          <span className="molecule-export__note">
            {t('moleculeFile.progress', {
              done: formatInteger(done),
              total: formatInteger(goal),
            })}
          </span>
          <Button
            size="small"
            variant="minimal"
            icon="cross"
            text={t('moleculeFile.cancel')}
            onClick={() => running.current?.abort()}
          />
        </>
      )}
      {problem !== null && (
        <span className="molecule-export__problem" role="alert">
          {problem}
        </span>
      )}
    </span>
  );
}
