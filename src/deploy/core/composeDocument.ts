import type { Document, Pair } from 'yaml';
import {
  LineCounter,
  isAlias,
  isMap,
  isScalar,
  isSeq,
  parseDocument,
} from 'yaml';

/** One service of a compose file, with its merge keys applied. */
export interface ComposeService {
  /** The service's key under `services`. */
  readonly name: string;
  /** The line its key is written on, counting from 1. */
  readonly line: number;
  /** The first and the last line of its text, comments directly above it included. */
  readonly lines: readonly [first: number, last: number];
  /** The service as compose reads it: anchors resolved and `<<` merge keys applied. */
  readonly value: Readonly<Record<string, unknown>>;
  /**
   * The line a key of the service is written on, following `<<` merge keys into
   * the anchor that declares it.
   * @param key - The key, such as `image`.
   * @returns Its line, or the service's own line when the key is absent.
   */
  readonly lineOf: (key: string) => number;
}

/** A compose file, parsed. */
interface ComposeDocument {
  /** Its text, split into lines. */
  readonly lines: readonly string[];
  /** Its services, in the order they are written. */
  readonly services: readonly ComposeService[];
  /** Why it could not be read, when it could not; its services are then empty. */
  readonly error?: { line: number; message: string };
}

interface ServiceKey {
  pair: Pair;
  name: string;
  line: number;
  first: number;
}

/**
 * Parse a compose file the way compose reads it — any indentation, flow or
 * block style, anchors, aliases and `<<` merge keys — keeping the line each
 * service and key is written on, so a report can point at it.
 * @param text - The content of the compose file.
 * @returns Its services, or the error that stops it from parsing.
 */
export function readComposeDocument(text: string): ComposeDocument {
  const lines = text.split('\n');
  const lineCounter = new LineCounter();
  const document = parseDocument(text, { lineCounter, merge: true });

  const [parseError] = document.errors;
  if (parseError !== undefined) {
    return {
      lines,
      services: [],
      error: {
        line: parseError.linePos?.[0].line ?? 1,
        message: firstLine(parseError.message),
      },
    };
  }

  let resolved: unknown;
  try {
    resolved = document.toJS();
  } catch (error) {
    return {
      lines,
      services: [],
      error: { line: 1, message: firstLine(String(error)) },
    };
  }

  const servicesNode = document.get('services', true);
  if (!isMap(servicesNode)) return { lines, services: [] };
  const servicesValue = recordOf(recordOf(resolved).services);
  const lineAt = (offset: number) => lineCounter.linePos(offset).line;

  const keys: ServiceKey[] = [];
  for (const pair of servicesNode.items) {
    if (!isScalar(pair.key) || isMergeKey(pair) || !pair.key.range) continue;
    const { line, col } = lineCounter.linePos(pair.key.range[0]);
    const previous = keys.at(-1)?.line ?? 0;
    const first = firstLineOfService(lines, line, col, previous);
    keys.push({ pair, name: String(pair.key.value), line, first });
  }

  const end = servicesNode.range?.[2] ?? text.length;
  const lastLine = lineAt(Math.max(end - 1, 0));
  const services: ComposeService[] = [];
  for (let index = 0; index < keys.length; index++) {
    const { pair, name, line, first } = keys[index] as ServiceKey;
    const next = keys[index + 1];
    services.push({
      name,
      line,
      lines: [first, next === undefined ? lastLine : next.first - 1],
      value: recordOf(servicesValue[name]),
      lineOf: (key) => {
        const found = findPair(pair.value, key, document)?.key;
        return isScalar(found) && found.range ? lineAt(found.range[0]) : line;
      },
    });
  }

  return { lines, services };
}

/**
 * Where a service's text starts: the comment block directly above its key
 * belongs to it, unless the block is indented deeper than the key and so
 * closes the service before.
 * @param lines - The file, split into lines.
 * @param line - The line of the service's key.
 * @param column - The column of the key, counting from 1.
 * @param previous - The line of the service key written before it, or 0.
 * @returns The first line of the service.
 */
function firstLineOfService(
  lines: readonly string[],
  line: number,
  column: number,
  previous: number,
): number {
  let first = line;
  while (first - 1 > previous) {
    const comment = /^(?<indent>\s*)#/.exec(lines[first - 2] ?? '');
    if (comment?.groups?.indent === undefined) break;
    if (comment.groups.indent.length >= column) break;
    first--;
  }
  return first;
}

function findPair(
  node: unknown,
  key: string,
  document: Document,
): Pair | undefined {
  const map = isAlias(node) ? node.resolve(document) : node;
  if (!isMap(map)) return undefined;
  for (const pair of map.items) {
    if (isScalar(pair.key) && pair.key.value === key) return pair;
  }
  for (const pair of map.items) {
    if (!isMergeKey(pair)) continue;
    const sources = isSeq(pair.value) ? pair.value.items : [pair.value];
    for (const source of sources) {
      const found = findPair(source, key, document);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

function isMergeKey(pair: Pair): boolean {
  if (!isScalar(pair.key)) return false;
  const { value } = pair.key;
  return (
    value === '<<' || (typeof value === 'symbol' && value.description === '<<')
  );
}

function recordOf(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function firstLine(message: string): string {
  const [head = ''] = message.split('\n', 1);
  return head.replace(/:$/, '');
}
