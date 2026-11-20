/**
 * The crystal in 3D: what surrounds the canvas, and what to say when there
 * cannot be one.
 *
 * Two things are settled before molstar is touched. The WebGL probe runs first,
 * because molstar ships no canvas or SVG fallback and a locked-down school
 * machine would otherwise get a blank rectangle with no explanation. And the
 * canvas is a `React.lazy` boundary, so a page that never shows a crystal
 * never downloads it.
 *
 * ```tsx
 * import { CrystalViewer3D } from 'react-cheminfo/crystal3d';
 *
 * <CrystalViewer3D scene={{ atoms, cell, repeat: [2, 2, 2] }} height={480} />;
 * ```
 */

import { Callout, Spinner, SpinnerSize } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { Suspense, lazy, useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { Molecule3DTools } from '../../molecule3d/core/tools.ts';
// Deep import on purpose: the probe imports nothing, while a barrel would pull
// molstar in — which is exactly what asking first exists to avoid.
import { probeViewerCapability } from '../../orbital/ui/capability.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';

import type { CrystalScene, CrystalViewHandle } from './crystalScene.ts';

const CrystalCanvas3D = lazy(async () => {
  const module = await import('./CrystalCanvas3D.tsx');
  return { default: module.CrystalCanvas3D };
});

/** Props of {@link CrystalViewer3D}. */
export interface CrystalViewer3DProps {
  /** What to show. */
  scene: CrystalScene;
  /**
   * How tall the canvas is: pixels, or any CSS length.
   * @default 420
   */
  height?: number | string;
  /**
   * Scene background, `#rrggbb`.
   * @default '#ffffff'
   */
  background?: string;
  /**
   * Which tools the toolbars offer; every one it does not name is on.
   * @default every tool but the display options and the surface
   */
  tools?: Partial<Molecule3DTools>;
  /**
   * Base name of a picture saved from the toolbar, extension excluded.
   * @default 'crystal'
   */
  fileName?: string;
  /**
   * One line under the canvas — what is on screen, or where it came from.
   * @default undefined
   */
  caption?: ReactNode;
  /**
   * What to say instead of a canvas when the scene holds no atoms.
   * @default undefined — the frame stays empty
   */
  emptyMessage?: ReactNode;
  /**
   * What to say on a machine that cannot draw in 3D, after the reason.
   * @default undefined
   */
  unsupportedNote?: ReactNode;
  /**
   * Called with the means to picture the scene once the canvas exists, and with
   * `null` once it is gone.
   * @default undefined
   */
  onHandle?: (handle: CrystalViewHandle | null) => void;
}

/**
 * The 3D crystal, with its failure and no-WebGL messages.
 * @param props - See {@link CrystalViewer3DProps}.
 * @returns The viewer, or an explanation of why this machine cannot show one.
 */
export function CrystalViewer3D(props: CrystalViewer3DProps): ReactElement {
  const {
    scene,
    height = 420,
    background,
    tools,
    fileName,
    caption,
    emptyMessage,
    unsupportedNote,
    onHandle,
  } = props;
  const t = useChromeT();
  const [capability] = useState(probeViewerCapability);
  const [failure, setFailure] = useState<string | null>(null);

  if (!capability.supported) {
    return (
      <Callout
        intent="warning"
        icon="desktop"
        title={t('crystal3d.unsupported')}
        compact
      >
        {t.or(`viewer.capability.${capability.reason}`, capability.message)}{' '}
        {unsupportedNote}
      </Callout>
    );
  }

  return (
    <div style={ROOT_STYLE}>
      <div style={{ ...FRAME_STYLE, height }}>
        {scene.atoms.length === 0 ? (
          <div style={NOTICE_STYLE}>{emptyMessage}</div>
        ) : (
          <Suspense
            fallback={
              <div style={NOTICE_STYLE}>
                <Spinner size={SpinnerSize.STANDARD} />
                <span>{t('molecule3d.loadingViewer')}</span>
              </div>
            }
          >
            <CrystalCanvas3D
              scene={scene}
              background={background}
              tools={tools}
              fileName={fileName}
              onFailure={setFailure}
              onHandle={onHandle}
            />
          </Suspense>
        )}
      </div>
      {caption === undefined ? null : (
        <div style={CAPTION_STYLE}>{caption}</div>
      )}
      {failure !== null && (
        <Callout intent="danger" title={t('molecule3d.couldNotDraw')} compact>
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
};

const FRAME_STYLE: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: TOKEN.radius,
  border: `1px solid ${TOKEN.border}`,
  background: TOKEN.surface,
};

const NOTICE_STYLE: CSSProperties = {
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  color: TOKEN.textMuted,
  fontSize: 13,
};

const CAPTION_STYLE: CSSProperties = {
  color: TOKEN.textMuted,
  fontSize: 12,
};
