import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';
import { Accordion, Button } from 'react-science/ui';

import type { Language } from '../../i18n/core/languages.ts';
import { useLanguage } from '../../i18n/ui/useLanguage.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { FullscreenStage } from '../../shared/ui/FullscreenStage.tsx';
import { canFillScreen } from '../../shared/ui/canFillScreen.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { panelStyle, panelToolbarStyle } from '../core/panelStyles.ts';

/** Props of {@link SidePanelItem}. */
export interface SidePanelItemProps {
  /** Identity of the panel in the stack. */
  id: string;
  /** What the header says. */
  title: string;
  /** Whether the panel shows its body. */
  isOpen: boolean;
  /**
   * Called when the chevron, the header or a shift-click on another header
   * folds or unfolds the panel.
   * @param isOpen - Whether it shows its body.
   */
  onOpenChange: (isOpen: boolean) => void;
  /**
   * Whether the panel is the one in focus, and the toggle; `undefined` while it
   * is alone in the stack, where there is nothing to fold.
   */
  focus: { active: boolean; toggle: () => void } | undefined;
  /** Called when the close cross is pressed. */
  onClose: () => void;
  /** The body. */
  children: ReactNode;
}

/**
 * One panel of the stack: the header with the shell's gestures, and the body,
 * which is also the box that fills the screen.
 *
 * The header is not part of what fills the screen, so a body that does carries
 * a bar of its own with the title and the way back.
 * @param props - See {@link SidePanelItemProps}.
 * @returns The accordion item.
 */
export function SidePanelItem(props: SidePanelItemProps) {
  const { id, title, isOpen, onOpenChange, focus, onClose, children } = props;
  const t = useChromeT();
  const panel = inSentence(title, useLanguage());
  const [canFill] = useState(canFillScreen);
  const body = useRef<HTMLDivElement | null>(null);
  const onStage = useCallback((element: HTMLDivElement | null) => {
    body.current = element;
  }, []);

  function fillScreen(): void {
    if (!isOpen) onOpenChange(true);
    void body.current?.requestFullscreen().catch(() => undefined);
  }

  return (
    <Accordion.Item
      id={id}
      title={title}
      open={isOpen}
      onOpenChange={onOpenChange}
      renderToolbar={() => (
        <>
          {focus !== undefined && (
            <Button
              variant="minimal"
              icon={focus.active ? 'expand-all' : 'collapse-all'}
              aria-pressed={focus.active}
              aria-label={t('panel.focus', { panel })}
              tooltipProps={{
                content: focus.active
                  ? t('panel.unfocusTooltip')
                  : t('panel.focusTooltip'),
              }}
              onClick={focus.toggle}
            />
          )}
          {canFill && (
            <Button
              variant="minimal"
              icon="fullscreen"
              aria-label={t('panel.fillScreen', { panel })}
              tooltipProps={{ content: t('panel.fillScreenTooltip') }}
              onClick={fillScreen}
            />
          )}
          <Button
            variant="minimal"
            icon={isOpen ? 'chevron-down' : 'chevron-right'}
            data-panel-open={isOpen}
            aria-expanded={isOpen}
            aria-label={t(isOpen ? 'panel.fold' : 'panel.unfold', { panel })}
            tooltipProps={{
              content: t(isOpen ? 'panel.foldTooltip' : 'panel.unfoldTooltip'),
            }}
            onClick={() => onOpenChange(!isOpen)}
          />
          <Button
            variant="minimal"
            icon="cross"
            tooltipProps={{ content: t('panel.closeTooltip') }}
            aria-label={t('panel.close', { panel })}
            onClick={onClose}
          />
        </>
      )}
    >
      <FullscreenStage style={bodyStyle} onStage={onStage}>
        {(fullscreen) => (
          <>
            {fullscreen?.active === true && (
              <div style={fullscreenBarStyle}>
                <span style={fullscreenTitleStyle}>{title}</span>
                <Button
                  variant="minimal"
                  icon="minimize"
                  aria-label={t('panel.leaveFullScreen')}
                  tooltipProps={{ content: t('panel.leaveFullScreenTooltip') }}
                  onClick={fullscreen.toggle}
                />
              </div>
            )}
            {children}
          </>
        )}
      </FullscreenStage>
    </Accordion.Item>
  );
}

/**
 * The title as it reads inside a sentence: lowercased, except in German, where
 * every noun keeps its capital.
 * @param title - The panel's title.
 * @param language - The language of the sentence.
 * @returns The title to write into it.
 */
function inSentence(title: string, language: Language): string {
  return language === 'de' ? title : title.toLocaleLowerCase(language);
}

/** A box filling the screen shows the backdrop through it unless painted. */
const filledStyle: CSSProperties = { ...panelStyle, background: TOKEN.surface };

function bodyStyle(fillsScreen: boolean): CSSProperties {
  return fillsScreen ? filledStyle : panelStyle;
}

const fullscreenBarStyle: CSSProperties = {
  ...panelToolbarStyle,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingLeft: 12,
};

const fullscreenTitleStyle: CSSProperties = { fontWeight: 'bold' };
