/**
 * Handing a file to another app — a chat, a mail, a drive — through the share
 * sheet of the device, which is how a phone sends anything anywhere.
 *
 * A browser opens the sheet only for a press that is still fresh. Chrome and
 * current Safari keep a press fresh for a few seconds; an older Safari only
 * for as long as the press itself is being handled. So a file that takes a
 * while to write may come back `expired`, and the caller keeps it: the next
 * press hands it over at once, before anything is awaited.
 */

/** What became of a file handed to the share sheet. */
export type ShareOutcome =
  /** An app took it. */
  | 'sent'
  /** The reader closed the sheet without picking one. */
  | 'cancelled'
  /** The press was no longer fresh when the sheet was asked for. */
  | 'expired'
  /** This browser, or this page, cannot share a file of that kind. */
  | 'unsupported';

/**
 * Whether the share sheet takes a file of that name and type here. It is
 * false in a browser with no share sheet, for a type it refuses, and in a
 * frame its host did not allow to share.
 * @param name - The file's name, extension included: Chrome checks it.
 * @param type - Its media type.
 * @returns Whether {@link shareFile} can hand such a file on.
 */
export function canShareFile(name: string, type: string): boolean {
  return canShare(new File([], name, { type: bareType(type) }));
}

/**
 * Open the share sheet on a file. Call it from the press itself, or with a
 * file already written: the sheet is asked for before anything is awaited.
 * @param file - The file.
 * @returns What became of it.
 * @throws {Error} Whatever else the browser refused it for.
 */
export async function shareFile(file: File): Promise<ShareOutcome> {
  // Chrome checks the media type as written, and refuses one that carries a
  // parameter, `image/svg+xml;charset=utf-8`, as a type it does not know.
  const shared =
    bareType(file.type) === file.type
      ? file
      : new File([file], file.name, { type: bareType(file.type) });
  if (!canShare(shared)) return 'unsupported';
  try {
    await navigator.share({ files: [shared] });
    return 'sent';
  } catch (error) {
    if (isDomError(error, 'AbortError')) return 'cancelled';
    if (isDomError(error, 'NotAllowedError')) return 'expired';
    throw error;
  }
}

function canShare(file: File): boolean {
  const browser = globalThis.navigator as Partial<Navigator> | undefined;
  if (
    typeof browser?.share !== 'function' ||
    typeof browser.canShare !== 'function'
  ) {
    return false;
  }
  try {
    return browser.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function bareType(type: string): string {
  return type.split(';', 1)[0]?.trim() ?? '';
}

function isDomError(error: unknown, name: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === name
  );
}
