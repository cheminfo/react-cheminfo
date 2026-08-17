import { Button, HTMLSelect, InputGroup, Switch, Tag } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useMemo, useState } from 'react';

import { persistBucket } from '../src/state/ui/persistBucket.ts';

/** The preferences of a mass panel, which is what the bucket keeps. */
interface MassPreferences {
  /** The formula the panel opens on. */
  formula: string;
  /** The adduct the peaks are computed for. */
  adduct: string;
  /** How many decimals a mass is written with. */
  precision: number;
  /** Whether the isotopic pattern is drawn under the peak. */
  showIsotopes: boolean;
}

const DEFAULTS: MassPreferences = {
  formula: 'C8H10N4O2',
  adduct: '[M+H]+',
  precision: 4,
  showIsotopes: true,
};

const ADDUCTS = ['[M+H]+', '[M+Na]+', '[M+NH4]+', '[M-H]-'];
const PRECISIONS = ['2', '4', '6'];

// A key of this book's own, namespaced like a site's would be, so trying the
// story never disturbs a real page's preferences.
const KEY = 'react-cheminfo:story:mass-preferences';

/** What the harness lets the toolbar change about the bucket. */
interface PersistBucketDemoProps {
  /** Schema version, appended to the key as `:v<version>`. */
  version: number;
}

function PersistBucketDemo(props: PersistBucketDemoProps): ReactElement {
  const { version } = props;
  const bucket = useMemo(
    () =>
      persistBucket<MassPreferences>({
        key: KEY,
        version,
        defaults: DEFAULTS,
      }),
    [version],
  );
  const [firstRun] = useState(() => bucket.read().firstRun);
  const [preferences, setPreferences] = useState(() => bucket.read().value);
  const [stored, setStored] = useState(() => rawEntry(bucket.storageKey));

  function update(patch: Partial<MassPreferences>): void {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    bucket.write(next);
    setStored(rawEntry(bucket.storageKey));
  }

  function clear(): void {
    bucket.clear();
    setPreferences({ ...DEFAULTS });
    setStored(rawEntry(bucket.storageKey));
  }

  return (
    <div style={STACK_STYLE}>
      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>Molecular formula</span>
        <InputGroup
          value={preferences.formula}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          onValueChange={(formula) => update({ formula })}
        />
      </div>
      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>Adduct</span>
        <HTMLSelect
          value={preferences.adduct}
          options={ADDUCTS}
          onChange={(event) => update({ adduct: event.currentTarget.value })}
        />
      </div>
      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>Decimals</span>
        <HTMLSelect
          value={String(preferences.precision)}
          options={PRECISIONS}
          onChange={(event) =>
            update({ precision: Number(event.currentTarget.value) })
          }
        />
      </div>
      <Switch
        checked={preferences.showIsotopes}
        label="Draw the isotopic pattern"
        onChange={(event) =>
          update({ showIsotopes: event.currentTarget.checked })
        }
      />
      <div style={ACTIONS_STYLE}>
        <Button
          icon="refresh"
          text="Reload the frame"
          onClick={() => globalThis.location.reload()}
        />
        <Button icon="trash" intent="danger" text="Clear" onClick={clear} />
        <Tag minimal intent={firstRun ? 'warning' : 'success'}>
          {firstRun ? 'first run' : 'restored from storage'}
        </Tag>
      </div>
      <div style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{bucket.storageKey}</span>
        <code style={CODE_STYLE}>{stored}</code>
      </div>
      <p style={NOTE_STYLE}>
        Change a field, then reload the frame: the values come back. Clearing
        forgets the entry, so the next read is a first run again — and the
        version in the key is what makes an old shape be ignored rather than
        migrated.
      </p>
    </div>
  );
}

/**
 * The entry exactly as the store holds it, which is what the bucket wrote.
 * @param storageKey - The versioned key the bucket occupies.
 * @returns The raw JSON, or why there is none.
 */
function rawEntry(storageKey: string): string {
  try {
    return (
      globalThis.localStorage?.getItem(storageKey) ?? 'nothing is stored yet'
    );
  } catch {
    return 'the store is unavailable in this frame';
  }
}

const meta = {
  title: 'Hooks/persistBucket',
  component: PersistBucketDemo,
  args: { version: 1 },
  argTypes: { version: { control: { type: 'radio' }, options: [1, 2] } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A bucket of preferences kept in `localStorage` under one versioned key. Every read and write is best effort: in a framed page the store may be partitioned or blocked, and the form has to keep working anyway.',
      },
    },
  },
  // The bucket is read once, on mount, so the version control remounts it.
  render: (args) => (
    <PersistBucketDemo key={args.version} version={args.version} />
  ),
} satisfies Meta<typeof PersistBucketDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * The same key at the next version: what version 1 stored is not read, so a
 * shape that cannot be reconciled field by field starts from the defaults.
 */
export const NextVersion: Story = {
  args: { version: 2 },
};

const STACK_STYLE = {
  display: 'flex',
  width: 'min(28rem, 92vw)',
  flexDirection: 'column',
  gap: 10,
} as const satisfies CSSProperties;

const FIELD_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
} as const satisfies CSSProperties;

const LABEL_STYLE = {
  color: 'var(--text-muted)',
  fontSize: 13,
  fontWeight: 600,
} as const satisfies CSSProperties;

const ACTIONS_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 6,
} as const satisfies CSSProperties;

const CODE_STYLE = {
  padding: '0.4rem 0.6rem',
  borderRadius: 6,
  background: 'var(--surface-sunken)',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
  overflowWrap: 'anywhere',
} as const satisfies CSSProperties;

const NOTE_STYLE = {
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;
