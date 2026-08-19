/**
 * The links a slide hands over to the live tool.
 *
 * A demo link is a paragraph that is exactly one Markdown link to an in-app
 * route. It is parsed by hand rather than by a Markdown library because the
 * labels are chemistry — `[M+H]⁺` opens a bracket the label closes itself, and
 * a formula such as `H(OCH2CH2)10` puts parentheses inside the URL — and both
 * defeat a naive `\[(.*)\]\((.*)\)` pattern.
 */

/** One link a slide offers as a live demo. */
export interface DemoLinkSpec {
  /** The link text, which may itself contain balanced brackets. */
  label: string;
  /** Where it goes; a demo link always targets an in-app route. */
  href: string;
}

/**
 * Read a paragraph that is exactly one Markdown link `[label](url)` and nothing
 * else, counting brackets so a label may hold its own pair, and accepting the
 * angle-bracketed URL form `[label](<url>)` for a URL holding parentheses.
 * @param text - The paragraph text.
 * @returns The link, or `null` when the paragraph is anything else.
 */
export function parseSingleLink(text: string): DemoLinkSpec | null {
  const source = text.trim();
  if (!source.startsWith('[')) return null;

  let depth = 0;
  let labelEnd = -1;
  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (char === '[') {
      depth++;
    } else if (char === ']') {
      depth--;
      if (depth === 0) {
        labelEnd = index;
        break;
      }
    }
  }
  if (labelEnd === -1 || source[labelEnd + 1] !== '(') return null;

  const label = source.slice(1, labelEnd);
  let rest = source.slice(labelEnd + 2);
  let href: string;

  if (rest.startsWith('<')) {
    const close = rest.indexOf('>');
    if (close === -1 || rest[close + 1] !== ')') return null;
    href = rest.slice(1, close);
    rest = rest.slice(close + 2);
  } else {
    let parenDepth = 1;
    let urlEnd = -1;
    for (let index = 0; index < rest.length; index++) {
      const char = rest[index];
      if (char === '(') {
        parenDepth++;
      } else if (char === ')') {
        parenDepth--;
        if (parenDepth === 0) {
          urlEnd = index;
          break;
        }
      }
    }
    if (urlEnd === -1) return null;
    href = rest.slice(0, urlEnd);
    rest = rest.slice(urlEnd + 1);
  }

  if (rest.trim() !== '') return null;
  return { label, href };
}

/**
 * Split a slide body into its Markdown and the run of demo links that closes
 * it. External links and ordinary paragraphs stay in the body, so a slide that
 * merely cites a URL keeps it where the author wrote it.
 * @param body - The slide Markdown body.
 * @returns The body without its trailing demo links, and those links in order.
 */
export function splitDemoLinks(body: string): {
  body: string;
  demos: DemoLinkSpec[];
} {
  const blocks = body.split(/\n{2,}/);
  let firstDemo = blocks.length;
  const demos: DemoLinkSpec[] = [];
  for (let index = blocks.length - 1; index >= 0; index--) {
    const link = parseSingleLink(blocks[index] ?? '');
    if (!link?.href.startsWith('/')) break;
    demos.unshift(link);
    firstDemo = index;
  }
  return { body: blocks.slice(0, firstDemo).join('\n\n').trim(), demos };
}

/**
 * The displayed form of a demo link label: the `Demo:` prefix an author writes
 * to mark the paragraph is dropped, and the first character is uppercased.
 * @param label - The raw link label.
 * @returns What the button shows.
 */
export function demoLabel(label: string): string {
  const text = label.replace(DEMO_PREFIX, '');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const DEMO_PREFIX = /^Demo:\s*/i;
