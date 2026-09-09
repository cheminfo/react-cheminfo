import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { PcaLike } from '../core/pcaLike.ts';
import type { PcaResultOptions } from '../core/pcaResult.ts';
import { pcaResult } from '../core/pcaResult.ts';

import { ProjectionViewer } from './ProjectionViewer.tsx';
import type { ProjectionViewerProps } from './projectionViewerProps.ts';

/** What {@link PcaViewer} needs on top of what every projection viewer takes. */
export interface PcaViewerProps
  extends
    Omit<ProjectionViewerProps, 'result'>,
    Omit<PcaResultOptions, 'method'> {
  /**
   * The fitted model. It is described structurally, so `ml-pca`'s `PCA`
   * satisfies it as it is and this package never imports `ml-pca`.
   */
  pca: PcaLike;
}

/**
 * A fitted principal component analysis, shown as a map a reader can
 * interrogate.
 *
 * It is {@link ProjectionViewer} with one call in front of it: everything the
 * four tabs draw is built by `pcaResult` into the same record a k-means or a
 * UMAP run fills in by hand, and no tab, no layer and no callback below this
 * line knows what a principal component is.
 *
 * `projected` is the reason to reach for this rather than call `pcaResult`
 * first: samples handed to it took no part in choosing where the axes point,
 * so the map draws them hollow and says so, and a reader can see at a glance
 * which points the model has already accounted for and which it is being asked
 * about.
 * @param props - See {@link PcaViewerProps}.
 * @returns The viewer.
 */
export function PcaViewer(props: PcaViewerProps): ReactElement {
  const {
    pca,
    rows,
    projected,
    variables,
    scores,
    scaled,
    count,
    valueLabel,
    signConvention,
    ...viewer
  } = props;

  const result = useMemo(
    () =>
      pcaResult(pca, {
        rows,
        projected,
        variables,
        scores,
        scaled,
        count,
        valueLabel,
        signConvention,
      }),
    [
      count,
      pca,
      projected,
      rows,
      scaled,
      scores,
      signConvention,
      valueLabel,
      variables,
    ],
  );

  return <ProjectionViewer {...viewer} result={result} />;
}
