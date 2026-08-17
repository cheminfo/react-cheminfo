import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { StructureEditorChange } from '../src/structure/ui/EditorCanvas.tsx';
import type { StructureEditorProps } from '../src/structure/ui/StructureEditor.tsx';
import { StructureEditor } from '../src/structure/ui/StructureEditor.tsx';

import { BENZENE, CAFFEINE } from './structureFixtures.ts';

// The container is given a height rather than left to `minHeight` alone: the
// canvas is positioned out of the height computation, so a container that only
// gains its floor once the toolbar has been measured is zero pixels tall at the
// moment the editor is built — and a structure loaded into an editor of that
// size is never painted, however large the box grows afterwards.
const EDITOR_STYLE: CSSProperties = { height: 380 };

const meta = {
  title: 'Structure/StructureEditor',
  component: StructureEditor,
  args: {
    // Replaced by the demo below, which keeps what the editor reports; the
    // component still needs one when it is used on its own.
    onChange: () => {
      // Nothing to do: the readout is what the demo watches.
    },
    inputFormat: 'smiles',
    value: CAFFEINE,
    debounce: 300,
    minHeight: 320,
    style: EDITOR_STYLE,
  },
  argTypes: {
    fragment: { control: 'boolean' },
    mode: { control: 'inline-radio', options: ['molecule', 'reaction'] },
    inputFormat: {
      control: 'inline-radio',
      options: ['idcode', 'molfile', 'smiles'],
    },
    debounce: { control: { type: 'range', min: 0, max: 1000, step: 50 } },
    minHeight: { control: { type: 'range', min: 200, max: 640, step: 20 } },
    revision: { control: { type: 'number', min: 0, step: 1 } },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The canvas structure editor, sized so its toolbar is never clipped. It is uncontrolled: the value is read when the editor appears and again whenever `revision` changes, and an edit is reported once the drawing has been still.',
      },
    },
  },
  render: (args) => <EditorDemo {...args} />,
} satisfies Meta<typeof StructureEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Draw on the caffeine and watch the three notations follow the canvas. */
export const Default: Story = {};

/** A blank canvas, which is what a page asking the visitor to draw opens on. */
export const Empty: Story = {
  args: { inputFormat: 'idcode', value: '' },
};

/**
 * Query mode, which is what a substructure filter draws in. Erasing the canvas
 * here leaves the idCode of the empty fragment rather than an empty string,
 * which is the case `isEmptyIdCode` exists to catch.
 */
export const Fragment: Story = {
  args: { fragment: true, value: BENZENE },
};

/** Every stroke reported, rather than only the last one of a burst. */
export const NoDebounce: Story = {
  args: { debounce: 0 },
};

/** The reaction canvas, with its own toolbar and its own arrow. */
export const Reaction: Story = {
  args: { mode: 'reaction', inputFormat: 'idcode', value: '' },
};

/**
 * The editor with everything it holds printed under it, so a reader can draw
 * and watch the notations a page would store.
 * @param props - Whatever the story's controls hold.
 * @returns The editor and its readout.
 */
function EditorDemo(props: StructureEditorProps): ReactElement {
  const [change, setChange] = useState<StructureEditorChange | null>(null);

  return (
    <div style={DEMO_STYLE}>
      <StructureEditor {...props} onChange={setChange} />
      {change === null ? (
        <p style={HINT_STYLE}>
          Draw or edit the structure — its notations appear here.
        </p>
      ) : (
        <div style={READOUT_STYLE}>
          <Field label="SMILES" value={change.smiles} />
          <Field label="idCode" value={change.idCode} />
          <Field label="Molfile" value={change.molfile} />
        </div>
      )}
    </div>
  );
}

/**
 * One notation, named and printed as a page would store it.
 * @param props - The name of the notation and its text.
 * @param props.label - Which notation is being shown: SMILES, idCode or
 * Molfile.
 * @param props.value - The notation the editor last produced; an empty string
 * is printed as a dash rather than left blank.
 * @returns The field.
 */
function Field(props: { label: string; value: string }): ReactElement {
  return (
    <div>
      <div style={LABEL_STYLE}>{props.label}</div>
      <pre style={VALUE_STYLE}>{props.value === '' ? '—' : props.value}</pre>
    </div>
  );
}

const DEMO_STYLE: CSSProperties = {
  display: 'grid',
  width: 'min(52rem, 92vw)',
  gap: 12,
};

const HINT_STYLE: CSSProperties = {
  margin: 0,
  color: 'var(--text-muted, #5b6875)',
  fontSize: '0.8125rem',
};

const READOUT_STYLE: CSSProperties = {
  display: 'grid',
  gap: 10,
};

const LABEL_STYLE: CSSProperties = {
  color: 'var(--text-muted, #5b6875)',
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const VALUE_STYLE: CSSProperties = {
  overflow: 'auto',
  maxHeight: '11rem',
  padding: '6px 8px',
  border: '1px solid var(--border, #dfe3e8)',
  borderRadius: 6,
  margin: '2px 0 0',
  background: 'var(--surface-sunken, #f5f7fa)',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.75rem',
  whiteSpace: 'pre',
};
