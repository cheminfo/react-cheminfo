import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { siteDisplayName } from '../../ecosystem/core/lookup.ts';
import { siteUrl } from '../../ecosystem/core/sites.ts';
import { SiteMark } from '../../ecosystem/ui/marks.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { HeaderButtonProps } from '../../shared/ui/MenuButton.tsx';
import { MenuButton } from '../../shared/ui/MenuButton.tsx';
import type { HostItem } from '../core/protocol.ts';
import type { SendOffer, SendTarget } from '../core/sendTargets.ts';
import { sendTargets } from '../core/sendTargets.ts';

import { openTool } from './openTool.ts';

/** Something the page could send, and how it is built once a site is picked. */
export interface SendItemOffer extends SendOffer {
  /** Build the item; the site's tab is already open and loading meanwhile. */
  make: () => HostItem | Promise<HostItem>;
}

/** What {@link SendToButton} needs. */
export interface SendToButtonProps extends HeaderButtonProps {
  /** What the page could send now, in its own order of preference. */
  offers: readonly SendItemOffer[];
  /** The site sending: how it introduces itself, and never a target. */
  siteId: string;
  /**
   * Where a site is opened instead of its own host, by site id — a checkout
   * running locally, e.g. `{ ml: 'http://localhost:11112' }`.
   * @default {}
   */
  addresses?: Readonly<Record<string, string>>;
  /**
   * Told, in one sentence, why something could not be sent.
   * @default undefined — nobody is told
   */
  onError?: (message: string) => void;
}

const DOES_STYLE: CSSProperties = { fontSize: '0.85em', opacity: 0.75 };

/**
 * The Send entry of a site header: the sites of the family that can take what
 * the page shows, each opened in a new tab and handed it through the host
 * protocol. Which sites are listed is worked out from the kinds alone, before
 * anything is built; the data is built once a site is picked, while its tab
 * loads.
 * @param props - See {@link SendToButtonProps}.
 * @returns The button and its menu.
 */
export function SendToButton(props: SendToButtonProps): ReactElement {
  const { offers, siteId, addresses = {}, onError, ...rest } = props;
  const t = useChromeT();
  const targets = sendTargets(offers, siteId);

  function send(target: SendTarget<SendItemOffer>): void {
    const base = addresses[target.site.id] ?? siteUrl(target.site);
    const url = new URL(target.receiver.page ?? '/', base).href;
    const document = `${siteId}:send:${crypto.randomUUID()}`;
    const opened = openTool({
      url,
      host: siteId,
      document: async () => ({
        document,
        items: [await target.offer.make()],
      }),
      ...(onError === undefined ? {} : { onError }),
    });
    if (!opened) onError?.(t('send.blocked'));
  }

  return (
    <MenuButton
      {...rest}
      className="send-to-button"
      icon="send-to"
      label={t('send.label')}
      menu={<SendMenu targets={targets} onSend={send} none={t('send.none')} />}
    />
  );
}

interface SendMenuProps {
  targets: ReadonlyArray<SendTarget<SendItemOffer>>;
  onSend: (target: SendTarget<SendItemOffer>) => void;
  none: string;
}

function SendMenu(props: SendMenuProps): ReactElement {
  const { targets, onSend, none } = props;
  const t = useChromeT();
  if (targets.length === 0) {
    return (
      <Menu>
        <MenuItem disabled text={none} />
      </Menu>
    );
  }
  const offers: SendItemOffer[] = [];
  for (const target of targets) {
    if (!offers.includes(target.offer)) offers.push(target.offer);
  }
  return (
    <Menu>
      {offers.map((offer) => (
        <SendGroup
          key={offer.kind}
          title={t('send.heading', { what: offer.label })}
          targets={targets.filter((target) => target.offer === offer)}
          onSend={onSend}
        />
      ))}
    </Menu>
  );
}

interface SendGroupProps {
  title: string;
  targets: ReadonlyArray<SendTarget<SendItemOffer>>;
  onSend: (target: SendTarget<SendItemOffer>) => void;
}

function SendGroup(props: SendGroupProps): ReactElement {
  const { title, targets, onSend } = props;
  return (
    <>
      <MenuDivider title={title} />
      {targets.map((target) => (
        <MenuItem
          key={`${target.site.id}:${target.receiver.page ?? '/'}`}
          icon={<SiteMark site={target.site} size={24} />}
          multiline
          text={
            <>
              <div>{siteDisplayName(target.site)}</div>
              <div style={DOES_STYLE}>{target.receiver.does}</div>
            </>
          }
          onClick={() => {
            onSend(target);
          }}
        />
      ))}
    </>
  );
}
