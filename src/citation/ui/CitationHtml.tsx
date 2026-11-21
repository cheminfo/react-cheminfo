import type { ReactElement, ReactNode } from 'react';

/**
 * A reference as citeproc-js wrote it, drawn with the emphasis of its style:
 * italics, bold, raised and lowered runs. Any other element is dropped and its
 * text kept, so nothing a reference holds reaches the page as markup.
 * @param props - The HTML.
 * @param props.html - What citeproc-js wrote.
 * @returns The reference.
 */
export function CitationHtml(props: { html: string }): ReactElement {
  const template = document.createElement('template');
  template.innerHTML = props.html;
  return <>{nodesOf(template.content)}</>;
}

function nodesOf(parent: ParentNode): ReactNode[] {
  const nodes: ReactNode[] = [];
  let index = 0;
  for (const child of parent.childNodes) {
    nodes.push(nodeOf(child, index++));
  }
  return nodes;
}

function nodeOf(node: ChildNode, key: number): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (!(node instanceof Element)) return null;
  const children = nodesOf(node);
  switch (node.tagName.toLowerCase()) {
    case 'i':
      return <em key={key}>{children}</em>;
    case 'b':
      return <strong key={key}>{children}</strong>;
    case 'sup':
      return <sup key={key}>{children}</sup>;
    case 'sub':
      return <sub key={key}>{children}</sub>;
    default:
      return <span key={key}>{children}</span>;
  }
}
