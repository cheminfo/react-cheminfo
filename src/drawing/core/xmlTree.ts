/**
 * An XML file read into a tree of elements, each with its attributes, its
 * children by tag name and its text, read as an XML parser reads them: every
 * entity decoded, CDATA sections taken as they are, and every line end a line
 * feed. Each element knows the namespaces declared where it stands, so a name
 * is matched by its namespace, whatever prefix the file binds to it. The tree
 * keeps the order of the children of one name, not across names.
 */

import { parse } from 'arraybuffer-xml-parser';

import { unescapeXml } from '../../share/core/escape.ts';
import { isRecord } from '../../values/core/values.ts';

/** An element of an XML file. */
export interface XmlElement {
  /** Its name without its prefix: `svg` for `<ns0:svg>`. */
  localName: string;
  /** The namespace its name is in; empty when it is in none. */
  namespace: string;
  /** Its attributes, by name, as written. */
  attributes: Record<string, string>;
  /** Its child elements, by tag name, in the order they are written. */
  children: Record<string, XmlElement[]>;
  /** The text it holds directly, then the text of its CDATA sections. */
  text: string;
  /** The namespace each prefix stands for where it is; `''` is the default. */
  namespaces: ReadonlyMap<string, string>;
}

/** The name the parser gives the CDATA sections of an element. */
const CDATA = '#cdata';

/** What may come before the root element: a declaration, comments, a doctype. */
const PROLOG = String.raw`^\s*(?:(?:<\?xml[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[^>[]*(?:\[[\s\S]*?\])?\s*>)\s*)*`;

/** The byte order mark an editor may write before the first character. */
const BYTE_ORDER_MARK = 0xfe_ff;

const decoder = new TextDecoder();

/**
 * The root element of an XML text.
 * @param text - The text.
 * @returns The root element, or undefined when the text holds no element.
 * @throws {Error} When the text cannot be read as XML.
 */
export function readXmlTree(text: string): XmlElement | undefined {
  // XML reads every line end as a line feed before anything else, and the
  // parser drops an attribute whose value holds a carriage return.
  const lines = text.includes('\r') ? text.replaceAll(/\r\n?/g, '\n') : text;
  const parsed = parse(lines, {
    arrayMode: true,
    trimValues: false,
    cdataTagName: CDATA,
    attributeValueProcessor: (value) => unescapeXml(value),
    tagValueProcessor: (value, node) => {
      const content = decoder.decode(value);
      return node.tagName === CDATA ? content : unescapeXml(content);
    },
  });
  const [root] = isRecord(parsed) ? Object.entries(parsed) : [];
  if (!root) return undefined;
  const [name, content] = root;
  const [first] = Array.isArray(content) ? content : [content];
  return toElement(name, first, new Map());
}

/**
 * Whether a text is an XML file whose root element has a name, after
 * whatever declaration, comments and doctype come first.
 * @param text - Any text.
 * @param name - The name of the root element, matched whatever its case.
 * @returns True when the text starts with that root element.
 */
export function startsWithRoot(text: string, name: string): boolean {
  return new RegExp(String.raw`${PROLOG}<${name}[\s/>]`, 'i').test(
    withoutByteOrderMark(text),
  );
}

/**
 * A text without the byte order mark an editor may write before it.
 * @param text - Any text.
 * @returns The text, its byte order mark removed.
 */
export function withoutByteOrderMark(text: string): string {
  return text.codePointAt(0) === BYTE_ORDER_MARK ? text.slice(1) : text;
}

/**
 * The children of an element with a tag name.
 * @param element - The element.
 * @param name - The tag name, as written.
 * @returns The children, in the order they are written.
 */
export function childrenOf(element: XmlElement, name: string): XmlElement[] {
  return element.children[name] ?? [];
}

/**
 * Every element under an element, at any depth, each before its children.
 * @param element - The element.
 * @returns The elements; those of one name in the order they are written.
 */
export function descendantsOf(element: XmlElement): XmlElement[] {
  const found: XmlElement[] = [];
  const visit = (parent: XmlElement) => {
    for (const children of Object.values(parent.children)) {
      for (const child of children) {
        found.push(child);
        visit(child);
      }
    }
  };
  visit(element);
  return found;
}

/**
 * An attribute of an element, named by its namespace and its local name,
 * whatever prefix the file writes it with.
 * @param element - The element.
 * @param namespace - The namespace of the attribute; empty for an attribute
 * written without a prefix, which is in none.
 * @param localName - Its name without its prefix.
 * @returns Its value, or undefined when the element has no such attribute.
 */
export function attributeOf(
  element: XmlElement,
  namespace: string,
  localName: string,
): string | undefined {
  for (const [name, value] of Object.entries(element.attributes)) {
    const colon = name.indexOf(':');
    if (name.slice(colon + 1) !== localName) continue;
    const prefix = name.slice(0, Math.max(colon, 0));
    if (prefix === 'xmlns') continue;
    const resolved = prefix ? element.namespaces.get(prefix) : '';
    if (resolved === namespace) return value;
  }
  return undefined;
}

function toElement(
  name: string,
  value: unknown,
  inherited: ReadonlyMap<string, string>,
): XmlElement {
  const fields: Array<[string, unknown]> = isRecord(value)
    ? Object.entries(value)
    : [['#text', value]];
  const attributes: Record<string, string> = {};
  for (const [key, field] of fields) {
    if (key.startsWith('$')) attributes[key.slice(1)] = String(field);
  }
  const namespaces = declaredIn(attributes, inherited);
  const colon = name.indexOf(':');
  const element: XmlElement = {
    localName: name.slice(colon + 1),
    namespace: namespaces.get(name.slice(0, Math.max(colon, 0))) ?? '',
    attributes,
    children: {},
    text: '',
    namespaces,
  };
  for (const [key, field] of fields) {
    if (key === '#text' || key === CDATA) {
      element.text += Array.isArray(field) ? field.join('') : String(field);
    } else if (!key.startsWith('$')) {
      const items: unknown[] = Array.isArray(field) ? field : [field];
      const children: XmlElement[] = [];
      for (const item of items) {
        children.push(toElement(key, item, namespaces));
      }
      element.children[key] = children;
    }
  }
  return element;
}

// The namespaces in scope on an element: those of its parent, and those its
// own `xmlns` attributes declare, which also apply to its own name.
function declaredIn(
  attributes: Readonly<Record<string, string>>,
  inherited: ReadonlyMap<string, string>,
): ReadonlyMap<string, string> {
  let namespaces: Map<string, string> | undefined;
  for (const [name, value] of Object.entries(attributes)) {
    if (name !== 'xmlns' && !name.startsWith('xmlns:')) continue;
    namespaces ??= new Map(inherited);
    namespaces.set(name.slice('xmlns:'.length), value);
  }
  return namespaces ?? inherited;
}
