import { EMBED_PARAM } from './config.ts';
import { firstValues, parseQuery, serializeQuery } from './query.ts';

/** The query parameter a sealed link carries, and the only one it carries. */
export const SEAL_PARAM = 's';

/** Why a sealed link could not be opened. */
export type SealProblem = 'malformed' | 'tampered' | 'unsupported';

/** What opening a sealed link gave. */
export type UnsealResult =
  { ok: true; query: string } | { ok: false; problem: SealProblem };

// The key is in every page that opens a sealed link, so it is not a secret: the
// seal keeps a class from reading or editing a link, not someone who digs the
// key out of the bundle. The version prefix of a token picks its key, so a new
// key ships under a new version and every older link keeps opening.
const KEYRING: Readonly<Record<string, string>> = {
  e1: 'MOCyEX25cEtWf2QJ6Ux_2lFxN_4oCwjtqyOkOC4tCXA',
};
const CURRENT_VERSION = 'e1';

// The tag is an HMAC of the message, and also the counter the message is
// encrypted under: the synthetic-IV construction. One 8-byte value both refuses
// an edited link and makes sealing deterministic, so the same query always
// gives the same link.
const TAG_LENGTH = 8;
const COUNTER_BITS = 64;
const COMPRESSED = 1;

interface SealKeys {
  cipher: CryptoKey;
  mac: CryptoKey;
}

const keys = new Map<string, Promise<SealKeys>>();

/**
 * Seal a query string: compressed when that makes it shorter, then encrypted
 * under a tag computed from it, so the token can be neither read nor edited
 * without the key, and the same query always gives the same token.
 * @param query - The query string the page is to read, without its leading `?`.
 * @returns The token, `e1.` followed by base64url.
 */
export async function sealQuery(query: string): Promise<string> {
  const plain = new TextEncoder().encode(query);
  const packed = await transform(plain, new CompressionStream('deflate-raw'));
  const compressed = packed.length < plain.length;
  const body = compressed ? packed : plain;
  const message = new Uint8Array(1 + body.length);
  message[0] = compressed ? COMPRESSED : 0;
  message.set(body, 1);

  const { cipher, mac } = await keysOf(CURRENT_VERSION);
  const tag = await tagOf(mac, CURRENT_VERSION, message);
  const encrypted = await crypto.subtle.encrypt(ctr(tag), cipher, message);
  const sealed = new Uint8Array(TAG_LENGTH + encrypted.byteLength);
  sealed.set(tag);
  sealed.set(new Uint8Array(encrypted), TAG_LENGTH);
  return `${CURRENT_VERSION}.${toBase64Url(sealed)}`;
}

/**
 * Open a token written by {@link sealQuery}. Never throws: a token that was
 * edited, cut, or minted by a newer key is answered with the reason.
 * @param token - The value of the `s` parameter.
 * @returns The query string it carries, or why it cannot be opened.
 */
export async function unsealQuery(token: string): Promise<UnsealResult> {
  const dot = token.indexOf('.');
  if (dot === -1) return { ok: false, problem: 'malformed' };
  const version = token.slice(0, dot);
  if (!Object.hasOwn(KEYRING, version)) {
    return { ok: false, problem: 'unsupported' };
  }
  const sealed = fromBase64Url(token.slice(dot + 1));
  if (sealed === null || sealed.length <= TAG_LENGTH) {
    return { ok: false, problem: 'malformed' };
  }

  const { cipher, mac } = await keysOf(version);
  const tag = sealed.subarray(0, TAG_LENGTH);
  const message = new Uint8Array(
    await crypto.subtle.decrypt(ctr(tag), cipher, sealed.subarray(TAG_LENGTH)),
  );
  if (!sameBytes(tag, await tagOf(mac, version, message))) {
    return { ok: false, problem: 'tampered' };
  }

  const flags = message[0] ?? 0;
  if (flags > COMPRESSED) return { ok: false, problem: 'unsupported' };
  const body = message.subarray(1);
  try {
    const plain =
      flags === COMPRESSED
        ? await transform(body, new DecompressionStream('deflate-raw'))
        : body;
    const query = new TextDecoder('utf-8', { fatal: true }).decode(plain);
    return { ok: true, query };
  } catch {
    return { ok: false, problem: 'malformed' };
  }
}

/**
 * The sealed token a query string carries.
 * @param search - The query string, with or without its leading `?`.
 * @returns The value of `s`, or `null` when the address is not sealed.
 */
export function sealedToken(search: string): string | null {
  return firstValues(parseQuery(search)).get(SEAL_PARAM) ?? null;
}

/**
 * Turn a share link into its sealed form: the same page, with everything its
 * query string said moved into one `s` token. A sealed page is always
 * embedded, so the token says `embed=1` whatever the link said.
 * @param url - The absolute share link.
 * @returns The sealed link.
 */
export async function sealShareUrl(url: string): Promise<string> {
  const address = new URL(url);
  const entries = parseQuery(address.search).filter(
    ([key]) => key !== EMBED_PARAM && key !== SEAL_PARAM,
  );
  entries.push([EMBED_PARAM, '1']);
  const token = await sealQuery(serializeQuery(entries));
  address.search = `?${SEAL_PARAM}=${token}`;
  return address.href;
}

function keysOf(version: string): Promise<SealKeys> {
  let pair = keys.get(version);
  if (pair === undefined) {
    pair = deriveKeys(version);
    keys.set(version, pair);
  }
  return pair;
}

// One key per purpose, both derived from the version's key, since a key is
// never used for two algorithms.
async function deriveKeys(version: string): Promise<SealKeys> {
  const raw = fromBase64Url(KEYRING[version] ?? '') ?? new Uint8Array();
  const base = await crypto.subtle.importKey('raw', raw, 'HKDF', false, [
    'deriveKey',
  ]);
  function derive(
    purpose: string,
    algorithm: AesKeyGenParams | HmacImportParams,
    usages: KeyUsage[],
  ): Promise<CryptoKey> {
    const info = new TextEncoder().encode(
      `cheminfo seal ${version} ${purpose}`,
    );
    return crypto.subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(), info },
      base,
      algorithm,
      false,
      usages,
    );
  }
  const [cipher, mac] = await Promise.all([
    derive('cipher', { name: 'AES-CTR', length: 256 }, ['encrypt', 'decrypt']),
    derive('mac', { name: 'HMAC', hash: 'SHA-256', length: 256 }, ['sign']),
  ]);
  return { cipher, mac };
}

// The version is signed with the message, so a token cannot be moved under
// another version's key.
async function tagOf(
  mac: CryptoKey,
  version: string,
  message: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> {
  const prefix = new TextEncoder().encode(`${version}.`);
  const signed = new Uint8Array(prefix.length + message.length);
  signed.set(prefix);
  signed.set(message, prefix.length);
  const digest = await crypto.subtle.sign('HMAC', mac, signed);
  return new Uint8Array(digest, 0, TAG_LENGTH);
}

function ctr(tag: Uint8Array<ArrayBuffer>): AesCtrParams {
  const counter = new Uint8Array(16);
  counter.set(tag);
  return { name: 'AES-CTR', counter, length: COUNTER_BITS };
}

function sameBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

async function transform(
  bytes: Uint8Array<ArrayBuffer>,
  stream: CompressionStream | DecompressionStream,
): Promise<Uint8Array<ArrayBuffer>> {
  const source = new ReadableStream<Uint8Array<ArrayBuffer>>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
  const output = await new Response(source.pipeThrough(stream)).arrayBuffer();
  return new Uint8Array(output);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCodePoint(byte);
  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/[=]+$/, '');
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[\w-]*$/.test(text) || text.length % 4 === 1) return null;
  const base64 = text.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.codePointAt(index) ?? 0;
  }
  return bytes;
}
