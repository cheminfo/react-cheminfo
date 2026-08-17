import { Button, Tag } from '@blueprintjs/core';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { CollapsibleSection } from '../src/disclosure/ui/CollapsibleSection.tsx';

import type { MoleculeProperty } from './moleculeFixtures.ts';
import { ASPIRIN_PROPERTIES, CAFFEINE_PROPERTIES } from './moleculeFixtures.ts';

// A section is a piece of a side panel, so it is judged inside one rather than
// floating on the canvas.
const inPanel: Decorator = (Story) => (
  <div style={PANEL_STYLE}>
    <Story />
  </div>
);

function PropertyList(props: {
  properties: readonly MoleculeProperty[];
}): ReactElement {
  return (
    <dl style={LIST_STYLE}>
      {props.properties.map((property) => (
        <div key={property.name} style={ROW_STYLE}>
          <dt style={NAME_STYLE}>{property.name}</dt>
          <dd style={VALUE_STYLE}>{property.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const meta = {
  title: 'Disclosure/CollapsibleSection',
  component: CollapsibleSection,
  decorators: [inPanel],
  args: {
    title: 'Caffeine',
    defaultOpen: true,
    children: <PropertyList properties={CAFFEINE_PROPERTIES} />,
  },
  argTypes: {
    title: { control: 'text' },
    defaultOpen: { control: 'boolean' },
    id: { control: 'text' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A titled block of a panel that folds away when its heading is pressed.',
      },
    },
  },
} satisfies Meta<typeof CollapsibleSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A section a page opens folded, so only its heading is offered at first. */
export const Closed: Story = {
  args: { defaultOpen: false },
};

export const WithIcon: Story = {
  args: { icon: 'lab-test' },
};

/**
 * The count and the button beside the heading sit outside it, so pressing
 * either leaves the section open.
 */
export const WithRightElement: Story = {
  args: {
    title: 'Predicted signals',
    icon: 'pulse',
    rightElement: (
      <>
        <Tag minimal round>
          14
        </Tag>
        <Button variant="minimal" size="small" icon="duplicate" />
      </>
    ),
    children: <PropertyList properties={CAFFEINE_PROPERTIES} />,
  },
};

/** Two sections a parent drives, which is what an "expand all" button needs. */
export const Controlled: Story = {
  render: () => <ExpandAllDemo />,
};

function ExpandAllDemo(): ReactElement {
  const [open, setOpen] = useState<Record<string, boolean>>({
    caffeine: true,
    aspirin: false,
  });

  function toggle(name: string): void {
    setOpen((current) => ({ ...current, [name]: current[name] !== true }));
  }

  function setAll(isOpen: boolean): void {
    setOpen({ caffeine: isOpen, aspirin: isOpen });
  }

  return (
    <div style={STACK_STYLE}>
      <div style={ACTIONS_STYLE}>
        <Button size="small" text="Expand all" onClick={() => setAll(true)} />
        <Button
          size="small"
          text="Collapse all"
          onClick={() => setAll(false)}
        />
      </div>
      <CollapsibleSection
        title="Caffeine"
        icon="lab-test"
        isOpen={open.caffeine}
        onToggle={() => toggle('caffeine')}
      >
        <PropertyList properties={CAFFEINE_PROPERTIES} />
      </CollapsibleSection>
      <CollapsibleSection
        title="Aspirin"
        icon="lab-test"
        isOpen={open.aspirin}
        onToggle={() => toggle('aspirin')}
      >
        <PropertyList properties={ASPIRIN_PROPERTIES} />
      </CollapsibleSection>
    </div>
  );
}

const PANEL_STYLE = {
  width: 'min(28rem, 90vw)',
  padding: '0.75rem 1rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  boxShadow: 'var(--shadow-sm)',
} as const satisfies CSSProperties;

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} as const satisfies CSSProperties;

const ACTIONS_STYLE = {
  display: 'flex',
  gap: 6,
} as const satisfies CSSProperties;

const LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  margin: 0,
  gap: 2,
} as const satisfies CSSProperties;

const ROW_STYLE = {
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
  margin: 0,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 13,
  overflowWrap: 'anywhere',
} as const satisfies CSSProperties;
