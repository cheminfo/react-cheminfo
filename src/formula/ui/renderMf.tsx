import type { ReactNode } from 'react';
import { MF } from 'react-mf';

/**
 * One molecular formula of a site's prose, drawn by `react-mf`: what
 * `<GlossaryProvider renderMf>` is handed, so every `{{C6H12O6}}` of a step, a
 * question, a hint or a definition shows its subscripts and its charge.
 * @param mf - What was written between the braces.
 * @returns The formula, with its subscripts.
 */
export function renderMf(mf: string): ReactNode {
  return <MF mf={mf} />;
}
