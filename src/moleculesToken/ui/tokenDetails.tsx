import type { ReactNode } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import type { MoleculesTokenCheck } from '../core/moleculesToken.ts';

/**
 * What a row says besides its verdict.
 * @param check - The check.
 * @param t - The chrome's translator.
 * @param instant - How an instant is written.
 * @returns The cell's content.
 */
export function tokenDetails(
  check: MoleculesTokenCheck,
  t: Translate<ChromeKey>,
  instant: Intl.DateTimeFormat,
): ReactNode {
  const hint: Fact | null =
    check.hint === null
      ? null
      : ['hint', <code key="hint">{check.hint}…</code>];
  switch (check.verdict) {
    case 'ok':
      return facts([
        check.sources.length === 1 || check.source === null
          ? null
          : ['source', t('moleculesToken.forSource', { source: check.source })],
        check.issuedAt === null
          ? null
          : [
              'issued',
              check.email === null
                ? t('moleculesToken.issued', {
                    when: instant.format(check.issuedAt),
                  })
                : t('moleculesToken.issuedTo', {
                    email: check.email,
                    when: instant.format(check.issuedAt),
                  }),
            ],
        [
          'used',
          check.lastUsedAt === null
            ? t('moleculesToken.neverUsed')
            : t('moleculesToken.lastUsed', {
                when: instant.format(check.lastUsedAt),
              }),
        ],
        hint,
      ]);
    case 'otherSource':
      return facts([
        [
          'source',
          t('moleculesToken.otherSourceDetail', {
            source: check.source ?? '',
          }),
        ],
        hint,
      ]);
    case 'refused':
      return check.message ?? t('moleculesToken.refusedDetail');
    case 'unset':
      return t('moleculesToken.unsetDetail', { variable: check.variable });
    case 'uncheckable':
      return t('moleculesToken.uncheckableDetail');
    case 'unanswered':
      return check.message;
    default:
      return null;
  }
}

/** One fact about a token, and the key it is drawn under. */
type Fact = readonly [key: string, content: ReactNode];

/**
 * Facts about a token, one after the other.
 * @param parts - The facts; null ones are left out.
 * @returns The facts, separated by a middle dot.
 */
function facts(parts: ReadonlyArray<Fact | null>): ReactNode {
  const shown = parts.filter((part) => part !== null);
  return shown.map(([key, content], index) => (
    <span key={key}>
      {index > 0 && ' · '}
      {content}
    </span>
  ));
}
