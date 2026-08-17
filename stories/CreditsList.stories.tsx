import { Button, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { CREDITS, credits } from '../src/credits/core/credits.ts';
import type { CreditsListProps } from '../src/credits/ui/CreditsList.tsx';
import { CreditsList } from '../src/credits/ui/CreditsList.tsx';

// What a structure-drawing site actually stands on, in the order it names it.
const STRUCTURE_SITE = credits([
  'openchemlib',
  'react-ocl',
  'react-mf',
  'blueprint',
  'react-science',
  'react-cheminfo',
  'react',
  'vite',
]);

function AboutDialogDemo(props: CreditsListProps): ReactElement {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ padding: 24 }}>
      <Button
        icon="info-sign"
        text="About"
        onClick={() => setIsOpen(true)}
        disabled={isOpen}
      />
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="About smiles.cheminfo.org"
        icon="info-sign"
        style={{ width: 'min(720px, 92vw)' }}
      >
        <DialogBody>
          <p>
            Write a SMILES, see the structure it stands for, and read what each
            part of the string does.
          </p>
          <h5 className="bp6-heading">Credits</h5>
          <CreditsList {...props} />
        </DialogBody>
        <DialogFooter
          actions={<Button text="Close" onClick={() => setIsOpen(false)} />}
        />
      </Dialog>
    </div>
  );
}

const meta = {
  title: 'Credits/CreditsList',
  component: CreditsList,
  args: { entries: STRUCTURE_SITE },
  argTypes: {
    showLicense: { control: 'boolean' },
    className: { control: 'text' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The Credits section of an About dialog: every borrowed work, what it does for the site, and the licence it comes under — which is the part a hand-written list leaves out.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 'min(44rem, 92vw)' }}>
      <CreditsList {...args} />
    </div>
  ),
} satisfies Meta<typeof CreditsList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Without the licences, for a site that names them elsewhere. */
export const WithoutLicenses: Story = {
  args: { showLicense: false },
};

/** The whole registry, which is what the family credits between all its sites. */
export const EveryWork: Story = {
  args: { entries: CREDITS },
};

/** Where the list belongs: under the About dialog's own sentence. */
export const InAboutDialog: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => <AboutDialogDemo {...args} />,
};
