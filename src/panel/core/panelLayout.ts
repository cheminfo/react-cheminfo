/**
 * How each panel of an editor stands: left out of the rail, offered by its
 * icon, shown folded in the stack, or shown open. The four are what a
 * workspace decides for every panel, and what a settings dialog sets.
 */
export type PanelStatus = 'hidden' | 'available' | 'folded' | 'open';

/** The statuses, from the least shown to the most. */
export const PANEL_STATUSES: readonly PanelStatus[] = [
  'hidden',
  'available',
  'folded',
  'open',
];

/** Which panels an editor shows, folds and leaves out, as it keeps them. */
export interface PanelLayout<TId extends string = string> {
  /** The panels in the stack, folded or not. */
  open: readonly TId[];
  /** The panels of the stack that are folded. */
  folded: readonly TId[];
  /** The panels whose icon the rail does not carry. */
  hidden: readonly TId[];
}

/**
 * Whether a value is one of the {@link PANEL_STATUSES}.
 * @param value - The value, read from anywhere.
 * @returns True for a status.
 */
export function isPanelStatus(value: unknown): value is PanelStatus {
  return PANEL_STATUSES.includes(value as PanelStatus);
}

/**
 * How one panel stands in a layout. A panel both hidden and open reads as
 * hidden: what the rail does not offer is not shown either.
 * @param layout - The layout.
 * @param id - The panel.
 * @returns Its status.
 */
export function panelStatusOf<TId extends string>(
  layout: PanelLayout<TId>,
  id: TId,
): PanelStatus {
  if (layout.hidden.includes(id)) return 'hidden';
  if (!layout.open.includes(id)) return 'available';
  return layout.folded.includes(id) ? 'folded' : 'open';
}

/**
 * The layout with one panel set to a status, the others as they were.
 * @param layout - The layout.
 * @param id - The panel.
 * @param status - Its new status.
 * @returns The new layout; the same one when nothing changes.
 */
export function withPanelStatus<TId extends string>(
  layout: PanelLayout<TId>,
  id: TId,
  status: PanelStatus,
): PanelLayout<TId> {
  if (panelStatusOf(layout, id) === status) return layout;
  const shown = status === 'folded' || status === 'open';
  return {
    open: shown ? including(layout.open, id) : excluding(layout.open, id),
    folded:
      status === 'folded'
        ? including(layout.folded, id)
        : excluding(layout.folded, id),
    hidden:
      status === 'hidden'
        ? including(layout.hidden, id)
        : excluding(layout.hidden, id),
  };
}

function including<TId>(ids: readonly TId[], id: TId): readonly TId[] {
  return ids.includes(id) ? ids : [...ids, id];
}

function excluding<TId>(ids: readonly TId[], id: TId): readonly TId[] {
  return ids.includes(id) ? ids.filter((other) => other !== id) : ids;
}
