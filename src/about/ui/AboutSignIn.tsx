import type { ReactElement } from 'react';

import { isModifiedClick } from '../../chrome/ui/navItem.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';

export interface AboutSignInProps {
  /**
   * The address signing in happens at. Writing it keeps the entry a real link,
   * so a middle click opens a tab.
   * @default undefined
   */
  href?: string;
  /**
   * What the site does when the entry is picked — route to that page, or open
   * a credentials dialog for a site that has no page. A modified click is left
   * to the browser.
   * @default undefined
   */
  onSignIn?: () => void;
  /**
   * What the entry reads, for a site whose accounts are for one kind of person.
   * @default the chrome's own word for it, in the language of the page
   */
  label?: string;
}

/**
 * Where the people who run a site sign in: one quiet line under the build
 * badge, in the corner of the About.
 *
 * A visitor has nothing to sign in to, so the bar carries no invitation; the
 * About is the page the operators already know, and the corner is where they
 * already look for the build they run.
 * @param props - See {@link AboutSignInProps}.
 * @returns The entry.
 */
export function AboutSignIn(props: AboutSignInProps): ReactElement {
  const { href, onSignIn, label } = props;
  const t = useChromeT();
  const text = label ?? t('account.signIn');

  if (href === undefined) {
    return (
      <button type="button" className="about-sign-in" onClick={onSignIn}>
        {text}
      </button>
    );
  }

  return (
    <a
      className="about-sign-in"
      href={href}
      onClick={(event) => {
        if (onSignIn === undefined || isModifiedClick(event)) return;
        event.preventDefault();
        onSignIn();
      }}
    >
      {text}
    </a>
  );
}
