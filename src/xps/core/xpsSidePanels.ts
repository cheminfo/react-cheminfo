import type { ActivityBarItemProps } from 'react-science/ui';

/**
 * The panels the activity bar offers, in the order their icons are stacked.
 *
 * Declared once and read by both the activity bar and the panel stack, so a
 * panel always comes back where it was rather than at the bottom of whatever
 * order the toggles happened to be fired in.
 *
 * The order is the order a surface analysis is worked through: what was loaded,
 * what the file says about how it was acquired, which peaks are in it, which
 * elements those peaks could be, what the fit decomposed them into, and what
 * that fit makes the composition.
 */
export const xpsSidePanels = [
  { id: 'spectra', title: 'Spectra', icon: 'timeline-line-chart' },
  { id: 'metadata', title: 'Acquisition', icon: 'properties' },
  { id: 'peaks', title: 'Peaks', icon: 'th-list' },
  { id: 'elements', title: 'Elements', icon: 'search' },
  { id: 'components', title: 'Fit', icon: 'layers' },
  { id: 'composition', title: 'Composition', icon: 'pie-chart' },
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  icon: ActivityBarItemProps['icon'];
}>;

/** Identity of one of the panels the activity bar offers. */
export type XpsSidePanelId = (typeof xpsSidePanels)[number]['id'];

/**
 * Identity of any panel the side can hold: one of the viewer's own, or one a
 * host added to them. Still a union with the viewer's own ids, so those keep
 * autocompleting where a plain `string` would swallow them.
 */
export type XpsPanelId = XpsSidePanelId | (string & Record<never, never>);
