/**
 * Where the browser broke a run of words into lines, measured off the page.
 */

/** One line of a run of words, as the browser broke it. */
export interface LineBox {
  /** Offset of its first character in the run. */
  start: number;
  /** Offset just past its last character. */
  end: number;
  /** Its left edge on the page. */
  left: number;
  /** Its top edge. */
  top: number;
  /** Its right edge. */
  right: number;
  /** Its bottom edge. */
  bottom: number;
}

/**
 * The lines a run of words was broken into, read one character at a time:
 * a character starts a new line when it sits below the middle of the last.
 * @param node - The run.
 * @param range - A range to measure with.
 * @returns The lines, in the order they are read.
 */
export function lineBoxes(node: Text, range: Range): LineBox[] {
  const lines: LineBox[] = [];
  const { data } = node;
  let line: LineBox | undefined;
  let start = 0;
  while (start < data.length) {
    const end = isAstral(data.codePointAt(start) ?? 0)
      ? Math.min(start + 2, data.length)
      : start + 1;
    range.setStart(node, start);
    range.setEnd(node, end);
    const rect = range.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      if (line === undefined || rect.top + rect.height / 2 > line.bottom) {
        line = {
          start,
          end,
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
        };
        lines.push(line);
      } else {
        line.end = end;
        line.left = Math.min(line.left, rect.left);
        line.top = Math.min(line.top, rect.top);
        line.right = Math.max(line.right, rect.right);
        line.bottom = Math.max(line.bottom, rect.bottom);
      }
    }
    start = end;
  }
  return lines;
}

// A character outside the first plane is two UTF-16 units, measured as one.
function isAstral(code: number): boolean {
  return code > 0xff_ff;
}
