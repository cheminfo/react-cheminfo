/**
 * What the clicks on a periodic table do, behind one question mark.
 *
 * The table picks by row, by column, by block and by element, and the corner
 * that takes everything back only shows itself when pointed at. None of that is
 * written on the table, so the gestures are listed here, one to a line, the way
 * the 3D viewer lists its own.
 */

import { Classes } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { HelpTooltip } from '../../help/ui/HelpTooltip.tsx';
import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { OverlayIconButton } from '../../overlay/ui/OverlayIconButton.tsx';
import { TOKEN } from '../../tokens/core/familyTokens.ts';

/** What {@link PeriodicTableHelp} needs. */
export interface PeriodicTableHelpProps {
  /**
   * Which side the card opens on.
   * @default 'bottom'
   */
  placement?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * The question mark that explains how to pick elements on the table.
 *
 * It is the same button as `FigureDownload`'s, so the two sit side by side in a
 * row of controls at one size and one ink.
 * @param props - See {@link PeriodicTableHelpProps}.
 * @returns The glyph, with its card.
 */
export function PeriodicTableHelp(props: PeriodicTableHelpProps): ReactElement {
  const { placement = 'bottom' } = props;
  const t = useChromeT();
  const title = t('periodic.help.title');

  return (
    <HelpTooltip
      content={{ title, body: <PeriodicTableGestures /> }}
      placement={placement}
      width={CARD_WIDTH}
      popoverClassName="help-tooltip--wide"
    >
      <OverlayIconButton
        icon="help"
        label={title}
        untitled
        testId="periodic-table-help"
      />
    </HelpTooltip>
  );
}

/** One thing on the table, and what a plain and a modified click on it do. */
interface Target {
  /** What is clicked; absent for the arrow keys, which are drawn as caps. */
  name?: ChromeKey;
  /** Keys drawn instead of a name. */
  keys?: readonly string[];
  click: ChromeKey;
  /** What Cmd or Ctrl and a click does; absent when it does nothing more. */
  modClick?: ChromeKey;
}

const TARGETS: readonly Target[] = [
  {
    name: 'periodic.help.element',
    click: 'periodic.help.elementClick',
    modClick: 'periodic.help.elementMod',
  },
  {
    name: 'periodic.help.number',
    click: 'periodic.help.numberClick',
    modClick: 'periodic.help.runMod',
  },
  {
    name: 'periodic.help.block',
    click: 'periodic.help.blockClick',
    modClick: 'periodic.help.runMod',
  },
  { name: 'periodic.help.corner', click: 'periodic.help.cornerClick' },
  { keys: ['←', '↑', '→', '↓'], click: 'periodic.help.arrowsClick' },
];

/**
 * The gestures the table answers to: what is clicked, then what a plain click
 * and a click with Cmd or Ctrl held each do to it.
 * @returns The table of gestures, and the line saying what the dimming means.
 */
export function PeriodicTableGestures(): ReactElement {
  const t = useChromeT();
  const modifier = isMacPlatform() ? '⌘' : t('periodic.help.ctrl');

  return (
    <div style={LIST_STYLE}>
      <table style={TABLE_STYLE}>
        <thead>
          <tr>
            <th aria-hidden="true" />
            <th style={HEAD_STYLE}>{t('periodic.help.click')}</th>
            <th style={HEAD_STYLE}>
              <span style={KEYS_STYLE}>
                <kbd className={Classes.KEY}>{modifier}</kbd>
                {t('periodic.help.modClick')}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {TARGETS.map(({ name, keys, click, modClick }) => (
            <tr key={click} style={ROW_STYLE}>
              <th scope="row" style={TARGET_STYLE}>
                {name === undefined ? (
                  <span style={KEYS_STYLE}>
                    {keys?.map((key) => (
                      <kbd key={key} className={Classes.KEY}>
                        {key}
                      </kbd>
                    ))}
                  </span>
                ) : (
                  t(name)
                )}
              </th>
              <td style={CELL_STYLE}>{t(click)}</td>
              <td style={CELL_STYLE}>
                {modClick === undefined ? (
                  <span className={Classes.TEXT_DISABLED}>—</span>
                ) : (
                  t(modClick)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={Classes.TEXT_MUTED} style={NOTE_STYLE}>
        {t('periodic.help.note')}
      </p>
    </div>
  );
}

/**
 * Whether the page runs on a Mac.
 * @returns True there, where the table reads ⌘ rather than Ctrl.
 */
function isMacPlatform(): boolean {
  return typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
}

/** The wide card's measure, less its padding. */
const CARD_WIDTH = 436;

const LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  marginTop: 4,
} as const satisfies CSSProperties;

const TABLE_STYLE = {
  borderCollapse: 'collapse',
  width: '100%',
} as const satisfies CSSProperties;

const HEAD_STYLE = {
  color: TOKEN.textMuted,
  fontSize: 11.5,
  fontWeight: 600,
  padding: '0 8px 6px',
  textAlign: 'left',
  whiteSpace: 'nowrap',
} as const satisfies CSSProperties;

const ROW_STYLE = {
  borderTop: `1px solid ${TOKEN.border}`,
} as const satisfies CSSProperties;

const TARGET_STYLE = {
  fontWeight: 600,
  padding: '6px 8px 6px 0',
  textAlign: 'left',
  verticalAlign: 'top',
  width: '34%',
} as const satisfies CSSProperties;

const CELL_STYLE = {
  padding: '6px 8px',
  verticalAlign: 'top',
  width: '33%',
} as const satisfies CSSProperties;

const KEYS_STYLE = {
  alignItems: 'center',
  display: 'inline-flex',
  gap: 3,
  whiteSpace: 'nowrap',
} as const satisfies CSSProperties;

const NOTE_STYLE = { margin: 0 } as const satisfies CSSProperties;
