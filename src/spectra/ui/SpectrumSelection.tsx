import { Checkbox, InputGroup } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

/** What {@link SpectrumSelection} edits. */
export interface SpectrumSelectionProps {
  /**
   * The ids the stage is asked for.
   * @default undefined — every spectrum the processor holds is used
   */
  value?: readonly string[];
  /** Called with the new list, or with undefined for every spectrum. */
  onChange: (ids: string[] | undefined) => void;
  /**
   * The ids the processor holds, so they are ticked rather than typed.
   * @default undefined — the ids are typed in as a comma-separated list
   */
  spectrumIds?: readonly string[];
}

/**
 * Which spectra the stage is run over.
 *
 * Ticking every box hands up nothing at all rather than a list of every id,
 * because the two are not the same thing: a list goes stale the moment another
 * spectrum is loaded, while no list means whatever the processor holds now. An
 * id the settings name and the processor does not hold gets a box of its own
 * rather than being left out, since a box nobody can see is one the next click
 * silently throws away.
 * @param props - See {@link SpectrumSelectionProps}.
 * @returns The boxes, or the field the ids are typed into.
 */
export function SpectrumSelection(props: SpectrumSelectionProps): ReactElement {
  const { value, onChange, spectrumIds } = props;
  const text = asText(value);
  const [draft, setDraft] = useState(() => ({ text, held: text }));

  // The settings changed from somewhere else — a preset, a reset, a pasted
  // configuration — so the box has to follow rather than hold the old text.
  if (draft.held !== text) setDraft({ text, held: text });

  if (spectrumIds === undefined) {
    return (
      <label style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>Spectra</span>
        <InputGroup
          size="small"
          fill
          aria-label="Spectra"
          placeholder="every spectrum the processor holds"
          spellCheck={false}
          autoComplete="off"
          value={draft.text}
          onValueChange={(typed) => {
            setDraft({ text: typed, held: text });
            onChange(readIds(typed));
          }}
        />
        <span style={HELP_STYLE}>
          One id per entry, separated by commas. Leave it empty for every
          spectrum.
        </span>
      </label>
    );
  }

  const chosen = new Set(value ?? spectrumIds);
  const boxes = withHeld(spectrumIds, value);
  const held = new Set(spectrumIds);
  return (
    <div style={FIELD_STYLE}>
      <span style={LABEL_STYLE}>Spectra</span>
      {boxes.map((id) => (
        <Checkbox
          key={id}
          style={BOX_STYLE}
          label={
            held.has(id) ? id : `${id} — not a spectrum the processor holds`
          }
          checked={chosen.has(id)}
          onChange={(event) => {
            onChange(
              toggle(
                boxes,
                spectrumIds,
                chosen,
                id,
                event.currentTarget.checked,
              ),
            );
          }}
        />
      ))}
      <span style={HELP_STYLE}>
        With every box ticked the settings name no spectrum at all, so one
        loaded later is included too.
      </span>
    </div>
  );
}

/**
 * The ids as the box shows them.
 * @param ids - What the settings hold.
 * @returns Their text, empty when the settings name none.
 */
function asText(ids: readonly string[] | undefined): string {
  return ids === undefined ? '' : ids.join(', ');
}

/**
 * The text as a list of ids.
 * @param text - What was typed.
 * @returns The ids, or undefined when nothing is left once trimmed.
 */
function readIds(text: string): string[] | undefined {
  const ids = text
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '');
  return ids.length === 0 ? undefined : ids;
}

/**
 * Every id that gets a box: the processor's, then any the settings add to them.
 * @param spectrumIds - Every id the processor holds.
 * @param value - The ids the settings name.
 * @returns The processor's ids first, so the order never moves under a click.
 */
function withHeld(
  spectrumIds: readonly string[],
  value: readonly string[] | undefined,
): string[] {
  const boxes = [...spectrumIds];
  const held = new Set(spectrumIds);
  for (const id of value ?? []) {
    if (!held.has(id)) {
      held.add(id);
      boxes.push(id);
    }
  }
  return boxes;
}

/**
 * The selection with one spectrum added or taken out.
 * @param boxes - Every id drawn, in the order it is drawn.
 * @param spectrumIds - Every id the processor holds.
 * @param chosen - The ids ticked now.
 * @param id - Which one was clicked.
 * @param checked - Whether it is now ticked.
 * @returns The new list, or undefined once it is exactly what the processor holds.
 */
function toggle(
  boxes: readonly string[],
  spectrumIds: readonly string[],
  chosen: ReadonlySet<string>,
  id: string,
  checked: boolean,
): string[] | undefined {
  const next: string[] = [];
  for (const held of boxes) {
    const keep = held === id ? checked : chosen.has(held);
    if (keep) next.push(held);
  }
  if (next.length !== spectrumIds.length) return next;
  for (let index = 0; index < next.length; index++) {
    if (next[index] !== spectrumIds[index]) return next;
  }
  return undefined;
}

const FIELD_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
} as const satisfies CSSProperties;

const LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted, #5b6875)',
} as const satisfies CSSProperties;

const BOX_STYLE = {
  margin: 0,
  fontSize: 12,
} as const satisfies CSSProperties;

const HELP_STYLE = {
  fontSize: 11,
  color: 'var(--text-faint, #8a96a3)',
} as const satisfies CSSProperties;
