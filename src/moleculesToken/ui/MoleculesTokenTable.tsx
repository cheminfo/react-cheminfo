import type { Intent } from '@blueprintjs/core';
import { Button, Callout, HTMLTable, Tag } from '@blueprintjs/core';
import { useMemo } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import { useLanguage } from '../../i18n/ui/useLanguage.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type {
  MoleculesTokenCheck,
  MoleculesTokenVerdict,
} from '../core/moleculesToken.ts';
import { tokensToFix } from '../core/tokenFix.ts';

import { MoleculesTokenFix } from './MoleculesTokenFix.tsx';
import { tokenDetails } from './tokenDetails.tsx';

/** What {@link MoleculesTokenTable} shows. */
export interface MoleculesTokenTableProps {
  /** The last checks, or null before the first one was made. */
  checks: readonly MoleculesTokenCheck[] | null;
  /**
   * Whether a check was asked for and is not made yet.
   * @default false
   */
  pending?: boolean;
  /**
   * Asks for every token to be checked again. Left out, there is no button:
   * a page anyone can open shows the last checks and asks for none.
   * @default undefined
   */
  onCheckAgain?: () => void;
  /**
   * Why asking for a check failed.
   * @default undefined
   */
  error?: string;
  /**
   * Where molecules.cheminfo.org answers, whose Admin page issues tokens.
   * @default 'https://molecules.cheminfo.org'
   */
  moleculesUrl?: string;
}

const INTENT: Record<MoleculesTokenVerdict, Intent> = {
  ok: 'success',
  otherSource: 'danger',
  refused: 'danger',
  unset: 'warning',
  uncheckable: 'warning',
  unanswered: 'warning',
};

/** How each verdict reads in the table. */
const LABEL: Record<MoleculesTokenVerdict, ChromeKey> = {
  ok: 'moleculesToken.verdict.ok',
  otherSource: 'moleculesToken.verdict.otherSource',
  refused: 'moleculesToken.verdict.refused',
  unset: 'moleculesToken.verdict.unset',
  uncheckable: 'moleculesToken.verdict.uncheckable',
  unanswered: 'moleculesToken.verdict.unanswered',
};

/** The command a token is issued with, on molecules.cheminfo.org. */
const ISSUE_COMMAND = 'npm run tokens -- issue SOURCE EMAIL';

/**
 * The tokens a site holds for molecules.cheminfo.org, one row each, with what
 * molecules.cheminfo.org said of it when it was last checked: valid, another
 * source's, refused, not set. A token is changed in the server's `.env`, never
 * here, so the table says where, and above it how, when one has to be.
 * @param props - See {@link MoleculesTokenTableProps}.
 * @returns The table.
 */
export function MoleculesTokenTable(props: MoleculesTokenTableProps) {
  const { checks, pending = false, onCheckAgain, error, moleculesUrl } = props;
  const t = useChromeT();
  const language = useLanguage();
  const formats = useMemo(
    () => ({
      instant: new Intl.DateTimeFormat(language, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      sources: new Intl.ListFormat(language, { type: 'disjunction' }),
    }),
    [language],
  );
  const checkedAt =
    checks === null || checks.length === 0
      ? null
      : Math.min(...checks.map((check) => check.checkedAt));

  return (
    <section
      className="molecules-tokens"
      aria-label={t('moleculesToken.title')}
      data-testid="molecules-tokens"
    >
      <div className="molecules-tokens__head">
        <span className="molecules-tokens__title">
          {t('moleculesToken.title')}
        </span>
        {checkedAt !== null && (
          <span className="molecules-tokens__muted">
            {t('moleculesToken.checkedAt', {
              when: formats.instant.format(checkedAt),
            })}
          </span>
        )}
        {onCheckAgain !== undefined && (
          <Button
            size="small"
            variant="minimal"
            icon="refresh"
            loading={pending}
            text={t('moleculesToken.checkAgain')}
            onClick={onCheckAgain}
            data-testid="molecules-tokens-check"
          />
        )}
      </div>
      {error !== undefined && (
        <Callout compact intent="danger">
          {error}
        </Callout>
      )}
      {checks !== null && (
        <MoleculesTokenFix checks={checks} moleculesUrl={moleculesUrl} />
      )}
      {checks === null ? (
        <p className="molecules-tokens__muted">
          {t('moleculesToken.notChecked')}
        </p>
      ) : (
        <div className="molecules-tokens__scroll">
          <HTMLTable compact striped className="molecules-tokens__table">
            <thead>
              <tr>
                <th>{t('moleculesToken.column.variable')}</th>
                <th>{t('moleculesToken.column.source')}</th>
                <th>{t('moleculesToken.column.status')}</th>
                <th>{t('moleculesToken.column.details')}</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((check) => (
                <tr key={check.variable} data-verdict={check.verdict}>
                  <td>
                    <code>{check.variable}</code>
                  </td>
                  <td>
                    {check.sources.length === 0
                      ? t('moleculesToken.anySource')
                      : formats.sources.format(check.sources)}
                  </td>
                  <td>
                    <Tag minimal intent={INTENT[check.verdict]}>
                      {t(LABEL[check.verdict])}
                    </Tag>
                  </td>
                  <td>{tokenDetails(check, t, formats.instant)}</td>
                </tr>
              ))}
            </tbody>
          </HTMLTable>
        </div>
      )}
      {(checks === null || tokensToFix(checks).length === 0) && (
        <p className="molecules-tokens__muted">
          {t('moleculesToken.howToChange')} <code>{ISSUE_COMMAND}</code>
        </p>
      )}
    </section>
  );
}
