import type { ReactNode } from 'react';

import { EditorHeader } from '../../panel/ui/EditorHeader.tsx';

import { IrLogo } from './IrLogo.tsx';
import { useIrCommandProps } from './irCommandContext.tsx';
import { useIrEditorState } from './irStateContext.ts';
import { useIrText } from './useIrText.ts';

/**
 * The family's viewer header, worded for the technique on screen.
 * @param props - Component props.
 * @param props.actions - The host's actions, as toolbar items.
 * @returns The header.
 */
export function IrHeader(props: { actions?: ReactNode }) {
  const { technique } = useIrEditorState().state.settings;
  const text = useIrText(technique);
  return (
    <EditorHeader
      logo={<IrLogo size={16} technique={technique} />}
      label={text.viewer}
      helpLabel={text.viewerHelp}
      command={useIrCommandProps()}
      actions={props.actions}
    />
  );
}
