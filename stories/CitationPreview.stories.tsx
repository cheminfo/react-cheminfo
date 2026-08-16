import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

import { CITATION_FORMATS } from '../src/citation/core/formats.ts';
import { CITATION_STYLES } from '../src/citation/core/segments.ts';
import { CitationPreview } from '../src/citation/ui/CitationPreview.tsx';

import { PAPER } from './paper.ts';

// The downloads preview under their own format, so the list is the copy menu's.
const FORMAT_IDS = CITATION_FORMATS.map((format) => format.id);
const STYLE_IDS = CITATION_STYLES.map((style) => style.id);

// The preview is written for the inside of a Blueprint tooltip, so it is only
// legible on the dark plate that tooltip gives it.
const onDarkPlate: Decorator = (Story) => (
  <div
    style={{
      padding: 12,
      borderRadius: 6,
      background: '#252a31',
      boxShadow: '0 4px 14px rgb(16 32 48 / 40%)',
    }}
  >
    <Story />
  </div>
);

const meta = {
  title: 'Citation/CitationPreview',
  component: CitationPreview,
  decorators: [onDarkPlate],
  args: { reference: PAPER, format: 'html', style: 'acs' },
  argTypes: {
    format: { control: 'select', options: FORMAT_IDS },
    style: { control: 'select', options: STYLE_IDS },
  },
  parameters: {
    docs: {
      description: {
        component:
          'What a copy of the reference puts on the clipboard, as it will read once pasted.',
      },
    },
  },
} satisfies Meta<typeof CitationPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** HTML is previewed as it reads once pasted, with the emphasis of the style. */
export const Html: Story = {};

export const Markdown: Story = {
  args: { format: 'markdown', style: 'nature' },
};

export const BibTeX: Story = {
  // Storybook would otherwise read the export as three words, "Bib Te X".
  name: 'BibTeX',
  args: { format: 'bibtex', style: undefined },
};

export const Ris: Story = {
  args: { format: 'ris', style: undefined },
};

export const DoiLink: Story = {
  args: { format: 'doi', style: undefined },
};
