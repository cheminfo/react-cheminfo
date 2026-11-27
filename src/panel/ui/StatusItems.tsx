/**
 * The items every viewer's status bar writes alike: how many spectra are
 * drawn, which one is selected, and the refusal at the far end.
 */

import { Icon } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import {
  countLabel,
  statusErrorStyle,
  statusItemStyle,
  statusNameStyle,
  statusSpacerStyle,
} from '../core/statusBar.ts';

/** Props of {@link StatusCount}. */
export interface StatusCountProps {
  /** How many spectra are open. */
  open: number;
  /** How many of them are drawn. */
  drawn: number;
  /**
   * What the bar says while nothing is open.
   * @default 'no spectrum open'
   */
  empty?: string;
}

/**
 * How many spectra are drawn of those open.
 * @param props - See {@link StatusCountProps}.
 * @returns The item.
 */
export function StatusCount(props: StatusCountProps): ReactElement {
  const { open, drawn, empty = 'no spectrum open' } = props;
  return (
    <span style={statusItemStyle}>
      {open === 0
        ? empty
        : `${countLabel(drawn, 'spectrum', 'spectra')} drawn of ${open}`}
    </span>
  );
}

/** Props of {@link StatusName}. */
export interface StatusNameProps {
  /** The name of the spectrum selected, or `null` when none is. */
  name: string | null;
}

/**
 * The name of the spectrum selected, whole on hover when it is cut short.
 * @param props - See {@link StatusNameProps}.
 * @returns The item, or nothing when no spectrum is selected.
 */
export function StatusName(props: StatusNameProps): ReactElement | null {
  const { name } = props;
  if (name === null) return null;
  return (
    <span style={statusNameStyle} title={name}>
      {name}
    </span>
  );
}

/** Props of {@link StatusError}. */
export interface StatusErrorProps {
  /** The refusal, or `null` when nothing was refused. */
  error: string | null;
}

/**
 * The far end of the bar, where a refusal is written: the one red in the
 * shell, so the eye that has just pressed something and seen nothing happen
 * lands on the reason.
 * @param props - See {@link StatusErrorProps}.
 * @returns The spacer, then the refusal when there is one.
 */
export function StatusError(props: StatusErrorProps): ReactElement {
  const { error } = props;
  return (
    <>
      <span style={statusSpacerStyle} />
      {error === null ? null : (
        <span style={statusErrorStyle} title={error}>
          <Icon icon="warning-sign" size={12} />
          {error}
        </span>
      )}
    </>
  );
}
