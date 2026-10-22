import type { CSSProperties, ReactElement, ReactNode } from 'react';

export interface SourceBadgeProps {
  /** What the source is called, read in the badge's tooltip. */
  name: string;
  /**
   * What the badge says.
   * @default name
   */
  label?: ReactNode;
  /**
   * The source's own colour, as `#rrggbb`. `null` draws it in the site's own
   * colour, which is how a site marks a source that is itself.
   * @default undefined — a neutral grey, for a source with no look
   */
  color?: string | null;
  /**
   * The absolute address of its little logo.
   * @default null
   */
  logo?: string | null;
  /**
   * The entry's identifier there, written after the name.
   * @default null
   */
  identifier?: string | null;
  /**
   * How many entries the source holds, written after the name when more than
   * one.
   * @default 1
   */
  count?: number;
  /**
   * Where the badge leads, opened in a new tab.
   * @default null — the badge names the source and leads nowhere
   */
  href?: string | null;
  /**
   * The tooltip.
   * @default the name, then the identifier
   */
  title?: string;
  /**
   * The smaller badge of a dense list, whose identifier goes in the tooltip
   * only.
   * @default false
   */
  compact?: boolean;
}

/**
 * A source, as a badge: its name in its own colour, its little logo on a white
 * chip, and the entry it holds — the same badge on every site of the family
 * that names where a molecule comes from.
 * @param props - See {@link SourceBadgeProps}.
 * @returns The badge.
 */
export function SourceBadge(props: SourceBadgeProps): ReactElement {
  const {
    name,
    label = name,
    color,
    logo = null,
    identifier = null,
    count = 1,
    href = null,
    compact = false,
  } = props;
  const title =
    props.title ?? (identifier === null ? name : `${name} ${identifier}`);
  const className = [
    'source-badge',
    compact ? 'source-badge--compact' : '',
    color === undefined ? 'source-badge--neutral' : '',
  ]
    .filter(Boolean)
    .join(' ');
  // A source with no colour of its own takes the site's, from the stylesheet.
  const style =
    typeof color === 'string'
      ? ({ '--source': color } as CSSProperties)
      : undefined;
  const content = (
    <>
      {logo === null ? null : (
        <span className="source-badge__logo">
          <img src={logo} alt="" />
        </span>
      )}
      <span className="source-badge__name">{label}</span>
      {compact || identifier === null ? null : (
        <span className="source-badge__id">{identifier}</span>
      )}
      {count > 1 ? <span className="source-badge__count">{count}</span> : null}
    </>
  );

  if (href === null) {
    return (
      <span className={className} style={style} title={title}>
        {content}
      </span>
    );
  }
  return (
    <a
      className={className}
      style={style}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
    >
      {content}
    </a>
  );
}
