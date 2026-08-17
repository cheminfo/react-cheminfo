import type { IconName } from '@blueprintjs/core';
import { Collapse, Icon } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useState } from 'react';

/** What a titled section that folds away needs. */
export interface CollapsibleSectionProps {
  /** The heading, which is also what opens and closes the section. */
  title: ReactNode;
  /** The body, shown only while the section is open. */
  children: ReactNode;
  /**
   * Glyph before the title.
   * @default undefined — only the chevron is drawn
   */
  icon?: IconName;
  /**
   * Whether the section starts open, when the caller does not drive it.
   * @default true
   */
  defaultOpen?: boolean;
  /**
   * Controls beside the heading — a count, a copy button, a menu. They sit
   * outside the heading button, so pressing one does not fold the section.
   * @default undefined
   */
  rightElement?: ReactNode;
  /**
   * Whether the section is open, when a parent drives it — which is what an
   * "expand all" button, or a badge that opens and scrolls to a section, needs.
   * @default undefined — the section keeps its own state
   */
  isOpen?: boolean;
  /**
   * Called when the heading is pressed while a parent drives the section.
   * @default undefined
   */
  onToggle?: () => void;
  /**
   * Identifier of the section element, so a link can jump to it.
   * @default undefined
   */
  id?: string;
  /**
   * Class the section carries, in addition to `collapsible-section`.
   * @default undefined
   */
  className?: string;
}

/**
 * A titled block of a page that folds away when its heading is pressed.
 *
 * It works on its own or under a parent: pass `isOpen` and `onToggle` and the
 * caller owns the state, which is what a page needs to open every section at
 * once.
 * @param props - See {@link CollapsibleSectionProps}.
 * @returns The section.
 */
export function CollapsibleSection(
  props: CollapsibleSectionProps,
): ReactElement {
  const {
    title,
    children,
    icon,
    defaultOpen = true,
    rightElement,
    isOpen: openProp,
    onToggle,
    id,
    className,
  } = props;
  const [openState, setOpenState] = useState(defaultOpen);

  const isControlled = openProp !== undefined;
  const isOpen = isControlled ? openProp : openState;

  function toggle(): void {
    if (isControlled) onToggle?.();
    else setOpenState((shown) => !shown);
  }

  return (
    <section
      id={id}
      className={
        className === undefined
          ? 'collapsible-section'
          : `collapsible-section ${className}`
      }
    >
      <div style={HEADER_STYLE}>
        <button
          type="button"
          style={BUTTON_STYLE}
          aria-expanded={isOpen}
          onClick={toggle}
        >
          <Icon icon={isOpen ? 'chevron-down' : 'chevron-right'} size={14} />
          {icon === undefined ? null : <Icon icon={icon} size={14} />}
          <span style={TITLE_STYLE}>{title}</span>
        </button>
        {rightElement === undefined ? null : (
          <div style={RIGHT_STYLE}>{rightElement}</div>
        )}
      </div>
      <Collapse isOpen={isOpen}>
        <div style={BODY_STYLE}>{children}</div>
      </Collapse>
    </section>
  );
}

const HEADER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
} as const satisfies CSSProperties;

const BUTTON_STYLE = {
  display: 'flex',
  flex: '1 1 auto',
  minWidth: 0,
  alignItems: 'center',
  padding: '4px 0',
  border: 0,
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  fontWeight: 600,
  gap: 6,
  textAlign: 'left',
  cursor: 'pointer',
} as const satisfies CSSProperties;

const TITLE_STYLE = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const satisfies CSSProperties;

const RIGHT_STYLE = {
  display: 'flex',
  flex: '0 0 auto',
  alignItems: 'center',
  gap: 4,
} as const satisfies CSSProperties;

const BODY_STYLE = { paddingTop: 4 } as const satisfies CSSProperties;
