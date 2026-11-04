import type { ReactElement, ReactNode } from 'react';

/** What {@link SettingsGroup} holds. */
export interface SettingsGroupProps {
  /** What the settings of the group are about, written above them. */
  title: string;
  /**
   * One sentence under the settings, saying what they change.
   * @default undefined
   */
  note?: ReactNode;
  /** The settings. */
  children: ReactNode;
}

/**
 * One titled block of settings in a section of the settings dialog, the
 * settings in a card under their title.
 * @param props - See {@link SettingsGroupProps}.
 * @returns The group.
 */
export function SettingsGroup(props: SettingsGroupProps): ReactElement {
  const { title, note, children } = props;
  return (
    <section className="settings-group" aria-label={title}>
      <h4 className="settings-group__title">{title}</h4>
      <div className="settings-group__body">
        {children}
        {note ? <p className="settings-group__note">{note}</p> : null}
      </div>
    </section>
  );
}
