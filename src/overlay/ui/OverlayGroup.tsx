import type { ReactElement, ReactNode } from 'react';
import { useId } from 'react';

import type { HelpContent } from '../../help/ui/HelpBody.tsx';
import { HelpTooltip } from '../../help/ui/HelpTooltip.tsx';

import {
  overlayGroupStyle,
  overlayGroupTitleStyle,
} from './overlayControlStyles.ts';
import { useOverlayPanelShape } from './overlayPanelContext.ts';
import {
  overlaySectionHeadingStyle,
  overlaySectionStyle,
} from './overlayPanelStyles.ts';
import {
  OVERLAY_HELP_NAME_STYLE,
  overlayStackedRowStyle,
} from './overlayRowStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/** What {@link OverlayGroup} needs. */
export interface OverlayGroupProps {
  /** The controls it holds. */
  children: ReactNode;
  /**
   * What the cluster is about, written over it in small capitals. In a panel
   * this is the section heading, and it is worth reaching for only past about
   * four rows: three settings under two headings is a panel that has been
   * filed rather than laid out. Nothing enforces that — a panel is allowed to
   * be wrong about its own length — but it is the line to hold.
   * @default undefined — the controls are drawn with no heading
   */
  label?: string;
  /**
   * What the cluster is for, in a sentence. Like a control's own help it hangs
   * off the heading, which is underlined with dots to say so.
   * @default undefined
   */
  help?: HelpContent;
  /**
   * Whether a hairline is drawn above the heading. Turn it off on the first
   * section of a panel: a rule immediately under the panel header's own rule
   * reads as a doubled line rather than as a division. Only consulted in a
   * panel.
   * @default true
   */
  divider?: boolean;
  /**
   * How the controls inside are stacked. A row wraps as one unit, so a cluster
   * never breaks across two lines of the card mid-thought. Only consulted on a
   * bar; a section of a panel is always a column.
   * @default 'row'
   */
  direction?: 'row' | 'column';
}

/**
 * Controls that answer one question, kept together.
 *
 * On a bar, two controls that only make sense read together — a mode and the
 * number it takes — have to move together as the card reflows, or the reader
 * meets the number on a line of its own with nothing saying what it counts.
 *
 * In a panel it is a section instead: a small-capitals heading over a hairline
 * that gives the eye somewhere to rest on the way down a long list. A heading
 * is worth adding once the cluster's idea has a name the names inside it do
 * not already spell out.
 * @param props - See {@link OverlayGroupProps}.
 * @returns The cluster.
 */
export function OverlayGroup(props: OverlayGroupProps): ReactElement {
  const { children, label, help, divider = true, direction = 'row' } = props;
  const { metrics } = useOverlaySurface();
  const panel = useOverlayPanelShape();
  const headingId = useId();

  if (panel !== undefined) {
    if (label === undefined) {
      return <div style={overlaySectionStyle(metrics)}>{children}</div>;
    }
    return (
      <div
        role="group"
        aria-labelledby={headingId}
        style={overlaySectionStyle(metrics)}
      >
        <Explained help={help}>
          <span
            id={headingId}
            className={help === undefined ? undefined : 'help-name'}
            tabIndex={help === undefined ? undefined : 0}
            style={overlaySectionHeadingStyle(metrics, {
              divider,
              help: help !== undefined,
            })}
          >
            {label}
          </span>
        </Explained>
        {children}
      </div>
    );
  }

  const controls = (
    <div style={overlayGroupStyle(metrics, direction)}>{children}</div>
  );

  if (label === undefined) return controls;

  return (
    <div
      role="group"
      aria-labelledby={headingId}
      style={overlayStackedRowStyle(metrics)}
    >
      <Explained help={help}>
        <span
          id={headingId}
          className={help === undefined ? undefined : 'help-name'}
          tabIndex={help === undefined ? undefined : 0}
          style={
            help === undefined
              ? overlayGroupTitleStyle(metrics)
              : {
                  ...overlayGroupTitleStyle(metrics),
                  ...OVERLAY_HELP_NAME_STYLE,
                }
          }
        >
          {label}
        </span>
      </Explained>
      {controls}
    </div>
  );
}

/**
 * A heading, with its explanation behind it when it has one.
 *
 * The two shapes a group takes both need this, and writing the conditional
 * twice is how one of them quietly loses its help.
 * @param props - The heading and what it explains.
 * @param props.help - The explanation, or nothing.
 * @param props.children - The heading.
 * @returns The heading.
 */
function Explained(props: {
  help: HelpContent | undefined;
  children: ReactNode;
}): ReactElement {
  const { help, children } = props;
  if (help === undefined) return <>{children}</>;
  return <HelpTooltip content={help}>{children}</HelpTooltip>;
}
