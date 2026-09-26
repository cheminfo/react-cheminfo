/**
 * What the keyboard and the mouse do in the structure editor, shown in the
 * editor's help popover, and usable by a site on a page of its own.
 */

import { Classes } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { EditorGesture, EditorGuideOptions } from '../core/editorGuide.ts';
import {
  STRUCTURE_EDITOR_DOCS,
  editorGuideSections,
  editorInputWordId,
} from '../core/editorGuide.ts';

import { KeyCaps } from './KeyCaps.tsx';

/** What {@link StructureEditorHelp} is written for. */
export type StructureEditorHelpProps = EditorGuideOptions;

/**
 * The guide to the structure editor: the keys that change the atom or bond
 * under the pointer, the selection gestures, the stereo conventions, and links
 * to the full documentation. Gestures that do nothing in the given editor are
 * left out.
 * @param props - See {@link StructureEditorHelpProps}.
 * @returns The guide.
 */
export function StructureEditorHelp(
  props: StructureEditorHelpProps,
): ReactElement {
  const t = useChromeT();
  const sections = editorGuideSections(props);

  return (
    <div style={PANEL_STYLE} data-testid="structure-editor-help">
      <p className={Classes.TEXT_MUTED} style={PARAGRAPH_STYLE}>
        {t('structure.help.hoverToolbar')}
      </p>
      {/* One grid for every section, so all the actions start on one edge. */}
      <div style={GRID_STYLE}>
        {sections.map((section) => (
          <section key={section.id} style={ROW_STYLE}>
            <h4 style={HEADING_STYLE}>
              {t.or(`structure.guide.${section.id}.title`, section.title)}
            </h4>
            {section.gestures.map((gesture) => (
              <div key={gestureKey(gesture)} style={ROW_STYLE}>
                <GestureInput input={gesture.input} t={t} />
                <span>
                  {t.or(
                    `structure.guide.${section.id}.${gesture.id}`,
                    gesture.action,
                  )}
                </span>
              </div>
            ))}
            {section.note === undefined ? null : (
              <p className={Classes.TEXT_MUTED} style={NOTE_STYLE}>
                {t.or(`structure.guide.${section.id}.note`, section.note)}
              </p>
            )}
          </section>
        ))}
      </div>
      <p style={PARAGRAPH_STYLE}>
        {t('structure.help.learnMore')}{' '}
        {STRUCTURE_EDITOR_DOCS.map((link, index) => (
          <span key={link.url}>
            {index === 0 ? null : ' · '}
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {t.or(`structure.docs.${link.id}`, link.title)}
            </a>
          </span>
        ))}
      </p>
    </div>
  );
}

function GestureInput(props: {
  input: EditorGesture['input'];
  t: Translate<ChromeKey>;
}): ReactElement {
  const { input, t } = props;
  return (
    <span style={INPUT_STYLE}>
      {input.map((part) =>
        typeof part === 'string' ? (
          <span key={part}>{word(part, t)}</span>
        ) : (
          <KeyCaps key={part.key} keys={[part.key]} />
        ),
      )}
    </span>
  );
}

// A word between two key caps is one catalog entry, shared by every gesture
// that writes it; punctuation such as `…` is left exactly as it is.
function word(text: string, t: Translate<ChromeKey>): string {
  const id = editorInputWordId(text);
  return id === undefined ? text : t.or(`structure.input.${id}`, text);
}

function gestureKey(gesture: EditorGesture): string {
  const input = gesture.input
    .map((part) => (typeof part === 'string' ? part : part.key))
    .join(' ');
  return `${input} ${gesture.action}`;
}

const PANEL_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  width: 400,
  maxHeight: 'min(70vh, 36rem)',
  overflowY: 'auto',
  padding: 12,
  fontSize: 12,
};

const GRID_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'max-content minmax(0, 1fr)',
  alignItems: 'center',
  columnGap: 12,
  rowGap: 6,
};

const ROW_STYLE: CSSProperties = { display: 'contents' };

const HEADING_STYLE: CSSProperties = {
  gridColumn: '1 / -1',
  margin: '8px 0 0',
  paddingBottom: 3,
  borderBottom: `1px solid ${TOKEN.border}`,
  color: TOKEN.textMuted,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const INPUT_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  whiteSpace: 'nowrap',
};

const PARAGRAPH_STYLE: CSSProperties = { margin: 0, lineHeight: 1.45 };

const NOTE_STYLE: CSSProperties = { ...PARAGRAPH_STYLE, gridColumn: '1 / -1' };
