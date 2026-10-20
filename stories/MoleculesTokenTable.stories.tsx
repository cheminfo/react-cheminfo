import type { Meta, StoryObj } from '@storybook/react-vite';

import type { MoleculesTokenCheck } from '../src/moleculesToken/core/moleculesToken.ts';
import { MoleculesTokenTable } from '../src/moleculesToken/ui/MoleculesTokenTable.tsx';

const CHECKED_AT = Date.UTC(2026, 9, 20, 20, 5);

const unchecked = {
  message: null,
  source: null,
  hint: null,
  email: null,
  issuedAt: null,
  lastUsedAt: null,
  checkedAt: CHECKED_AT,
};

const VALID: MoleculesTokenCheck = {
  ...unchecked,
  variable: 'MOLECULES_TOKEN_NPATLAS',
  sources: ['NP Atlas'],
  verdict: 'ok',
  source: 'NP Atlas',
  hint: 'mct_1a2b3c4d',
  email: 'chembio@cheminfo.org',
  issuedAt: Date.UTC(2026, 8, 1, 9, 30),
  lastUsedAt: Date.UTC(2026, 9, 20, 19, 59),
};

const CHECKS: MoleculesTokenCheck[] = [
  VALID,
  {
    ...unchecked,
    variable: 'MOLECULES_TOKEN_LOTUS',
    sources: ['LOTUS'],
    verdict: 'otherSource',
    source: 'COCONUT',
    hint: 'mct_9f8e7d6c',
  },
  {
    ...unchecked,
    variable: 'MOLECULES_TOKEN_NPASS',
    sources: ['NPASS'],
    verdict: 'refused',
    message: 'this token was revoked',
  },
  {
    ...unchecked,
    variable: 'MOLECULES_TOKEN_CMAUP',
    sources: ['CMAUP'],
    verdict: 'unset',
  },
  {
    ...unchecked,
    variable: 'MOLECULES_TOKEN_MIBIG',
    sources: ['MIBiG'],
    verdict: 'uncheckable',
  },
  {
    ...unchecked,
    variable: 'MOLECULES_TOKEN_STREPTOMEDB',
    sources: ['StreptomeDB'],
    verdict: 'unanswered',
    message: 'no answer within 5000 ms',
  },
];

const meta = {
  title: 'Molecules/MoleculesTokenTable',
  component: MoleculesTokenTable,
  args: { checks: CHECKS, pending: false },
  argTypes: { pending: { control: 'boolean' } },
  parameters: {
    docs: {
      description: {
        component:
          'The tokens a site holds for molecules.cheminfo.org, with what it said of each when they were last checked. A token is changed in the server’s .env, never here.',
      },
    },
  },
} satisfies Meta<typeof MoleculesTokenTable>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every verdict, on the operator's page, with the button asking again. */
export const Operator: Story = {
  args: { onCheckAgain: () => undefined },
};

/** One token, on a page anyone can open: no holder, no button. */
export const Public: Story = {
  args: {
    checks: [{ ...VALID, email: null, hint: null }],
  },
};

/** Before the service holding the tokens checked them. */
export const NotCheckedYet: Story = {
  args: { checks: null },
};
