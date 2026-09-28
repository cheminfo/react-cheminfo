import type { ActivityBarItemProps } from 'react-science/ui';

/**
 * The panels the side of the viewer can hold, in the order their icons stack.
 *
 * One frozen list read by both the activity bar and the panel stack, so a panel
 * switched off and on again comes back where it was rather than at the end.
 */
export const irSidePanels = [
  { id: 'spectra', title: 'Spectra', icon: 'timeline-line-chart' },
  { id: 'bands', title: 'Bands', icon: 'th-list' },
  { id: 'metadata', title: 'Acquisition', icon: 'properties' },
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  icon: ActivityBarItemProps['icon'];
}>;

/** Identity of one of the panels the activity bar offers. */
export type IrSidePanelId = (typeof irSidePanels)[number]['id'];
