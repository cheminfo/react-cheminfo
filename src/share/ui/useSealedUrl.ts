import { useEffect, useState } from 'react';

import { sealShareUrl } from '../core/index.ts';

/** The link the dialog hands out, and whether it may be handed out yet. */
export interface SealedUrl {
  /** The link: sealed when asked and ready, else the share link itself. */
  link: string;
  /** False while the link is being sealed, when only the plain one exists. */
  ready: boolean;
}

/**
 * The link the dialog hands out: the share link itself, or its sealed form.
 * Sealing is asynchronous, so a sealed link is not ready at once, and a link
 * sealed for an older draft is never answered for the current one.
 * @param url - The share link.
 * @param sealed - Whether to hand out its sealed form.
 * @returns The link, and whether it is ready.
 */
export function useSealedUrl(url: string, sealed: boolean): SealedUrl {
  const [result, setResult] = useState<{ from: string; to: string } | null>(
    null,
  );

  useEffect(() => {
    if (!sealed) return;
    let current = true;
    void sealShareUrl(url).then((to) => {
      if (current) setResult({ from: url, to });
    });
    return () => {
      current = false;
    };
  }, [url, sealed]);

  if (!sealed) return { link: url, ready: true };
  if (result?.from === url) return { link: result.to, ready: true };
  return { link: url, ready: false };
}
