import type { ReactElement, ReactNode } from 'react';
import { useId } from 'react';

import type { HelpContent } from '../../help/ui/HelpBody.tsx';
import { HelpTooltip } from '../../help/ui/HelpTooltip.tsx';

import { useOverlayPanelShape } from './overlayPanelContext.ts';
import {
  OVERLAY_GRID_CELL_STYLE,
  overlayGridRowStyle,
  overlayNameColumnWidth,
  overlayNameStyle,
  overlayRowStyle,
  overlayStackedRowStyle,
} from './overlayRowStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/** One choice offered by an {@link OverlaySelect} or an {@link OverlaySegmented}. */
export interface OverlayOption<TValue extends string = string> {
  /** What picking it means. */
  value: TValue;
  /**
   * What it reads. Write the answer rather than the jargon — `95% of samples`,
   * never `2 SD`, because the second is meaningless to a reader who has not
   * met it and is misread as 95% by everyone who has.
   */
  label: string;
  /**
   * What the pointer is told about this one choice, when the control's own
   * help does not cover a surprising consequence.
   * @default undefined
   */
  title?: string;
  /**
   * Whether it can be picked. A choice that does not apply is greyed rather
   * than removed, so the control keeps its shape and the reader learns that
   * the option exists at all.
   * @default false
   */
  disabled?: boolean;
}

/** How a row arranges its name and its control. */
export type OverlayRowLayout = 'row' | 'grid';

/** What every control inside an {@link OverlayBar} carries. */
export interface OverlayControlProps {
  /**
   * The words in front of the control, phrased as the question the reader
   * already has: `Colour by`, `Group outlines`, `Dot size`.
   *
   * Required, and deliberately so. A row with no name is a row whose only
   * identification is the help glyph beside it, which is how a panel ends up
   * with a column of question marks standing in for its words — and it is the
   * name that a screen reader is given, that the help hangs off, and that
   * fills the panel's left column.
   */
  label: string;
  /**
   * What the control does, in a sentence. It hangs off the name, which is
   * underlined with dots to say so — never off a glyph of its own. A control
   * floating over a figure has no room to explain itself, and a reader who has
   * to guess what it does picks nothing at all, so every control should carry
   * one.
   * @default undefined — the name is written plainly
   */
  help?: HelpContent;
  /**
   * Whether the name is written or only announced. Hide it for a control whose
   * own words already say what it is — a button that reads `Zoom to selection`
   * — and never for one whose choices are bare numbers. It is honoured on a
   * bar alone: in a panel the name is the left column, and an empty cell there
   * is the ragged panel the grid exists to prevent.
   * @default false
   */
  hideLabel?: boolean;
  /**
   * Whether the control is greyed and unreachable.
   * @default false
   */
  disabled?: boolean;
  /**
   * Value of the `data-testid` attribute of the control.
   * @default undefined
   */
  testId?: string;
}

/** What {@link OverlayRow} lays out. Exported so a caller's own control gets the same name, help and geometry as the built-in ones. */
export interface OverlayRowProps extends OverlayControlProps {
  /** The control itself. */
  children: ReactNode;
  /**
   * Whether the name sits in front of the control or above it. Above once the
   * names are long enough to push the card past a third of the figure. Only
   * consulted on a bar; a panel row is always two columns.
   * @default 'inline'
   */
  labelPlacement?: 'inline' | 'above';
  /**
   * Whether the row is a line on a bar or a cell in a panel's grid.
   * @default `'grid'` inside an {@link OverlayPanel}, `'row'` anywhere else
   */
  layout?: OverlayRowLayout;
}

/**
 * A name, its help, and the control they belong to.
 *
 * Every control of this domain is one of these, which is the whole reason a
 * picker and a stepper standing side by side in a card line up on the same
 * baseline and answer to the same measurements. A caller writing a control
 * this package does not have reaches for it too, rather than approximating the
 * geometry and landing half a pixel out.
 *
 * The help hangs off the name rather than off a question mark beside it. Five
 * controls each with a glyph put five question marks in a column down the left
 * edge of a panel, and the eye reads that column before it reads a single
 * word; a dotted underline says the same thing and costs nothing. The name is
 * reachable by tab for the same reason the glyph was, so the explanation is
 * not reserved to whoever is holding a pointer, and it carries the class
 * `help-name` — the counterpart of the glyph's `help-icon` — so that whatever
 * used to look for the glyph has something to look for. In a panel the name
 * also names its row out loud, since a name a whole column away from its
 * control is not associated with it by proximity alone.
 * @param props - See {@link OverlayRowProps}.
 * @returns The row.
 */
export function OverlayRow(props: OverlayRowProps): ReactElement {
  const {
    children,
    label,
    help,
    hideLabel = false,
    disabled = false,
    testId,
    labelPlacement = 'inline',
  } = props;
  const { metrics } = useOverlaySurface();
  const panel = useOverlayPanelShape();
  const layout = props.layout ?? (panel === undefined ? 'row' : 'grid');
  const nameId = useId();

  const written = layout === 'grid' || !hideLabel;
  const name = written ? (
    <span
      id={layout === 'grid' ? nameId : undefined}
      className={help === undefined ? undefined : 'help-name'}
      tabIndex={help === undefined ? undefined : 0}
      style={overlayNameStyle(metrics, { help: help !== undefined, disabled })}
    >
      {label}
    </span>
  ) : null;
  const explained =
    help === undefined ? (
      name
    ) : (
      <HelpTooltip content={help}>{name}</HelpTooltip>
    );
  // A control whose name is not written keeps the help on its own words, so
  // that dropping the name never quietly drops the explanation with it.
  const control =
    help === undefined || written ? (
      children
    ) : (
      <HelpTooltip content={help}>{children}</HelpTooltip>
    );

  if (layout === 'grid') {
    const width = panel?.nameWidth ?? overlayNameColumnWidth(metrics);
    return (
      <div
        role="group"
        aria-labelledby={nameId}
        data-testid={testId}
        style={overlayGridRowStyle(metrics, width)}
      >
        {explained}
        <span style={OVERLAY_GRID_CELL_STYLE}>{control}</span>
      </div>
    );
  }

  if (labelPlacement === 'above') {
    return (
      <div data-testid={testId} style={overlayStackedRowStyle(metrics)}>
        {explained}
        {control}
      </div>
    );
  }

  return (
    <div data-testid={testId} style={overlayRowStyle(metrics)}>
      {explained}
      {control}
    </div>
  );
}
