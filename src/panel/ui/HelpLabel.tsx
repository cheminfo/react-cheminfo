import type { HelpText } from '../../help/ui/HelpBody.tsx';
import { HelpIcon } from '../../help/ui/HelpIcon.tsx';
import { labelStyle } from '../core/panelStyles.ts';

/** What the label names, and what its question mark answers. */
export interface HelpLabelProps {
  /** What the value is, written small and quiet above it. */
  label: string;
  /** The sentences the question mark carries, one string per paragraph. */
  help: HelpText;
}

/**
 * A panel label with a question mark beside it.
 *
 * The label is the half that has to be read at a glance — it names the field
 * under it — so it stays plain, and everything that would otherwise be a
 * paragraph of instructions under the control hangs off the glyph beside it.
 *
 * The help opens to the side rather than above, and that is not a preference:
 * these glyphs sit in a panel beside the very thing they explain — a picture, a
 * chart, a spectrum — and a tooltip placed over the top of a control covers the
 * subject of its own first sentence.
 * @param props - Component props.
 * @returns The label row.
 */
export function HelpLabel(props: HelpLabelProps) {
  const { label, help } = props;

  return (
    <div style={rowStyle}>
      <span style={labelStyle}>{label}</span>
      <HelpIcon
        content={{ body: help }}
        label={`What ${label} means`}
        placement="left"
        size={12}
      />
    </div>
  );
}

const rowStyle = { display: 'flex', alignItems: 'center', gap: 4 } as const;
