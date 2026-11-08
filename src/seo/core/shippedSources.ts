/**
 * Whether a build hands out the code it was built from.
 *
 * A site is published as its build, and the build is all a reader should get:
 * bundles that run, without the files, names and comments they were made from.
 * A source map gives every one of them back — its `sourcesContent` is the
 * original files, verbatim — to anybody who asks for the `.map` beside a
 * bundle, and an inline map rides inside the bundle itself. A source file
 * copied into the build does the same more plainly. None of it shows on a
 * page, so it is read off the build, file by file.
 */

/** What every report ends on, so the three read as one rule. */
const GIVES_AWAY = 'it hands every reader the code the site was built from.';

/** A source map, written beside the file it maps. */
const SOURCE_MAP = /\.map$/i;

/** TypeScript and JSX sources, which no other kind of file is named like. */
const SOURCE = /\.(?:tsx|jsx|cts)$/i;

/**
 * TypeScript sources, declarations included, whose names an MPEG transport
 * stream shares: a video segment is a `.ts`, and a camcorder's clip an `.mts`.
 */
const SOURCE_OR_STREAM = /\.m?ts$/i;

/** The files a bundler writes an inline map into. */
const BUNDLE = /\.(?:[cm]?js|css)$/i;

/**
 * A map written into the file it maps, the way a bundler writes it: on a line
 * of its own, after the code. Only `data:` carries the sources, so a comment
 * naming a map the build does not carry ships nothing.
 */
const INLINE_MAP = /^[\t ]*(?:\/\/|\/\*)[#@][\t ]*sourceMappingURL=data:/m;

/**
 * What a file of a build gives away of the code the site was built from: a
 * source map beside a bundle, a map inlined into one, or a source file.
 *
 * The build-time checker walks every file of a build through it. The name
 * decides most files, so `read` is called only for a bundle, which may carry
 * an inline map, and for a `.ts` or an `.mts`, which may be a video rather
 * than a source.
 * @param path - The file's path inside the build, with forward slashes.
 * @param read - Reads the file's text.
 * @returns One line naming the file and what it gives away, or `undefined`
 * when it gives nothing away.
 */
export function shippedSourceProblem(
  path: string,
  read: () => string,
): string | undefined {
  if (SOURCE_MAP.test(path)) return `${path}: a source map — ${GIVES_AWAY}`;
  if (SOURCE.test(path)) return `${path}: a source file — ${GIVES_AWAY}`;
  if (SOURCE_OR_STREAM.test(path)) {
    return isText(read())
      ? `${path}: a source file — ${GIVES_AWAY}`
      : undefined;
  }
  if (BUNDLE.test(path) && INLINE_MAP.test(read())) {
    return `${path}: an inline source map — ${GIVES_AWAY}`;
  }
  return undefined;
}

/**
 * Whether a file reads as text, which a source does and a transport stream
 * does not: every stream carries NUL bytes from its first packet on.
 * @param content - The file, decoded as UTF-8.
 * @returns True when it holds no NUL character.
 */
function isText(content: string): boolean {
  return !content.includes('\u0000');
}
