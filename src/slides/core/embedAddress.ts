/** The prose of a slide that frames a tool, and the address it frames. */
export interface EmbedAddress {
  /** The body without the address. */
  prose: string;
  /** The address to frame, or `null` when the body carries none. */
  src: string | null;
}

/**
 * The prose and the address of a slide that frames a tool.
 *
 * The address is written as a bare URL on its own line, the last one of the
 * body, because a teacher pastes what the tool's Share dialog gave them and
 * nothing else.
 * @param body - The slide body.
 * @returns The prose without the address, and the address.
 */
export function splitEmbedAddress(body: string): EmbedAddress {
  const lines = body.split('\n');
  for (let index = lines.length - 1; index >= 0; index--) {
    const line = (lines[index] ?? '').trim();
    if (line === '') continue;
    if (!line.startsWith('http://') && !line.startsWith('https://')) break;
    if (line.includes(' ')) break;
    const prose = [...lines.slice(0, index), ...lines.slice(index + 1)]
      .join('\n')
      .trim();
    return { prose, src: line };
  }
  return { prose: body.trim(), src: null };
}
