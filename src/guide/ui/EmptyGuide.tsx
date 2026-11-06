import { Icon } from '@blueprintjs/core';
import type { MouseEvent, ReactElement, ReactNode } from 'react';

import { isModifiedClick } from '../../chrome/ui/navItem.ts';

import { useHintCycle } from './hintCycle.ts';

/** How long a hint stays before the next one takes its place, in milliseconds. */
const HINT_INTERVAL = 9000;

/** A picture of what the tool can make, drawn faint behind the guide. */
export interface EmptyGuideFigure {
  /** Where the picture is. */
  src: string;
  /** What it shows, for a reader who cannot see it. */
  alt: string;
  /**
   * Its share of the row, against the others'.
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

/** One way to learn more, offered under the help. */
export interface EmptyGuideLink {
  /** What it leads to. */
  label: string;
  /** Its address. */
  href: string;
  /**
   * Moves there inside the page, for a plain click; a click meant for another
   * tab or window goes to the address.
   * @default undefined — the browser follows the address
   */
  onSelect?: () => void;
}

/** Props of {@link EmptyGuide}. */
export interface EmptyGuideProps {
  /**
   * What is true on every visit: how to start, the keys. Sections drawn by
   * `<EmptyGuideSection>`, side by side as far as the width allows.
   * @default undefined — no help
   */
  help?: ReactNode;
  /**
   * The ways to learn more, a line under the help.
   * @default undefined — no line
   */
  links?: readonly EmptyGuideLink[];
  /**
   * What the line of links is headed.
   * @default undefined — no heading
   */
  linksTitle?: string;
  /**
   * What changes: one sentence on show at a time, the next one after
   * `hintInterval`, and another one first on the next visit.
   * @default undefined — no hint
   */
  hints?: readonly ReactNode[];
  /**
   * How long a hint stays, in milliseconds.
   * @default 9000
   */
  hintInterval?: number;
  /**
   * Pictures of what the tool can make, faint, side by side in the room left.
   * @default undefined — no picture
   */
  figures?: readonly EmptyGuideFigure[];
}

/**
 * What a tool shows while it holds nothing: the space that is empty anyway says
 * how to start. It comes in grey over the tool, lets the pointer through to it
 * everywhere but on a link or a figure that can be clicked, and the site stops
 * rendering it at the first stroke.
 *
 * Fill the absolute box of the tool's view with it: the parent is positioned.
 * @param props - See {@link EmptyGuideProps}.
 * @returns The guide.
 */
export function EmptyGuide(props: EmptyGuideProps): ReactElement {
  const {
    help,
    links,
    linksTitle,
    hints = [],
    hintInterval = HINT_INTERVAL,
    figures = [],
  } = props;
  return (
    <div className="empty-guide no-print" data-testid="empty-guide">
      {help ? <div className="empty-guide__help">{help}</div> : null}
      {links && links.length > 0 ? (
        <GuideLinks links={links} title={linksTitle} />
      ) : null}
      <div className="empty-guide__figures">
        {figures.map((figure) => (
          <GuideFigure key={figure.src} figure={figure} />
        ))}
      </div>
      {hints.length > 0 ? (
        <GuideHint hints={hints} interval={hintInterval} />
      ) : null}
    </div>
  );
}

/**
 * One section of a guide's help.
 * @param props - Its title, and what it says.
 * @param props.title - What it is about.
 * @param props.children - What it says.
 * @returns The section.
 */
export function EmptyGuideSection(props: {
  title: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section className="empty-guide__section">
      <h2 className="empty-guide__title">{props.title}</h2>
      {props.children}
    </section>
  );
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

function GuideLinks(props: {
  links: readonly EmptyGuideLink[];
  title: string | undefined;
}): ReactElement {
  return (
    <nav className="empty-guide__links" aria-label={props.title}>
      {props.title ? (
        <span className="empty-guide__title">{props.title}</span>
      ) : null}
      {props.links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={(event) => {
            followLink(event, link);
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

function followLink(
  event: MouseEvent<HTMLAnchorElement>,
  link: EmptyGuideLink,
): void {
  if (!link.onSelect || isModifiedClick(event)) return;
  event.preventDefault();
  link.onSelect();
}

function GuideHint(props: {
  hints: readonly ReactNode[];
  interval: number;
}): ReactElement {
  const { hints, interval } = props;
  const index = useHintCycle(hints.length, interval);
  return (
    <p className="empty-guide__hint" data-testid="empty-guide-hint">
      <Icon icon="lightbulb" size={14} />
      {/* A new key plays the fade again. */}
      <span key={index}>{hints[index]}</span>
    </p>
  );
}
