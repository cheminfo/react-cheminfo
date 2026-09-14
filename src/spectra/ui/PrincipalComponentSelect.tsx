import { HTMLSelect, Switch } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { chartShare } from '../../chart/core/chartLabels.ts';
import type {
  PrincipalComponentSelection,
  PrincipalComponentSettings,
} from '../core/principalComponents.ts';
import {
  PCA_METHODS,
  clampPrincipalComponents,
  principalComponentChoices,
  selectedExplainedVariance,
} from '../core/principalComponents.ts';

import { NumberField } from './NumberField.tsx';
import {
  HELP_STYLE,
  LABEL_STYLE,
  ROW_STYLE,
  SWITCH_STYLE,
  sizedFieldStyle,
} from './fieldStyles.ts';

/** What {@link PrincipalComponentSelect} picks. */
export interface PrincipalComponentSelectProps {
  /** Which two components are drawn. Both are columns of the score matrix, counting from zero. */
  value: PrincipalComponentSelection;
  /** Called with the pair whenever either axis changes. */
  onChange: (selection: PrincipalComponentSelection) => void;
  /** How many components the decomposition produced. */
  count: number;
  /**
   * What `pca.getExplainedVariance()` returned, as fractions in component order.
   * @default undefined — the choices read `PC1` alone and no total is drawn
   */
  explainedVariance?: readonly number[];
  /**
   * The options the decomposition was asked for.
   * @default undefined — the decomposition's own options are not offered
   */
  settings?: PrincipalComponentSettings;
  /**
   * Called with the options whenever one of them changes.
   * @default undefined — the decomposition's own options are not offered
   */
  onSettingsChange?: (settings: PrincipalComponentSettings) => void;
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * Which two principal components a score plot is drawn against.
 *
 * This is the one control here that reports on its own rather than through the
 * settings object, so `onChange` is the whole contract and fires on every pick.
 * What it hands up stays zero-based even though the labels read `PC1`, because
 * a reader who takes those numbers straight to the score matrix has to land on
 * the right column: shifting by one would draw the wrong component under the
 * right name.
 * @param props - See {@link PrincipalComponentSelectProps}.
 * @returns The two pickers, and the decomposition's options when both are given.
 */
export function PrincipalComponentSelect(
  props: PrincipalComponentSelectProps,
): ReactElement {
  const {
    className,
    value,
    onChange,
    count,
    explainedVariance,
    settings,
    onSettingsChange,
  } = props;
  const selection = clampPrincipalComponents(value, count);
  const share = selectedExplainedVariance(selection, explainedVariance ?? []);
  const choices = principalComponentChoices(count, explainedVariance).map(
    (choice) => (
      <option key={choice.index} value={choice.index}>
        {choice.label}
      </option>
    ),
  );

  function pick(next: PrincipalComponentSelection): void {
    onChange(clampPrincipalComponents(next, count));
  }

  return (
    <div className={className} style={ROOT_STYLE}>
      <div style={ROW_STYLE}>
        <label style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>Horizontal axis</span>
          <HTMLSelect
            fill
            value={String(selection.x)}
            onChange={(event) => {
              pick({ x: Number(event.currentTarget.value), y: selection.y });
            }}
          >
            {choices}
          </HTMLSelect>
        </label>
        <label style={FIELD_STYLE}>
          <span style={LABEL_STYLE}>Vertical axis</span>
          <HTMLSelect
            fill
            value={String(selection.y)}
            onChange={(event) => {
              pick({ x: selection.x, y: Number(event.currentTarget.value) });
            }}
          >
            {choices}
          </HTMLSelect>
        </label>
      </div>
      {share === undefined ? null : (
        <span style={HELP_STYLE}>
          {`Together they carry ${chartShare(share)} % of the variance.`}
        </span>
      )}
      {settings === undefined || onSettingsChange === undefined ? null : (
        <DecompositionFields settings={settings} onChange={onSettingsChange} />
      )}
    </div>
  );
}

/** What {@link DecompositionFields} edits. */
interface DecompositionFieldsProps {
  /** The options the decomposition was asked for. */
  settings: PrincipalComponentSettings;
  /** Called with the options whenever one of them changes. */
  onChange: (settings: PrincipalComponentSettings) => void;
}

/**
 * How `ml-pca` is asked to decompose the matrix.
 *
 * The NIPALS count is drawn only under NIPALS, the one method that reads it.
 * @param props - See {@link DecompositionFieldsProps}.
 * @returns The decomposition's own options.
 */
function DecompositionFields(props: DecompositionFieldsProps): ReactElement {
  const { settings, onChange } = props;
  const method = settings.method ?? 'SVD';

  function write(patch: PrincipalComponentSettings): void {
    onChange({ ...settings, ...patch });
  }

  return (
    <div style={OPTIONS_STYLE}>
      <label style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>Method</span>
        <HTMLSelect
          fill
          value={method}
          onChange={(event) => {
            const picked = event.currentTarget.value;
            const entry = PCA_METHODS.find((one) => one.value === picked);
            if (entry !== undefined) write({ method: entry.value });
          }}
        >
          {PCA_METHODS.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </HTMLSelect>
      </label>
      {method === 'NIPALS' ? (
        <NumberField
          label="Components to compute"
          value={settings.nCompNIPALS}
          placeholder="2"
          integer
          help="NIPALS stops once it has this many components."
          onChange={(nCompNIPALS) => {
            write({ nCompNIPALS });
          }}
        />
      ) : null}
      <Switch
        checked={settings.center !== false}
        label="Centre the columns (on unless turned off)"
        style={SWITCH_STYLE}
        onChange={(event) => {
          write({ center: event.currentTarget.checked });
        }}
      />
      <Switch
        checked={settings.scale === true}
        label="Scale the columns (off unless turned on)"
        style={SWITCH_STYLE}
        onChange={(event) => {
          write({ scale: event.currentTarget.checked });
        }}
      />
      <Switch
        checked={settings.ignoreZeroVariance === true}
        label="Ignore flat columns (only matters while scaling)"
        style={SWITCH_STYLE}
        onChange={(event) => {
          write({ ignoreZeroVariance: event.currentTarget.checked });
        }}
      />
    </div>
  );
}

const ROOT_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
} as const satisfies CSSProperties;

const OPTIONS_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  paddingTop: 6,
  borderTop: '1px solid var(--border)',
} as const satisfies CSSProperties;

const FIELD_STYLE = sizedFieldStyle(160);
