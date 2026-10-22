import { Callout } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { CodeBlock } from '../../clipboard/ui/CodeBlock.tsx';
import { useLanguage } from '../../i18n/ui/useLanguage.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { trimTrailingSlash } from '../../router/core/address.ts';
import type { MoleculesTokenCheck } from '../core/moleculesToken.ts';
import { issueTokenCommand, tokensToFix } from '../core/tokenFix.ts';

/** Where molecules.cheminfo.org answers when the site names no other. */
const DEFAULT_MOLECULES_URL = 'https://molecules.cheminfo.org';

/** What {@link MoleculesTokenFix} shows. */
export interface MoleculesTokenFixProps {
  /** The last checks. */
  checks: readonly MoleculesTokenCheck[];
  /**
   * Where molecules.cheminfo.org answers, whose Admin page issues tokens.
   * @default 'https://molecules.cheminfo.org'
   */
  moleculesUrl?: string;
}

/**
 * What to do about the tokens that have to be replaced — none set, refused, or
 * issued for another source — in the three steps it takes: issue one on
 * molecules.cheminfo.org, write it in the server's `.env`, restart. Nothing
 * when every token is fine.
 * @param props - See {@link MoleculesTokenFixProps}.
 * @returns The steps, or null.
 */
export function MoleculesTokenFix(
  props: MoleculesTokenFixProps,
): ReactElement | null {
  const { checks, moleculesUrl = DEFAULT_MOLECULES_URL } = props;
  const t = useChromeT();
  const language = useLanguage();
  const toFix = tokensToFix(checks);
  if (toFix.length === 0) return null;

  const one = toFix.length === 1;
  const variables = new Intl.ListFormat(language, {
    type: 'conjunction',
  }).format(toFix.map((check) => check.variable));
  const admin = `${trimTrailingSlash(moleculesUrl)}/admin`;
  const unsetOnly = toFix.every((check) => check.verdict === 'unset');

  return (
    <Callout
      intent={unsetOnly ? 'warning' : 'danger'}
      icon="key"
      title={t('moleculesToken.fix.title', { variables })}
      className="molecules-tokens__fix"
      data-testid="molecules-tokens-fix"
    >
      <ol>
        <li>
          <p>
            {t(
              one
                ? 'moleculesToken.fix.issueOne'
                : 'moleculesToken.fix.issueMany',
            )}{' '}
            <a href={admin} target="_blank" rel="noreferrer">
              {admin}
            </a>
          </p>
          <p>{t('moleculesToken.fix.issueOnServer')}</p>
          <CodeBlock
            tone="muted"
            copyable
            code={[...new Set(toFix.map(issueTokenCommand))].join('\n')}
          />
        </li>
        <li>
          <p>
            {t(
              one ? 'moleculesToken.fix.envOne' : 'moleculesToken.fix.envMany',
            )}
          </p>
          <CodeBlock
            tone="muted"
            copyable
            code={toFix.map((check) => `${check.variable}=mct_…`).join('\n')}
          />
        </li>
        <li>
          <p>{t('moleculesToken.fix.restart')}</p>
          <CodeBlock tone="muted" copyable code="docker compose up -d" />
        </li>
      </ol>
    </Callout>
  );
}
