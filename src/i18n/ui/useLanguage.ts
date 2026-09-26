import { useSyncExternalStore } from 'react';

import { useSiteLanguage } from '../../language/ui/siteLanguageContext.ts';
import type { Language } from '../core/languages.ts';
import { DEFAULT_LANGUAGE, isLanguage } from '../core/languages.ts';
import {
  messageSession,
  messagesVersion,
  subscribeToMessages,
} from '../core/session.ts';

/**
 * The language the page is written in.
 *
 * It is what the site declared with `SiteLanguage`, or what the address names
 * when the site declared nothing — the same value every link out of the page
 * carries, so the chrome is never written in a language the links deny.
 * @returns The language.
 */
export function useLanguage(): Language {
  const declared = useSiteLanguage();
  return declared !== undefined && isLanguage(declared)
    ? declared
    : DEFAULT_LANGUAGE;
}

/**
 * Redraw whenever the text of the page changes — a language finished loading,
 * a translator typed an edit, a session was set or dropped.
 * @returns The version the page was drawn at.
 */
export function useMessagesVersion(): number {
  return useSyncExternalStore(
    subscribeToMessages,
    messagesVersion,
    messagesVersion,
  );
}

/**
 * Whether a translator has the page open, in which case the language switch
 * says nothing about what is on show.
 * @returns True in translate mode.
 */
export function useIsTranslating(): boolean {
  useMessagesVersion();
  return messageSession() !== null;
}
