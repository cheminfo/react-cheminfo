import { Button, Callout } from '@blueprintjs/core';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';

import { ErrorBoundary } from '../src/error/ui/ErrorBoundary.tsx';

// A boundary wraps one region of a page, so it is shown inside the panel it
// would be standing in for.
const inPanel: Decorator = (Story) => (
  <div style={PANEL_STYLE}>
    <Story />
  </div>
);

/**
 * The part of the page the boundary is protecting, on a good day.
 * @returns A depiction that renders without throwing, so the boundary stays
 * out of the way and the story shows what is being guarded.
 */
function StructureViewer(): ReactElement {
  return (
    <div style={VIEWER_STYLE}>
      <div style={VIEWER_TITLE_STYLE}>Caffeine</div>
      <code style={VIEWER_CODE_STYLE}>Cn1cnc2c1c(=O)n(C)c(=O)n2C</code>
      <div style={VIEWER_NOTE_STYLE}>
        Rendered by the viewer this boundary is watching.
      </div>
    </div>
  );
}

/**
 * A child written to fail on purpose, so the boundary has something to catch.
 * Nothing else in the book throws.
 */
function DemoChildThatThrows(): ReactElement {
  throw new Error(
    'The structure viewer could not start: WebGL is unavailable on this device.',
  );
}

function reportNowhere(): void {
  // A real site hands the failure to its reporter here; a story has none.
}

const meta = {
  title: 'Error/ErrorBoundary',
  component: ErrorBoundary,
  args: { children: <StructureViewer /> },
  argTypes: { title: { control: 'text' } },
  decorators: [inPanel],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Keeps one failing part of the page — a viewer that cannot start, a structure that will not parse — from taking the whole page down with it.',
      },
    },
  },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Nothing has failed, so the boundary is invisible and draws its children. */
export const Default: Story = {};

/**
 * The child throws on render, so what is shown is the default fallback: the
 * message the error carried, and a retry that re-renders the children.
 */
export const Caught: Story = {
  args: {
    children: <DemoChildThatThrows />,
    onError: reportNowhere,
  },
};

/** The same failure under a title the page chose. */
export const CaughtWithTitle: Story = {
  args: {
    children: <DemoChildThatThrows />,
    title: 'The 3D viewer could not start',
  },
};

/**
 * A fallback of the site's own, which is what a small panel needs when the
 * default non-ideal state is taller than the region it stands in for.
 */
export const CustomFallback: Story = {
  args: {
    children: <DemoChildThatThrows />,
    fallback: (error, reset) => (
      <Callout intent="warning" icon="warning-sign" title="Viewer unavailable">
        <p>{error.message}</p>
        <Button size="small" icon="refresh" text="Try again" onClick={reset} />
      </Callout>
    ),
  },
};

const PANEL_STYLE = {
  width: 'min(32rem, 92vw)',
  padding: '0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  boxShadow: 'var(--shadow-sm)',
} as const satisfies CSSProperties;

const VIEWER_STYLE = {
  display: 'flex',
  height: 160,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--radius)',
  background: 'var(--surface-sunken)',
  gap: 6,
} as const satisfies CSSProperties;

const VIEWER_TITLE_STYLE = { fontWeight: 600 } as const satisfies CSSProperties;

const VIEWER_CODE_STYLE = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 13,
} as const satisfies CSSProperties;

const VIEWER_NOTE_STYLE = {
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;
