import {
  Button,
  Collapse,
  Dialog,
  DialogBody,
  DialogFooter,
  Tag,
} from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';

import { useDisclosure } from '../src/disclosure/ui/useDisclosure.ts';

import { CAFFEINE_PROPERTIES } from './moleculeFixtures.ts';

/** What the harness lets the toolbar change about the hook. */
interface DisclosureDemoProps {
  /** Whether the thing the hook drives starts out shown. */
  initialOpen: boolean;
}

function DisclosureDemo(props: DisclosureDemoProps): ReactElement {
  const panel = useDisclosure(props.initialOpen);

  return (
    <div style={STACK_STYLE}>
      <div style={ROW_STYLE}>
        <Button icon="eye-open" text="open" onClick={panel.open} />
        <Button icon="eye-off" text="close" onClick={panel.close} />
        <Button icon="swap-horizontal" text="toggle" onClick={panel.toggle} />
        <Tag minimal intent={panel.isOpen ? 'success' : undefined}>
          {`isOpen: ${String(panel.isOpen)}`}
        </Tag>
      </div>
      <Collapse isOpen={panel.isOpen}>
        <div style={PANEL_STYLE}>
          {CAFFEINE_PROPERTIES.map((property) => (
            <div key={property.name} style={LINE_STYLE}>
              <span style={NAME_STYLE}>{property.name}</span>
              <code style={VALUE_STYLE}>{property.value}</code>
            </div>
          ))}
        </div>
      </Collapse>
    </div>
  );
}

const meta = {
  title: 'Disclosure/useDisclosure',
  component: DisclosureDemo,
  args: { initialOpen: true },
  argTypes: { initialOpen: { control: 'boolean' } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The open state of a panel, a menu or a dialog, with the three actions that change it — shown here driving a panel of properties.',
      },
    },
  },
} satisfies Meta<typeof DisclosureDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The same three actions with the panel starting folded away. */
export const StartsClosed: Story = {
  args: { initialOpen: false },
};

/**
 * The same hook driving a dialog: `isOpen` and `close` go straight onto it,
 * and `close` keeps its identity so the dialog is not re-subscribed.
 */
export const DrivingADialog: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => <DialogDemo initialOpen={args.initialOpen} />,
};

function DialogDemo(props: DisclosureDemoProps): ReactElement {
  const dialog = useDisclosure(props.initialOpen);

  return (
    <div style={FRAME_STYLE}>
      <Button icon="share" text="Share this page" onClick={dialog.open} />
      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title="Share"
        icon="share"
      >
        <DialogBody>
          <p>A link to this page, carrying the formula it is showing.</p>
          <code style={LINK_STYLE}>
            https://chemcalc.org/?mf=C8H10N4O2&amp;embed=1
          </code>
        </DialogBody>
        <DialogFooter
          minimal
          actions={
            <Button intent="primary" text="Close" onClick={dialog.close} />
          }
        />
      </Dialog>
    </div>
  );
}

const STACK_STYLE = {
  display: 'flex',
  width: 'min(30rem, 90vw)',
  flexDirection: 'column',
  gap: 10,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 6,
} as const satisfies CSSProperties;

const FRAME_STYLE = { padding: '1.25rem' } as const satisfies CSSProperties;

const PANEL_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  padding: '0.6rem 0.8rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  gap: 2,
} as const satisfies CSSProperties;

const LINE_STYLE = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
} as const satisfies CSSProperties;

const NAME_STYLE = {
  flex: '0 0 11rem',
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;

const VALUE_STYLE = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 13,
  overflowWrap: 'anywhere',
} as const satisfies CSSProperties;

const LINK_STYLE = {
  display: 'inline-block',
  marginTop: 6,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
  overflowWrap: 'anywhere',
} as const satisfies CSSProperties;
