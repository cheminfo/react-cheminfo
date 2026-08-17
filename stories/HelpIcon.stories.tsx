import { InputGroup } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';

import type { HelpContent } from '../src/help/ui/HelpBody.tsx';
import { HelpIcon } from '../src/help/ui/HelpIcon.tsx';

import {
  ADDUCT_HELP,
  MONOISOTOPIC_MASS_HELP,
  SMILES_HELP,
} from './helpContent.ts';

// The three sides of a form a glyph is ever opened on, plus the one above.
const PLACEMENTS = ['top', 'right', 'bottom', 'left'] as const;

const meta = {
  title: 'Help/HelpIcon',
  component: HelpIcon,
  args: { content: MONOISOTOPIC_MASS_HELP },
  argTypes: {
    size: { control: { type: 'range', min: 10, max: 32, step: 1 } },
    placement: { control: 'select', options: PLACEMENTS },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The small question mark that sits beside a field label. It is reachable by tab, so the explanation is not reserved to whoever is holding a pointer.',
      },
    },
  },
} satisfies Meta<typeof HelpIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Where the glyph actually lives: on the line of the label it follows. */
export const BesideFieldLabels: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={FORM_STYLE}>
      <Field label="Molecular formula" help={SMILES_HELP} size={args.size}>
        <InputGroup readOnly value="C8H10N4O2" />
      </Field>
      <Field
        label="Monoisotopic mass"
        help={MONOISOTOPIC_MASS_HELP}
        size={args.size}
      >
        <InputGroup readOnly value="194.0804 Da" />
      </Field>
      <Field label="Adduct" help={ADDUCT_HELP} size={args.size}>
        <InputGroup readOnly value="[M+H]+" />
      </Field>
    </div>
  ),
};

/** The four sides the help can open on, for a glyph near an edge of the page. */
export const EveryPlacement: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={ROW_STYLE}>
      {PLACEMENTS.map((placement) => (
        <span key={placement} style={LABEL_STYLE}>
          {placement}
          <HelpIcon content={args.content} placement={placement} />
        </span>
      ))}
    </div>
  ),
};

function Field(props: {
  label: string;
  help: HelpContent;
  size: number | undefined;
  children: ReactElement;
}): ReactElement {
  return (
    <div style={FIELD_STYLE}>
      <span style={LABEL_STYLE}>
        {props.label}
        <HelpIcon content={props.help} size={props.size} />
      </span>
      {props.children}
    </div>
  );
}

const FORM_STYLE = {
  display: 'flex',
  width: 'min(22rem, 90vw)',
  flexDirection: 'column',
  gap: 12,
} as const satisfies CSSProperties;

const FIELD_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
} as const satisfies CSSProperties;

const LABEL_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  color: 'var(--text-muted)',
  fontSize: 13,
  fontWeight: 600,
  gap: 4,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 24,
} as const satisfies CSSProperties;
