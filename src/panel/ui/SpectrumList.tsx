/**
 * The list of spectra in a viewer's Spectra panel: the rows, walked with the
 * arrows once the list holds the focus, the selected one kept in view.
 */

import type { ReactElement, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

import { useListKeyboardNavigation } from '../../hooks/ui/useListKeyboardNavigation.ts';
import { panelBodyStyle } from '../core/panelStyles.ts';

/** Props of {@link SpectrumList}. */
export interface SpectrumListProps<TSpectrum extends { id: string }> {
  /** Every spectrum open, in the order listed. */
  spectra: readonly TSpectrum[];
  /** The one selected, or `null`. */
  selectedId: string | null;
  /**
   * Select a spectrum, as the arrows walk the list.
   * @param id - Its identity.
   */
  onSelect: (id: string) => void;
  /** What the list is called. */
  label: string;
  /** What the panel says while nothing is open. */
  empty: ReactNode;
  /**
   * One row, an `<li>` carrying `data-selected` when it is the one selected.
   * @param spectrum - The spectrum.
   * @returns The row.
   */
  children: (spectrum: TSpectrum) => ReactNode;
}

/**
 * The list is reached by Tab, or by clicking a row, and then walked with the
 * arrows: on the list rather than the page, so two viewers on one page do not
 * both answer the same key.
 * @param props - See {@link SpectrumListProps}.
 * @returns The panel body holding the list.
 */
export function SpectrumList<TSpectrum extends { id: string }>(
  props: SpectrumListProps<TSpectrum>,
): ReactElement {
  const { spectra, selectedId, onSelect, label, empty, children } = props;
  const bodyRef = useRef<HTMLDivElement>(null);

  let selectedIndex = -1;
  for (let index = 0; index < spectra.length; index++) {
    if (spectra[index]?.id === selectedId) {
      selectedIndex = index;
      break;
    }
  }
  const onKeyDown = useListKeyboardNavigation({
    length: spectra.length,
    selectedIndex,
    onSelect: (index) => {
      const spectrum = spectra[index];
      if (spectrum !== undefined) onSelect(spectrum.id);
    },
  });

  useEffect(() => {
    if (bodyRef.current === null || selectedId === null) return;
    bodyRef.current
      .querySelector('[data-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  return (
    <div ref={bodyRef} style={panelBodyStyle}>
      {spectra.length === 0 ? (
        empty
      ) : (
        <ul
          aria-label={label}
          tabIndex={0}
          style={LIST_STYLE}
          onKeyDown={onKeyDown}
        >
          {spectra.map((spectrum) => children(spectrum))}
        </ul>
      )}
    </div>
  );
}

const LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  margin: 0,
  padding: 0,
  listStyle: 'none',
} as const;
