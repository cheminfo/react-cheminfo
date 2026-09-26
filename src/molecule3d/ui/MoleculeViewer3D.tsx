/**
 * A molecule in three dimensions, with a toolbar to measure it, turn it, wrap
 * it in its surface and restyle it — and what to say when there cannot be one.
 *
 * The WebGL probe runs before molstar is touched, so a machine without WebGL
 * gets an explanation instead of a blank rectangle, and the canvas sits behind
 * `React.lazy`, so a page that never reaches it never downloads molstar.
 *
 * ```tsx
 * import { MoleculeViewer3D } from 'react-cheminfo/molecule3d';
 *
 * <MoleculeViewer3D
 *   molfile={{ format: 'mol', data: molfile }}
 *   tools={{ measure: false }}
 * />;
 * ```
 */

import { Callout } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { Suspense, lazy, useState } from 'react';

// Deep import on purpose: `capability.ts` imports nothing, while the canvas
// pulls molstar in — which is exactly what this probe exists to avoid.
import { useChromeT } from '../../i18n/ui/useT.ts';
import { probeViewerCapability } from '../../orbital/ui/capability.ts';

import type { MoleculeViewer3DProps } from './moleculeViewer3DProps.ts';

const MoleculeCanvas3D = lazy(async () => {
  const module = await import('./MoleculeCanvas3D.tsx');
  return { default: module.MoleculeCanvas3D };
});

/**
 * The 3D molecule viewer.
 * @param props - See {@link MoleculeViewer3DProps}.
 * @returns The viewer, or an explanation of why this machine cannot show one.
 */
export function MoleculeViewer3D(props: MoleculeViewer3DProps): ReactElement {
  const { fallback, renderUnsupported, ...canvas } = props;
  const t = useChromeT();
  const [capability] = useState(probeViewerCapability);
  const [failure, setFailure] = useState<string | null>(null);

  if (!capability.supported) {
    return (
      <Callout intent="warning" compact>
        {renderUnsupported?.(capability) ??
          t.or(`viewer.capability.${capability.reason}`, capability.message)}
      </Callout>
    );
  }

  return (
    <div style={ROOT_STYLE}>
      <Suspense
        fallback={
          <div style={NOTE_STYLE}>
            {fallback ?? t('molecule3d.loadingViewer')}
          </div>
        }
      >
        <MoleculeCanvas3D {...canvas} onFailureChange={setFailure} />
      </Suspense>
      {failure !== null && (
        <Callout intent="danger" compact title={t('molecule3d.couldNotDraw')}>
          {failure}
        </Callout>
      )}
    </div>
  );
}

const ROOT_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  flex: '1 0 auto',
  minWidth: 0,
};

const NOTE_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 320,
  fontSize: 13,
};
