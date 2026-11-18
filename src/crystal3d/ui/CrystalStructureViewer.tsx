/**
 * A crystal from its CIF, in 3D, with the chips that say how it is drawn.
 *
 * ```tsx
 * import { CrystalStructureViewer } from 'react-cheminfo/crystal3d';
 *
 * <CrystalStructureViewer cif={text} name="Aspirin" />;
 * ```
 *
 * Reading the file, filling the cell and drawing it all happen behind a
 * `React.lazy` boundary, so a page that never shows a crystal downloads
 * neither the space groups nor molstar.
 */

import { Spinner, SpinnerSize } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { Suspense, lazy } from 'react';

import type { CrystalStructureViewerProps } from './crystalStructureViewerProps.ts';

const CrystalStructureView = lazy(async () => {
  const module = await import('./CrystalStructureView.tsx');
  return { default: module.CrystalStructureView };
});

/**
 * The crystal, its chips and its caption.
 * @param props - See {@link CrystalStructureViewerProps}.
 * @returns The view, once its code has arrived.
 */
export function CrystalStructureViewer(
  props: CrystalStructureViewerProps,
): ReactElement {
  return (
    <Suspense fallback={<Spinner size={SpinnerSize.STANDARD} />}>
      <CrystalStructureView {...props} />
    </Suspense>
  );
}
