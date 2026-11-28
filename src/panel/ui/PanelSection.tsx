import type { ReactElement, ReactNode } from 'react';

/** What {@link PanelSection} is given. */
export interface PanelSectionProps {
  /** Its title, set small above the controls; it also names the section. */
  title: string;
  /**
   * A line under the title saying what the controls do, muted.
   * @default undefined — none
   */
  hint?: ReactNode;
  /** Its controls. */
  children?: ReactNode;
}

/**
 * A titled block of an editor's panel — the properties of what is selected,
 * one section at a time — under a rule, as every editor of the family draws
 * it. `chrome.css` lays it out; `panel-section__list` styles a list in it.
 * Distinct from `Section`, the block of a dialog.
 * @param props - See {@link PanelSectionProps}.
 * @returns The section.
 */
export function PanelSection(props: PanelSectionProps): ReactElement {
  const { title, hint, children } = props;
  return (
    <section className="panel-section" aria-label={title}>
      <h3 className="panel-section__title">{title}</h3>
      {hint === undefined ? null : (
        <p className="panel-section__hint">{hint}</p>
      )}
      {children}
    </section>
  );
}
