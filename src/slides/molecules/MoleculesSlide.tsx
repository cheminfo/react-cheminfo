import type { ReactElement } from 'react';
import { Suspense, lazy, useMemo } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { parseMoleculeList } from '../core/moleculeList.ts';
import { takeSlideMarker } from '../core/slideMarker.ts';
import {
  FigureLoading,
  FigureMessage,
  FigureSlide,
} from '../ui/FigureSlide.tsx';
import type { SlideLayoutProps } from '../ui/Slide.tsx';

// The drawing is the one file that value-imports openchemlib and react-ocl, so
// a deck that shows no structure never loads them.
const MoleculeGrid = lazy(async () => {
  const { MoleculeGrid: Grid } = await import('./MoleculeGrid.tsx');
  return { default: Grid };
});

/**
 * The `molecules` layout: the slide's text beside up to six structures, each
 * over its name, listed one per line in a `<!-- molecules: … -->` marker as
 * `<name> <SMILES>`. Every structure of a slide is drawn with one bond length,
 * so their sizes compare as the molecules' do.
 * @param props - The slide, as the player hands it to every layout.
 * @returns The slide.
 */
export function MoleculesSlide(props: SlideLayoutProps): ReactElement {
  const t = useChromeT();
  const { value, body } = takeSlideMarker(props.slide.body, 'molecules');
  const molecules = useMemo(() => parseMoleculeList(value), [value]);

  const figure =
    molecules.length === 0 ? (
      <FigureMessage>{t('slides.listMolecules')}</FigureMessage>
    ) : (
      <Suspense fallback={<FigureLoading />}>
        <MoleculeGrid molecules={molecules} />
      </Suspense>
    );

  return <FigureSlide {...props} body={body} figure={figure} />;
}
