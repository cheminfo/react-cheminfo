/**
 * The s, d, p and f labels, set in the cells no element occupies.
 */

import type { CSSProperties, MouseEvent, ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { ElementRange } from '../core/layout.ts';
import { BLOCK_LABELS } from '../core/layout.ts';

import { headerButtonStyle, headerStyle } from './headerStyles.ts';
import { ofWidth } from './unit.ts';

/** What {@link BlockStrip} needs. */
interface BlockStripProps {
  /** Called with the block whose label was clicked. */
  onSelectRange: (range: ElementRange) => void;
}

/**
 * A thin rule under each block with its letter on it, so the four blocks are a
 * click each, like a period or a group, without a toolbar repeating the table.
 * The f label stands beside the two rows it names, its rule running down them.
 * @param props - See {@link BlockStripProps}.
 * @returns One button per block, placed on the grid with the header offset.
 */
export function BlockStrip(props: BlockStripProps): ReactElement {
  const { onSelectRange } = props;
  const t = useChromeT();
  return (
    <>
      {BLOCK_LABELS.map(({ block, cell, columnSpan, rowSpan }) => {
        const title = t('periodic.block', { block });
        const vertical = rowSpan > 1;
        return (
          <button
            key={block}
            type="button"
            aria-label={title}
            title={title}
            data-block={block}
            onClick={(event: MouseEvent) => {
              onSelectRange({
                kind: 'block',
                value: block,
                additive: event.metaKey || event.ctrlKey,
              });
            }}
            style={{
              ...headerStyle,
              ...headerButtonStyle,
              gridColumn: `${String(cell.column + 1)} / span ${String(columnSpan)}`,
              gridRow: `${String(cell.row + 1)} / span ${String(rowSpan)}`,
              justifyContent: vertical ? 'flex-end' : 'center',
              gap: '0.3em',
              // Quieter than the period and group numbers: a block is a
              // shortcut found on hover, not a label the table is read by.
              color: TOKEN.textFaint,
              fontSize: `max(0.4rem, ${ofWidth(1.05)})`,
            }}
          >
            {vertical ? null : <span style={horizontalRuleStyle} />}
            <span>{block}</span>
            <span style={vertical ? verticalRuleStyle : horizontalRuleStyle} />
          </button>
        );
      })}
    </>
  );
}

const horizontalRuleStyle = {
  borderTop: `1px solid ${TOKEN.border}`,
  flex: '1 1 0',
} as const satisfies CSSProperties;

const verticalRuleStyle = {
  alignSelf: 'stretch',
  borderLeft: `1px solid ${TOKEN.border}`,
} as const satisfies CSSProperties;
