import type { ReactNode } from 'react';

import { EditorHeader } from '../../panel/ui/EditorHeader.tsx';

import { MassLogo } from './MassLogo.tsx';
import { useMassCommandProps } from './massCommandContext.tsx';

/**
 * The family's viewer header, for mass spectra.
 * @param props - Component props.
 * @param props.actions - The host's actions, as toolbar items.
 * @returns The header.
 */
export function MassHeader(props: { actions?: ReactNode }) {
  return (
    <EditorHeader
      logo={<MassLogo size={16} />}
      label="Mass spectrum viewer"
      helpLabel="Mass spectrum viewer help"
      command={useMassCommandProps()}
      actions={props.actions}
    />
  );
}
