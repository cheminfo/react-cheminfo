import { Button, InputGroup, TextArea } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { PanelMessage } from '../../panel/ui/PanelMessage.tsx';
import { readSensitivityFactors } from '../core/instrumentEdits.ts';
import type { XpsSensitivityFactor } from '../core/xpsInstrument.ts';

export interface FactorEntryProps {
  /** Called with the factors to set, each replacing the one of its line. */
  onAdd: (factors: XpsSensitivityFactor[]) => void;
}

/**
 * Where the factors of the reader's instrument come in: one line typed as it
 * reads — `N 1s 0.477` — or a whole table pasted from the instrument's
 * software, a line per level.
 *
 * Both go through the same reader, so a line that is accepted typed is
 * accepted pasted. What it cannot read is shown back as written, and the
 * lines it could read are kept rather than refused with the rest.
 * @param props - Component props.
 * @returns The entry.
 */
export function FactorEntry(props: FactorEntryProps): ReactNode {
  const { onAdd } = props;
  const [line, setLine] = useState('');
  const [table, setTable] = useState('');
  const [pasting, setPasting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function take(text: string, clear: () => void): void {
    const { factors, rejected } = readSensitivityFactors(text);
    if (factors.length > 0) {
      onAdd(factors);
      clear();
    }
    setNotice(
      rejected.length === 0
        ? null
        : `${rejected.length === 1 ? 'This line' : `These ${rejected.length} lines`} could not be read as element, level and factor: ${rejected.join(' · ')}`,
    );
  }

  return (
    <div style={entryStyle}>
      <div style={rowStyle}>
        <InputGroup
          size="small"
          value={line}
          placeholder="N 1s 0.477"
          aria-label="A level and its factor"
          spellCheck={false}
          autoComplete="off"
          style={lineStyle}
          onChange={(event) => setLine(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') take(line, () => setLine(''));
          }}
        />
        <Button
          size="small"
          icon="add"
          text="Add"
          disabled={line.trim() === ''}
          onClick={() => take(line, () => setLine(''))}
        />
        <Button
          size="small"
          icon="clipboard"
          text="Paste a table"
          active={pasting}
          onClick={() => setPasting(!pasting)}
        />
      </div>
      {pasting ? (
        <>
          <TextArea
            value={table}
            placeholder={'C 1s 0.278\nO 1s 0.78\nN 1s 0.477'}
            aria-label="A table of factors, one level per line"
            rows={5}
            spellCheck={false}
            style={tableStyle}
            onChange={(event) => setTable(event.target.value)}
          />
          <Button
            size="small"
            intent="primary"
            icon="import"
            text="Add these factors"
            disabled={table.trim() === ''}
            onClick={() => take(table, () => setTable(''))}
          />
        </>
      ) : null}
      {notice === null ? null : <PanelMessage>{notice}</PanelMessage>}
    </div>
  );
}

const entryStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 6,
} as const;

const rowStyle = { display: 'flex', gap: 6, alignItems: 'center' } as const;

const lineStyle = { width: 160 } as const;

const tableStyle = {
  width: '100%',
  fontFamily: 'monospace',
  fontSize: 12,
} as const;
