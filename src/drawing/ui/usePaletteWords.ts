import { useChromeT } from '../../i18n/ui/useT.ts';

/** What an editor's palette puts its entries on, as its tooltips name it. */
export type PaletteCanvas = 'bench' | 'figure' | 'drawing';

/** The sentences a palette's entries say how they are added in. */
export interface PaletteWords {
  /**
   * An entry's tooltip: its name, then the ways to add it.
   * @param name - The entry's name, as the catalog writes it; its first
   * letter is set in capitals.
   * @param canvas - What the palette puts it on.
   * @returns `Resistor: drag it onto the bench, or click it and then the
   * bench. Double-click adds it at once.`
   */
  tooltip: (name: string, canvas: PaletteCanvas) => string;
  /**
   * The ways to add an entry, as a sentence of its own, written after a
   * sentence saying what the entry does.
   * @param canvas - What the palette puts it on.
   * @returns `Drag it onto the bench, or click it and then the bench.
   * Double-click adds it at once.`
   */
  gestures: (canvas: PaletteCanvas) => string;
}

/**
 * The sentences every editor's palette says how an entry is added in, in the
 * language of the page: `<Name>: drag it onto the <canvas>, or click it and
 * then the <canvas>. Double-click adds it at once.`
 * @returns See {@link PaletteWords}.
 */
export function usePaletteWords(): PaletteWords {
  const t = useChromeT();
  return {
    tooltip: (name, canvas) => {
      const lead = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
      if (canvas === 'figure') {
        return t('editor.palette.tooltip.figure', { name: lead });
      }
      if (canvas === 'drawing') {
        return t('editor.palette.tooltip.drawing', { name: lead });
      }
      return t('editor.palette.tooltip.bench', { name: lead });
    },
    gestures: (canvas) => {
      if (canvas === 'figure') return t('editor.palette.gestures.figure');
      if (canvas === 'drawing') return t('editor.palette.gestures.drawing');
      return t('editor.palette.gestures.bench');
    },
  };
}
