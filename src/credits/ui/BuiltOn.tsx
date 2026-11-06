import type { CSSProperties, ReactElement } from 'react';

import type { BuildInfo } from '../../build/core/buildInfo.ts';
import type { BundledPackage } from '../../build/core/bundledPackages.ts';
import {
  BUNDLED_PACKAGES_FILE,
  LICENSE_TEXTS_FILE,
  readBundledPackages,
} from '../../build/core/bundledPackages.ts';
import { useAsync } from '../../hooks/ui/useAsync.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import {
  joinBasePath,
  normalizeBasePath,
  readMountPath,
} from '../../router/core/basePath.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { BuiltOnPackage } from '../core/builtOn.ts';
import { builtOnGroups } from '../core/builtOn.ts';
import type { CreditEntry } from '../core/credits.ts';

import { CreditsList } from './CreditsList.tsx';

/** What the Built on section draws. */
export interface BuiltOnProps {
  /** The works the site credits by name, in its order. */
  entries: readonly CreditEntry[];
  /**
   * What the build published about itself. A page with none was not built by
   * the plugin that writes the package list, and asks for no list.
   * @default undefined
   */
  build?: BuildInfo;
}

/**
 * The Built on section of an About page: what the family maintains, in full,
 * then everything else the build bundled, folded away.
 *
 * Without a package list — a dev server, a failed request — the works the site
 * credits by name are still split and drawn.
 * @param props - See {@link BuiltOnProps}.
 * @returns The section's contents.
 */
export function BuiltOn(props: BuiltOnProps): ReactElement {
  const { entries, build } = props;
  const t = useChromeT();
  const { data: bundled } = useAsync(
    build === undefined ? asksForNoPackages : fetchPackages,
  );
  const { own, others } = builtOnGroups(entries, bundled ?? NO_PACKAGES);
  const ownCount = own.works.length + own.packages.length;
  const othersCount = others.works.length + others.packages.length;

  return (
    <>
      {ownCount === 0 ? null : (
        <>
          <h3 style={GROUP_TITLE_STYLE}>
            {t('about.builtOn.own', { count: ownCount })}
          </h3>
          <CreditsList entries={own.works} />
          <PackageList packages={own.packages} />
        </>
      )}
      {othersCount === 0 ? null : (
        <details
          className="no-print"
          open={ownCount === 0}
          style={OTHERS_STYLE}
        >
          <summary style={SUMMARY_STYLE}>{t('about.builtOn.others')}</summary>
          <div style={OTHERS_BODY_STYLE}>
            <CreditsList entries={others.works} />
            <PackageList packages={others.packages} />
          </div>
        </details>
      )}
      {bundled === undefined ? null : (
        <p className="no-print" style={LICENSE_TEXTS_STYLE}>
          <a
            href={addressOf(LICENSE_TEXTS_FILE)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('about.builtOn.licenseTexts')}
          </a>
        </p>
      )}
    </>
  );
}

function PackageList(props: {
  packages: readonly BuiltOnPackage[];
}): ReactElement | null {
  const { packages } = props;
  if (packages.length === 0) return null;

  return (
    <ul style={PACKAGES_STYLE}>
      {packages.map(({ name, href, versions, license }) => (
        <li key={name}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={PACKAGE_NAME_STYLE}
          >
            {name}
          </a>{' '}
          <span style={PACKAGE_NOTE_STYLE}>
            {license === undefined ? versions : `${versions} · ${license}`}
          </span>
        </li>
      ))}
    </ul>
  );
}

const NO_PACKAGES: readonly BundledPackage[] = [];

async function asksForNoPackages(): Promise<undefined> {
  return undefined;
}

async function fetchPackages(
  signal: AbortSignal,
): Promise<BundledPackage[] | undefined> {
  const response = await fetch(addressOf(BUNDLED_PACKAGES_FILE), { signal });
  return response.ok ? readBundledPackages(await response.json()) : undefined;
}

function addressOf(file: string): string {
  return joinBasePath(normalizeBasePath(readMountPath()), `/${file}`);
}

const GROUP_TITLE_STYLE = {
  margin: '0 0 6px',
  fontSize: 13,
  fontWeight: 600,
} as const satisfies CSSProperties;

const OTHERS_STYLE = { marginTop: 10 } as const satisfies CSSProperties;

const OTHERS_BODY_STYLE = { marginTop: 6 } as const satisfies CSSProperties;

const SUMMARY_STYLE = {
  color: TOKEN.textMuted,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
} as const satisfies CSSProperties;

const PACKAGES_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  margin: '8px 0 0',
  padding: 0,
  fontSize: 13,
  gap: '2px 16px',
  lineHeight: 1.4,
  listStyle: 'none',
} as const satisfies CSSProperties;

const PACKAGE_NAME_STYLE = { fontWeight: 600 } as const satisfies CSSProperties;

const PACKAGE_NOTE_STYLE = {
  color: TOKEN.textMuted,
  fontSize: 11,
} as const satisfies CSSProperties;

const LICENSE_TEXTS_STYLE = {
  margin: '10px 0 0',
  fontSize: 12,
} as const satisfies CSSProperties;
