import { Button, InputGroup } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { TableDataButton } from '../../delimited/ui/TableDataButton.tsx';
import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import {
  factorRows,
  withFactors,
  withoutFactor,
} from '../core/instrumentEdits.ts';
import type { XpsInstrument } from '../core/xpsInstrument.ts';

import { FactorEntry } from './FactorEntry.tsx';
import { FactorTable } from './FactorTable.tsx';
import {
  labelStyle,
  panelSummaryStyle as summaryStyle,
} from './panelStyles.ts';

export interface InstrumentEditorProps {
  /** The instrument shown. */
  instrument: XpsInstrument;
  /** Whether it is the reader's own, and so can be changed. */
  editable: boolean;
  /** Whether it is the one the surveys are quantified with. */
  selected: boolean;
  /** Called to quantify the surveys with it. */
  onSelect: () => void;
  /** Called with the instrument as edited. */
  onChange: (instrument: XpsInstrument) => void;
}

/**
 * One instrument: its name, where its factors come from, and the factors.
 *
 * A table of several hundred lines is read by element, so the field above it
 * narrows it to the lines whose name starts with what is typed — `Fe` for the
 * iron levels, `F` for fluorine and everything after it. The reader's own
 * instruments take factors one at a time or as a table pasted from the
 * instrument's software; the shipped one is read only, and copied to be
 * corrected.
 * @param props - Component props.
 * @returns The editor.
 */
export function InstrumentEditor(props: InstrumentEditorProps): ReactNode {
  const { instrument, editable, selected, onSelect, onChange } = props;
  const [filter, setFilter] = useState('');

  const shown = useMemo(() => {
    const wanted = filter.trim().toLowerCase();
    if (wanted === '') return instrument.factors;
    return instrument.factors.filter((factor) =>
      `${factor.element} ${factor.orbital}`.toLowerCase().startsWith(wanted),
    );
  }, [instrument.factors, filter]);

  return (
    <section style={editorStyle} aria-label={instrument.name}>
      <div style={headerStyle}>
        {editable ? (
          <div style={nameStyle}>
            <InputGroup
              fill
              value={instrument.name}
              aria-label="Name of the instrument"
              onChange={(event) =>
                onChange({ ...instrument, name: event.target.value })
              }
            />
          </div>
        ) : (
          <h4 style={titleStyle}>{instrument.name}</h4>
        )}
        <Button
          icon={selected ? 'tick' : 'circle'}
          intent={selected ? 'success' : 'none'}
          variant="outlined"
          text={selected ? 'Quantifies the surveys' : 'Quantify with it'}
          disabled={selected}
          onClick={onSelect}
        />
      </div>

      {editable ? (
        <InputGroup
          size="small"
          value={instrument.description ?? ''}
          placeholder="Where the factors come from: the library, the date, the settings"
          aria-label="Where the factors come from"
          onChange={(event) =>
            onChange({ ...instrument, description: event.target.value })
          }
        />
      ) : (
        <p style={summaryStyle}>{instrument.description}</p>
      )}

      <div style={toolsStyle}>
        <InputGroup
          size="small"
          leftIcon="search"
          value={filter}
          placeholder="Element, e.g. Fe"
          aria-label="Show the lines of an element"
          style={filterStyle}
          onChange={(event) => setFilter(event.target.value)}
        />
        <span style={labelStyle}>
          {shown.length} of {instrument.factors.length} lines
        </span>
        <TableDataButton
          small
          rows={() => factorRows(instrument)}
          header={TABLE_HEADER}
          title={`Sensitivity factors of ${instrument.name}`}
          description="One line per level: the element, the level and the factor its area is divided by."
          fileName={`${sanitizeFileName(instrument.name) || 'instrument'}-sensitivity-factors`}
          disabled={instrument.factors.length === 0}
        />
      </div>

      <FactorTable
        factors={shown}
        editable={editable}
        onChange={(factor) => onChange(withFactors(instrument, [factor]))}
        onRemove={(element, orbital) =>
          onChange(withoutFactor(instrument, element, orbital))
        }
      />

      {editable ? (
        <FactorEntry
          onAdd={(factors) => onChange(withFactors(instrument, factors))}
        />
      ) : null}
    </section>
  );
}

const TABLE_HEADER = ['Element', 'Level', 'Sensitivity factor'] as const;

const editorStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flex: '1 1 auto',
  minWidth: 0,
  minHeight: 0,
} as const;

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
} as const;

const nameStyle = { flex: '1 1 auto', minWidth: 0 } as const;

const titleStyle = { margin: 0, flex: '1 1 auto' } as const;

const toolsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
} as const;

const filterStyle = { width: 160 } as const;
