/** Where molecules.cheminfo.org answers, which holds the family's sources. */
export const MOLECULES_URL = 'https://molecules.cheminfo.org';

/**
 * How a source is drawn wherever the family names it — PubChem, ChEBI, COCONUT
 * — as molecules.cheminfo.org publishes it. molecules is where a source's
 * colour and logo are kept and edited, so every site reads them from there
 * rather than keeping a copy that drifts the first time one is changed.
 */
export interface SourceLook {
  /** What the source is called, as molecules writes it: `ChEBI`. */
  name: string;
  /** The colour its badges are drawn in, as `#rrggbb`; null for none. */
  color: string | null;
  /** The absolute address of its little logo; null when it has none. */
  logo: string | null;
}

/** Every source molecules publishes, by its name in lower case. */
export type SourceLooks = ReadonlyMap<string, SourceLook>;

/**
 * The sources a `/v1/sources` answer describes, each logo made absolute
 * against the address it was read from, so the badge draws it on any site.
 * Anything not shaped like a source is left out rather than trusted.
 * @param body - The parsed answer of `/v1/sources`.
 * @param baseUrl - Where it was read from.
 * @returns The looks, by lower-case name.
 */
export function readSourceLooks(body: unknown, baseUrl: string): SourceLooks {
  const looks = new Map<string, SourceLook>();
  const sources = isRecord(body) ? body.sources : undefined;
  if (!Array.isArray(sources)) return looks;
  for (const source of sources) {
    if (!isRecord(source) || typeof source.name !== 'string') continue;
    const { name, color, logo } = source;
    looks.set(name.toLowerCase(), {
      name,
      color: typeof color === 'string' && HEX_COLOR.test(color) ? color : null,
      logo: typeof logo === 'string' ? absolute(logo, baseUrl) : null,
    });
  }
  return looks;
}

/**
 * The look of one source, named in any case.
 * @param looks - What molecules publishes, or null while it is being read.
 * @param name - The source's name or key: `chebi`, `ChEBI`.
 * @returns Its look, or `undefined` when molecules does not know it (yet).
 */
export function sourceLook(
  looks: SourceLooks | null,
  name: string,
): SourceLook | undefined {
  return looks?.get(name.toLowerCase());
}

/** Where and how {@link fetchSourceLooks} reads. */
export interface FetchSourceLooksOptions {
  /**
   * Where molecules answers.
   * @default MOLECULES_URL
   */
  url?: string;
  /**
   * Aborts the read.
   * @default undefined
   */
  signal?: AbortSignal;
}

/**
 * Read every source's look from molecules.cheminfo.org.
 * @param options - See {@link FetchSourceLooksOptions}.
 * @returns The looks, by lower-case name.
 * @throws {Error} When molecules does not answer, or answers with an error.
 */
export async function fetchSourceLooks(
  options: FetchSourceLooksOptions = {},
): Promise<SourceLooks> {
  const { url = MOLECULES_URL, signal } = options;
  const response = await fetch(`${url}/v1/sources`, { signal });
  if (!response.ok) {
    throw new Error(`${url} answered ${response.status} for its sources`);
  }
  return readSourceLooks(await response.json(), url);
}

const HEX_COLOR = /^#[\da-f]{6}$/i;

function absolute(address: string, baseUrl: string): string | null {
  try {
    return new URL(address, baseUrl).href;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
