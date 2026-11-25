/*
 * What the message checker reads of a key and of a message: the English a
 * translated key answers to — its own, or its plural family's `other` — the
 * placeholders a translated branch may write besides its English's, and the
 * `{name}`s a message fills in.
 */

const PLACEHOLDER = /\{(?<name>[^{}]*)\}/g;
const PLURAL_BRANCH = /^(?<family>.+)_(?:zero|one|two|few|many|other)$/;

/**
 * The plural family a key is a branch of: `count` for `count_one`.
 * @param {string} key - The key.
 * @returns {string | undefined} The family, or `undefined` for a key that is no branch.
 */
export function familyOf(key) {
  return PLURAL_BRANCH.exec(key)?.groups?.family;
}

/**
 * The English a translated key answers to: its own, or — a branch English does
 * not write, such as `few` — its family's `other`.
 * @param {Record<string, string>} source - The English messages.
 * @param {string} key - The translated key.
 * @returns {string | undefined} The English message, or `undefined` for a key
 * English knows nothing of.
 */
export function englishOf(source, key) {
  if (hasOwn(source, key)) return source[key];
  const family = familyOf(key);
  if (family === undefined || !hasOwn(source, `${family}_other`)) {
    return undefined;
  }
  return source[`${family}_other`];
}

/**
 * The placeholders a translated branch may write besides its English's: those
 * of its family's `other` — `{count}`, which English's `one` often writes as 1.
 * @param {Record<string, string>} source - The English messages.
 * @param {string} key - The translated key.
 * @returns {Set<string>} The names, none for a key that is no branch.
 */
export function familyPlaceholders(source, key) {
  const family = familyOf(key);
  if (family === undefined || !hasOwn(source, `${family}_other`)) {
    return new Set();
  }
  return placeholders(source[`${family}_other`]);
}

/**
 * The names a message fills in.
 * @param {string} message - The message.
 * @returns {Set<string>} Every `{name}` it writes.
 */
export function placeholders(message) {
  const names = new Set();
  for (const match of message.matchAll(PLACEHOLDER)) {
    names.add(match.groups.name);
  }
  return names;
}

function hasOwn(catalog, key) {
  return Object.hasOwn(catalog, key);
}
