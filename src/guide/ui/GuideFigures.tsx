import type { ReactElement } from 'react';

/** A picture of what the tool can make, drawn faint behind the guide. */
export interface EmptyGuideFigure {
  /** Where the picture is. */
  src: string;
  /** What it shows, for a reader who cannot see it. */
  alt: string;
  /**
   * Its share of the row against the others', or of the height in a stack.
   * @default 1
   */
  share?: number;
  /**
   * What a click on it does: it comes up to full strength under the pointer.
   * @default undefined — the pointer goes through it to the tool
   */
  onSelect?: () => void;
  /**
   * What a click on it does, in a tooltip.
   * @default undefined — no tooltip
   */
  title?: string;
}

/** Figures one above the other, taking one place in the row between them. */
export interface EmptyGuideFigureStack {
  /** The figures, from the top. */
  stack: readonly EmptyGuideFigure[];
  /**
   * Its share of the row, against the others'.
   * @default 1
   */
  share?: number;
}

/**
 * The faint pictures of a guide, side by side in the room left.
 * @param props - The figures.
 * @param props.figures - The pictures, some of them stacked.
 * @returns The row.
 */
export function GuideFigures(props: {
  figures: ReadonlyArray<EmptyGuideFigure | EmptyGuideFigureStack>;
}): ReactElement {
  return (
    <div className="empty-guide__figures">
      {props.figures.map((entry) =>
        'stack' in entry ? (
          <GuideStack key={stackKey(entry)} entry={entry} />
        ) : (
          <GuideFigure key={entry.src} figure={entry} />
        ),
      )}
    </div>
  );
}

function GuideStack(props: { entry: EmptyGuideFigureStack }): ReactElement {
  const { stack, share = 1 } = props.entry;
  return (
    <div className="empty-guide__stack" style={{ flexGrow: share }}>
      {stack.map((figure) => (
        <GuideFigure key={figure.src} figure={figure} />
      ))}
    </div>
  );
}

function stackKey(entry: EmptyGuideFigureStack): string {
  return entry.stack.map((figure) => figure.src).join(' ');
}

function GuideFigure(props: { figure: EmptyGuideFigure }): ReactElement {
  const { src, alt, share = 1, onSelect, title } = props.figure;
  const image = <img src={src} alt={alt} draggable={false} />;
  if (!onSelect) {
    return (
      <figure className="empty-guide__figure" style={{ flexGrow: share }}>
        {image}
      </figure>
    );
  }
  return (
    <button
      type="button"
      className="empty-guide__figure"
      style={{ flexGrow: share }}
      title={title}
      onClick={onSelect}
    >
      {image}
    </button>
  );
}
