import type { ReactElement } from 'react';

import { NavLink } from '../../chrome/ui/NavLink.tsx';
import { useLanguage } from '../../i18n/ui/useLanguage.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { contactFormUrl, contactUrl } from '../core/contactUrl.ts';

/** What the Contact entry of a header needs. */
export interface ContactButtonProps {
  /** The site the reader writes about, written into the form. */
  siteId: string;
  /**
   * Address of the form, with `{site}` and `{page}` where they are written.
   * @default the family's form in the language of the page (`CONTACT_FORM_URLS`)
   */
  formUrl?: string;
  /**
   * The page the reader is on, written into the form.
   * @default the address of the current page
   */
  page?: string;
  /**
   * What the entry reads. In a compact bar it is not written, but it stays what
   * the pointer and a screen reader are told.
   * @default the chrome's own word for it, in the language of the page
   */
  label?: string;
  /**
   * What the pointer is told.
   * @default the chrome's own sentence, in the language of the page
   */
  title?: string;
  /**
   * Class names added after the component's own.
   * @default undefined
   */
  className?: string;
}

/**
 * The Contact entry of a site header: it opens the family's contact form in a new tab,
 * with the site and the page already filled in, so the reader only writes the message.
 * The form is opened, never embedded, so nothing is loaded from it before the click.
 * @param props - The site, and the form it opens.
 * @returns The entry, or nothing while no form address is set.
 */
export function ContactButton(props: ContactButtonProps): ReactElement | null {
  const {
    siteId,
    page = globalThis.location?.href ?? '',
    label,
    title,
    className,
  } = props;
  const t = useChromeT();
  const language = useLanguage();
  const formUrl = props.formUrl ?? contactFormUrl(language);

  if (formUrl === '') return null;

  return (
    <NavLink
      item={{
        id: 'contact',
        label: label ?? t('chrome.contact'),
        icon: 'chat',
        href: contactUrl(formUrl, { site: siteId, page }),
        external: true,
        title: title ?? t('chrome.contactTitle'),
      }}
      className={className}
    />
  );
}
