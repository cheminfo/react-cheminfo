import { Callout } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useCallback } from 'react';

import { buildLabel, buildStamp } from '../../build/core/buildInfo.ts';
import { useAsync } from '../../hooks/ui/useAsync.ts';
import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { Deployment } from '../core/probeDeployment.ts';
import { probeDeployment } from '../core/probeDeployment.ts';

import type { FramedTool } from './framedToolTypes.ts';

/** A framed tool that may be of no use to its host, and what to say then. */
export interface FramedToolNoticeProps {
  /** The tool, as `useFramedTool` gives it. */
  tool: Pick<FramedTool, 'status' | 'tool' | 'outcome'>;
  /** The address it is framed at, as `useFramedTool` was given it. */
  url: string;
  /**
   * The output this page takes from it: a tool that answers without listing
   * it is said to be deployed in a version that gives nothing back yet.
   * @default undefined — any tool that answers is of use
   */
  output?: string;
  /**
   * What the reader can do now, said after the reason, e.g. `Cancel goes back
   * to the document, which is as it was.`
   * @default undefined
   */
  next?: ReactNode;
  /**
   * The callout's class.
   * @default undefined
   */
  className?: string;
}

/**
 * Why a framed tool cannot be used, said so the reader knows what to wait
 * for: the site is unreachable, its page never answered because the version
 * deployed there is too old, it gives back nothing this page takes, or it
 * refused what it was handed. The server is asked which build it serves once
 * the tool falls silent or lacks the output, never before.
 * @param props - See {@link FramedToolNoticeProps}.
 * @returns The warning, or `null` while the tool can be used.
 */
export function FramedToolNotice(
  props: FramedToolNoticeProps,
): ReactElement | null {
  const { tool, url, output, next, className } = props;
  const t = useChromeT();
  const lacking =
    tool.status === 'connected' &&
    output !== undefined &&
    tool.tool !== null &&
    !tool.tool.outputs.some(({ key }) => key === output);
  const asking = tool.status === 'unavailable' || lacking;
  const probe = useCallback(
    async (signal: AbortSignal): Promise<Deployment | null> =>
      asking ? probeDeployment(url, signal) : null,
    [asking, url],
  );
  const probed = useAsync(probe);
  const deployment =
    probed.status === 'success' && !probed.pending ? probed.data : null;
  const host = new URL(url, globalThis.location.href).host;
  const text = noticeText({ t, host, tool, lacking, deployment });
  if (text === null) return null;
  return (
    <Callout compact intent="warning" className={className}>
      {text}
      {next === undefined ? null : <> {next}</>}
    </Callout>
  );
}

function noticeText(options: {
  t: Translate<ChromeKey>;
  host: string;
  tool: FramedToolNoticeProps['tool'];
  lacking: boolean;
  deployment: Deployment | null;
}): string | null {
  const { t, host, tool, lacking, deployment } = options;
  const build = deployment?.reachable === true ? deployment.build : undefined;
  const version = buildLabel(build);
  const values =
    build === undefined || version === undefined
      ? undefined
      : { host, version, built: buildStamp(build.builtAt) };
  if (tool.status === 'unavailable') {
    if (deployment === null) return t('host.didNotAnswer', { host });
    if (!deployment.reachable) return t('host.unreachable', { host });
    return values === undefined
      ? t('host.tooOld', { host })
      : t('host.tooOldBuild', values);
  }
  if (lacking) {
    return values === undefined
      ? t('host.givesNothing', { host })
      : t('host.givesNothingBuild', values);
  }
  if (tool.outcome?.status === 'refused') {
    return t('host.refused', { host, reason: tool.outcome.error.message });
  }
  return null;
}
