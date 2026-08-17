import type { Meta, StoryObj } from '@storybook/react-vite';

import type { CiteButtonProps } from '../src/citation/ui/CiteButton.tsx';
import { CiteButton } from '../src/citation/ui/CiteButton.tsx';

import { HEADER_BUTTON_ARG_TYPES } from './headerButton.ts';
import { PAPER, PAPERS } from './paper.ts';

const meta = {
  title: 'Citation/CiteButton',
  component: CiteButton,
  argTypes: HEADER_BUTTON_ARG_TYPES,
  parameters: {
    docs: {
      description: {
        component:
          'The Cite entry of a site header. Open it, hover an entry for the preview, and the styles sit in the submenu. A site built on several works passes `works` rather than `reference`, and each is listed behind what citing it credits.',
      },
    },
  },
} satisfies Meta<typeof CiteButton>;

export default meta;

// The props are a union — one work, or the several a site is built on — so a
// story spells out its own subject rather than inheriting one from the meta.
type Story = StoryObj<CiteButtonProps>;

export const Default: Story = {
  args: { reference: PAPER },
};

export const CustomLabel: Story = {
  args: { reference: PAPER, label: 'Cite this work' },
};

export const BottomStart: Story = {
  args: { reference: PAPER, placement: 'bottom-start' },
};

export const Compact: Story = {
  args: { reference: PAPER, compact: true },
};

/** A site built on two works: what each one is, and both copied at once. */
export const SeveralWorks: Story = {
  args: { works: PAPERS },
};

/** The line heading the works is the site's to write. */
export const OwnGuidance: Story = {
  args: {
    works: PAPERS,
    guidance: 'Cite the calculator, and the platform it runs on',
  },
};

/** The button where it actually lives: pushed to the right of a site's bar. */
export const InHeader: Story = {
  args: { reference: PAPER },
  parameters: { layout: 'padded' },
  render: (args: CiteButtonProps) => (
    <div className="sb-header" style={{ width: 'min(60rem, 90vw)' }}>
      <CiteButton {...args} />
    </div>
  ),
};
