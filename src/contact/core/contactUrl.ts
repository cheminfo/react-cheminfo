import type { Language } from '../../i18n/core/languages.ts';

/**
 * Address of the contact form every site of the family opens, one per language the form
 * is written in, with `{site}` and `{page}` where the site and the page are written.
 * Empty while no form exists, which keeps the Contact entry out of the header.
 */
export const CONTACT_FORM_URLS: Readonly<Partial<Record<Language, string>>> =
  {};

/** What a contact address is filled with. */
export interface ContactUrlOptions {
  /** The site the message is about, written as its id. */
  site: string;
  /**
   * The address of the page the reader was on.
   * @default ''
   */
  page?: string;
}

/**
 * The contact form in the language of the page, or the English one when the form is not
 * written in that language.
 * @param language - The language of the page.
 * @param urls - The forms, by language.
 * @returns The address of the form, or an empty string when there is none.
 */
export function contactFormUrl(
  language: Language,
  urls: Readonly<Partial<Record<Language, string>>> = CONTACT_FORM_URLS,
): string {
  return urls[language] ?? urls.en ?? '';
}

/**
 * Fill the address of a contact form with the site and the page, both encoded, so the
 * form opens knowing what the message is about.
 * @param template - Address holding `{site}` and `{page}`.
 * @param options - The site and the page.
 * @returns The address to open.
 */
export function contactUrl(
  template: string,
  options: ContactUrlOptions,
): string {
  const { site, page = '' } = options;
  return template
    .replaceAll('{site}', encodeURIComponent(site))
    .replaceAll('{page}', encodeURIComponent(page));
}
