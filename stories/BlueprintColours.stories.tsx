import {
  Button,
  Callout,
  HTMLSelect,
  HTMLTable,
  InputGroup,
  Menu,
  MenuItem,
  NonIdealState,
  ProgressBar,
  Spinner,
} from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';

/**
 * Every Blueprint control whose greys and blue `chrome.css` maps to the
 * family's tokens, each once, so the mapping is looked at — and read back by
 * `e2e/blueprintColours.spec.ts` — under the colours a real site gives it.
 * @returns The controls.
 */
function BlueprintControls(): ReactElement {
  return (
    <div style={GRID_STYLE}>
      <div style={ROW_STYLE}>
        <Spinner size={20} data-testid="spinner" />
        <Spinner size={20} intent="primary" data-testid="spinner-primary" />
        <div style={{ width: 120 }}>
          <ProgressBar value={0.4} stripes={false} data-testid="progress" />
        </div>
        <div style={{ width: 120 }}>
          <ProgressBar
            value={0.4}
            stripes={false}
            intent="primary"
            data-testid="progress-primary"
          />
        </div>
      </div>
      <Menu data-testid="menu">
        <MenuItem icon="duplicate" text="Duplicate" label="Ctrl+D" />
      </Menu>
      <Callout icon="info-sign" title="A note" data-testid="callout">
        What a callout says, beside its icon.
      </Callout>
      <div style={ROW_STYLE}>
        <HTMLSelect
          options={['Otsu', 'Huang']}
          aria-label="Method"
          data-testid="select"
        />
        <InputGroup
          disabled
          value="Read only"
          aria-label="Read only"
          data-testid="disabled-input"
        />
        <Button intent="primary" text="Apply" data-testid="primary-button" />
      </div>
      <HTMLTable data-testid="table">
        <tbody>
          <tr>
            <th>Area</th>
            <td>12.5 µm²</td>
          </tr>
        </tbody>
      </HTMLTable>
      <p style={{ margin: 0 }}>
        A sentence holding{' '}
        <a href="#a-link" data-testid="link">
          a link
        </a>
        .
      </p>
      <NonIdealState
        icon="search"
        title="Nothing here yet"
        description="Open a file to see it."
        data-testid="empty"
      />
    </div>
  );
}

const meta = {
  title: 'Tokens/BlueprintColours',
  component: BlueprintControls,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Blueprint's spinner, progress bar, menu, callout, select, disabled field, primary button, table, links and empty state, in the family's colours: the mapping `chrome.css` writes over the greys and the blue Blueprint compiles in.",
      },
    },
  },
} satisfies Meta<typeof BlueprintControls>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every mapped control, once. */
export const InTheFamily: Story = {};

const GRID_STYLE = {
  display: 'grid',
  gap: 16,
  width: 480,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
} as const satisfies CSSProperties;
