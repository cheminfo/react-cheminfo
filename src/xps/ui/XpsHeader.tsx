import type { ReactNode } from 'react';
import { Toolbar } from 'react-science/ui';

import { EditorHeader } from '../../panel/ui/EditorHeader.tsx';

import { XpsLogo } from './XpsLogo.tsx';
import { useXpsCommandProps } from './xpsCommandContext.tsx';

/**
 * The family's viewer header, for photoelectron spectra, with the
 * instruments' settings before help.
 * @param props - Component props.
 * @param props.actions - The host's actions, as toolbar items.
 * @returns The header.
 */
export function XpsHeader(props: { actions?: ReactNode }) {
  const command = useXpsCommandProps();
  return (
    <EditorHeader
      logo={<XpsLogo size={16} />}
      label="X-ray photoelectron spectrum viewer"
      helpLabel="X-ray photoelectron spectrum viewer help"
      command={command}
      actions={props.actions}
      extra={<Toolbar.Item icon="cog" {...command('settings')} />}
    />
  );
}
