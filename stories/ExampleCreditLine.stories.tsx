import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  CC0_1,
  PUBLIC_DOMAIN,
  ccBy,
} from '../src/credits/core/exampleCredit.ts';
import { ExampleCreditLine } from '../src/credits/ui/ExampleCreditLine.tsx';

const meta = {
  title: 'Credits/ExampleCreditLine',
  component: ExampleCreditLine,
  args: {
    credit: {
      author: 'Xiaojun Wang et al.',
      ...ccBy('3.0'),
      page: 'https://commons.wikimedia.org/wiki/File:PP_cells_in_Pancreatic_Islet.png',
    },
  },
  argTypes: {
    className: { control: 'text' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Who an example is owed to and on what terms: the author links to the page it is published on, the licence to its own text, and Wikimedia Commons is named when the file is there.',
      },
    },
  },
} satisfies Meta<typeof ExampleCreditLine>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A picture of Wikimedia Commons under CC BY, credited the way Commons asks. */
export const FromCommons: Story = {};

/** A dataset published by its own collection, under CC0. */
export const Dataset: Story = {
  args: {
    credit: {
      author: 'Broad Bioimage Benchmark Collection',
      ...CC0_1,
      page: 'https://bbbc.broadinstitute.org/BBBC039',
    },
  },
};

/** In the public domain: there is no licence page to link to. */
export const PublicDomain: Story = {
  args: {
    credit: {
      author: 'Wilson Bentley',
      ...PUBLIC_DOMAIN,
      page: 'https://commons.wikimedia.org/wiki/File:SnowflakesWilsonBentley.jpg',
    },
  },
};
