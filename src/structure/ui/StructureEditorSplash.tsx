import type { CSSProperties, ReactElement } from 'react';

import { Prose } from '../../i18n/ui/Prose.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { EDITOR_TOOLBAR_WIDTH } from '../core/editorToolbarGeometry.ts';

import { KeyCaps } from './KeyCaps.tsx';

/** What {@link StructureEditorSplash} needs. */
export interface StructureEditorSplashProps {
  /** Whether the canvas takes a dropped file, which the splash then offers. */
  importable: boolean;
}

/**
 * What an empty canvas says about how to start: draw, paste, or drop a file.
 *
 * It lets the pointer through, so the first click lands on the canvas, and it
 * is hidden from assistive technology, which reads the same in the guide.
 * @param props - See {@link StructureEditorSplashProps}.
 * @returns The splash, over the drawing area beside the toolbar.
 */
export function StructureEditorSplash(
  props: StructureEditorSplashProps,
): ReactElement {
  const t = useChromeT();
  return (
    <div
      aria-hidden="true"
      data-testid="structure-editor-splash"
      style={SPLASH_STYLE}
    >
      <strong style={LEAD_STYLE}>{t('structure.splash.draw')}</strong>
      <span>
        <Prose
          text={t('structure.splash.paste')}
          nodes={{ keys: <KeyCaps keys={PASTE_KEYS} /> }}
        />
      </span>
      {props.importable ? <span>{t('structure.splash.drop')}</span> : null}
    </div>
  );
}

const PASTE_KEYS = ['Mod', 'V'];

const SPLASH_STYLE: CSSProperties = {
  position: 'absolute',
  inset: `0 0 0 ${EDITOR_TOOLBAR_WIDTH}px`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: 16,
  color: TOKEN.textMuted,
  fontSize: 13,
  lineHeight: 1.5,
  textAlign: 'center',
  textWrap: 'balance',
  pointerEvents: 'none',
};

const LEAD_STYLE: CSSProperties = {
  color: TOKEN.text,
  fontSize: 14,
  fontWeight: 600,
};
