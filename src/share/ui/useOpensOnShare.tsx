import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

import type {
  OpensOnChoice,
  OpensOnLinks,
  ShareAddress,
  ShareExample,
  ShareOnScreen,
} from '../core/opensOn.ts';
import {
  EXAMPLE_PARAM,
  defaultOpensOn,
  opensOnAddress,
  opensOnLinks,
} from '../core/opensOn.ts';

import { ShareOpensOn } from './ShareOpensOn.tsx';

/** What {@link useOpensOnShare} is told of the page. */
export interface OpensOnShareOptions {
  /**
   * Whether the page holding the document is the page on show. Any other page
   * hands out its own address.
   */
  active: boolean;
  /** The examples a link can open on, in the order the folder lists them. */
  examples: readonly ShareExample[];
  /**
   * What is on screen, read as the dialog opens. A promise when writing it
   * into a link takes a moment: the dialog then opens once it is written.
   */
  onScreen: () => ShareOnScreen | Promise<ShareOnScreen>;
  /**
   * The parameters naming what a page opens on, besides `example`, which a
   * link replaces: the one carrying a document, say.
   * @default [] — `example` alone
   */
  openedOn?: readonly string[];
  /**
   * The link to an example.
   * @default `?example=<id>` on the page on screen
   */
  exampleAddress?: (id: string) => ShareAddress;
  /**
   * The link to the page alone.
   * @default the page on screen, with nothing added
   */
  aloneAddress?: ShareAddress;
  /**
   * What the site calls what is on screen: "This circuit", "This drawing".
   * @default the chrome's own words
   */
  screenLabel?: string;
  /**
   * What a site adds under the choice: the style a link sets, say.
   * @default undefined — nothing
   */
  children?: ReactNode;
}

/** What the header's Share control is told, beyond what every page shares. */
export interface OpensOnShareProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog opens or closes. */
  onOpenChange: (open: boolean) => void;
  /** The query string the link is built from. */
  search: string | undefined;
  /** The page the link opens, when it is not the page on screen. */
  baseUrl: string | undefined;
  /** The section saying what the link opens on. */
  children: ReactNode;
}

/**
 * The Share dialog of a page holding a document says what the link opens on:
 * what is on screen, any of the examples the site comes with, or the page
 * alone. Spread it into the header's `share` prop.
 * @param options - See {@link OpensOnShareOptions}.
 * @returns What the header's Share control is told.
 */
export function useOpensOnShare(
  options: OpensOnShareOptions,
): OpensOnShareProps {
  const {
    active,
    examples,
    onScreen,
    exampleAddress,
    aloneAddress,
    screenLabel,
    children,
  } = options;
  const openedOn = [EXAMPLE_PARAM, ...(options.openedOn ?? [])];
  const [shared, setShared] = useState<OpensOnLinks | string | null>(null);
  const [choice, setChoice] = useState<OpensOnChoice | null>(null);
  // A dialog closed before what is on screen was written stays closed.
  const asked = useRef(0);

  function onOpenChange(open: boolean): void {
    const request = ++asked.current;
    if (!open) {
      setShared(null);
      return;
    }
    const { search } = globalThis.location;
    if (!active) {
      setShared(search);
      return;
    }
    const show = (screen: ShareOnScreen) => {
      if (request !== asked.current) return;
      const links = opensOnLinks(search, openedOn, screen);
      setChoice(defaultOpensOn(links, examples));
      setShared(links);
    };
    const read = onScreen();
    if (read instanceof Promise) void read.then(show);
    else show(read);
  }

  const links = typeof shared === 'string' ? null : shared;
  const address =
    links === null || choice === null
      ? undefined
      : opensOnAddress(links, choice, {
          example: exampleAddress,
          alone: aloneAddress,
        });
  return {
    open: shared !== null,
    onOpenChange,
    search: typeof shared === 'string' ? shared : address?.search,
    baseUrl:
      address?.path === undefined
        ? undefined
        : new URL(address.path, globalThis.location.href).href,
    children:
      links === null || choice === null ? undefined : (
        <ShareOpensOn
          links={links}
          choice={choice}
          onChange={setChoice}
          examples={examples}
          screenLabel={screenLabel}
        >
          {children}
        </ShareOpensOn>
      ),
  };
}
