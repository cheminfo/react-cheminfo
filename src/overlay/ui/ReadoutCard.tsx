import type {
  CSSProperties,
  PointerEventHandler,
  ReactElement,
  ReactNode,
} from 'react';
import { Button } from 'react-science/ui';

import { useChromeT } from '../../i18n/ui/useT.ts';

import {
  READOUT_ASIDE_STYLE,
  READOUT_CHIP_STYLE,
  READOUT_FOOTER_STYLE,
  READOUT_LABEL_STYLE,
  READOUT_ROW_STYLE,
  READOUT_VALUE_STYLE,
  readoutCardStyle,
  readoutTitleStyle,
} from './overlayFigureStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/** One line of a {@link ReadoutCard}. */
export interface ReadoutCardRow {
  /** What tells the line apart from the others, kept from one render to the next. */
  key: string;
  /** What the value is. */
  label: ReactNode;
  /** The value, already written out — the card never formats a number itself. */
  value: ReactNode;
  /**
   * A colour chip before the label, for a line belonging to one series.
   * @default undefined
   */
  color?: string;
}

/** What {@link ReadoutCard} shows. */
export interface ReadoutCardProps {
  /** The first line, in bold: what the reader pointed at. */
  title: ReactNode;
  /**
   * What the title names, muted after it: a shape's kind beside the name the
   * person gave it.
   * @default undefined
   */
  aside?: ReactNode;
  /**
   * What stands first under the title: a picture of the thing pointed at, or
   * the sentence saying why there is none.
   * @default undefined
   */
  lead?: ReactNode;
  /** Everything the caller knows about it, in the caller's own order. */
  rows: readonly ReadoutCardRow[];
  /**
   * Sentences after the rows: what is wrong with it, what it hands on.
   * @default undefined
   */
  notes?: ReactNode;
  /**
   * A value may take several lines — its own line breaks kept, wrapped at the
   * card's widest — for a card whose values are sentences rather than
   * numbers: a step's settings. Labels never wrap.
   * @default false — every line on one line, a long label cut
   */
  wraps?: boolean;
  /**
   * A last line, ruled off and faint: what was left out.
   * @default undefined
   */
  footer?: ReactNode;
  /**
   * Dismiss the card: a × in its title line.
   * @default undefined — no ×
   */
  onDismiss?: () => void;
  /**
   * What the × is called.
   * @default the chrome's "Dismiss"
   */
  dismissLabel?: string;
  /**
   * The widest the card grows; a longer label is cut with an ellipsis.
   * @default 280
   */
  maxWidth?: number;
  /**
   * The narrowest it is.
   * @default undefined — as narrow as its lines
   */
  minWidth?: number;
  /**
   * Where its placer puts it, and what it does with the pointer.
   * @default undefined
   */
  style?: CSSProperties;
  /**
   * Hands over the card's element, for a placer that measures it
   * (`useMeasuredPlacement`'s `attach`).
   * @default undefined
   */
  ref?: (element: HTMLDivElement | null) => void;
  /**
   * Its role: a tooltip while it follows the pointer, a group once pinned.
   * @default 'tooltip'
   */
  role?: 'tooltip' | 'group';
  /**
   * Its accessible name, for a card that is a group.
   * @default undefined
   */
  ariaLabel?: string;
  /**
   * A press on the card: a pinned card over a figure keeps its presses from
   * the figure under it.
   * @default undefined
   */
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  /**
   * Value of the `data-testid` attribute of the card.
   * @default undefined
   */
  testId?: string;
}

/**
 * The family's designed card (rules/visual-identity.md): a title, ruled off,
 * what stands for the thing — its picture —, then a grid of muted labels and
 * bold, aligned values, never wrapped unless they are sentences (`wraps`),
 * and the sentences about it — the readout over a figure (`OverlayReadout`),
 * a pixel pinned, a shape hovered, a step of a workflow.
 * It draws the card only: where it goes is its placer's
 * (`useMeasuredPlacement`).
 * @param props - See {@link ReadoutCardProps}.
 * @returns The card.
 */
export function ReadoutCard(props: ReadoutCardProps): ReactElement {
  const {
    title,
    aside,
    lead,
    rows,
    notes,
    wraps = false,
    footer,
    onDismiss,
    dismissLabel,
    maxWidth = 280,
    minWidth,
    style,
    ref,
    role = 'tooltip',
    ariaLabel,
    onPointerDown,
    testId,
  } = props;
  const t = useChromeT();
  const { metrics } = useOverlaySurface();
  return (
    <div
      ref={ref}
      role={role}
      aria-label={ariaLabel}
      data-testid={testId}
      onPointerDown={onPointerDown}
      style={{
        ...readoutCardStyle(metrics),
        ...(wraps ? WRAPPING_CARD_STYLE : null),
        ...(minWidth === undefined ? null : { minWidth }),
        maxWidth,
        ...style,
      }}
    >
      <div style={readoutTitleStyle(metrics)}>
        <span>
          {title}
          {aside === undefined ? null : (
            <span style={READOUT_ASIDE_STYLE}> {aside}</span>
          )}
        </span>
        {onDismiss === undefined ? null : (
          <Button
            variant="minimal"
            size="small"
            icon="cross"
            aria-label={dismissLabel ?? t('overlay.dismiss')}
            onClick={onDismiss}
          />
        )}
      </div>
      {lead}
      {rows.map((row) => (
        <div key={row.key} style={READOUT_ROW_STYLE}>
          {row.color === undefined ? null : (
            <span style={{ ...READOUT_CHIP_STYLE, background: row.color }} />
          )}
          <span style={wraps ? WHOLE_LABEL_STYLE : READOUT_LABEL_STYLE}>
            {row.label}
          </span>
          <span style={wraps ? WRAPPED_VALUE_STYLE : READOUT_VALUE_STYLE}>
            {row.value}
          </span>
        </div>
      ))}
      {notes}
      {footer === undefined ? null : (
        <div style={READOUT_FOOTER_STYLE}>{footer}</div>
      )}
    </div>
  );
}

/** A card whose values wrap: its lines break where they must. */
const WRAPPING_CARD_STYLE = { whiteSpace: 'normal' } as const;

/** A label beside a value that wraps: kept whole, on its line. */
const WHOLE_LABEL_STYLE = {
  ...READOUT_LABEL_STYLE,
  flex: 'none',
  whiteSpace: 'nowrap',
} as const;

/** A value that wraps: its own breaks kept, aligned on the right as a number is. */
const WRAPPED_VALUE_STYLE = {
  ...READOUT_VALUE_STYLE,
  flex: '1 1 0',
  minWidth: 0,
  textAlign: 'right',
  whiteSpace: 'pre-line',
  overflowWrap: 'anywhere',
} as const;
