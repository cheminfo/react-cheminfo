import type { Meta, StoryObj } from '@storybook/react-vite';

import type { TalkManifest } from '../src/slides/core/talkManifest.ts';
import { TalkList } from '../src/slides/ui/TalkList.tsx';

import '../styles/chrome.css';
import '../styles/slides.css';

const CHEMCALC: TalkManifest = {
  site: 'chemcalc',
  origin: 'https://www.chemcalc.org',
  talks: [
    {
      id: '20260824_IMSC',
      title: 'Mass spectrometry without a spectrometer',
      event: 'IMSC 2026',
      date: '2026-08-24',
      author: 'Luc Patiny',
      slideCount: 34,
    },
    {
      id: 'minY_algorithm',
      title: 'Finding the smallest y in a million points',
      date: '2026-07-10',
      slideCount: 12,
    },
  ],
};

const LEARN: TalkManifest = {
  site: 'learn',
  origin: 'https://learn.cheminfo.org',
  talks: [
    {
      id: 'week-3',
      title: 'Reading a mass spectrum',
      event: 'Analytical chemistry, week 3',
      date: '2026-09-15',
      slideCount: 6,
    },
  ],
};

const meta = {
  title: 'Slides/TalkList',
  component: TalkList,
  args: { manifests: [LEARN, CHEMCALC], onOpen: () => undefined },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'What /talks shows on one site, and what learn.cheminfo.org shows for the whole family: every deck, grouped by the site that published it, most recent first.',
      },
    },
  },
} satisfies Meta<typeof TalkList>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The family's decks, grouped by site. */
export const Default: Story = {};

/** One site's own list, where the grouping heading would say nothing. */
export const OneSite: Story = { args: { manifests: [CHEMCALC] } };

/** A site that has published nothing yet. */
export const Empty: Story = {
  args: {
    manifests: [
      { site: 'surge', origin: 'https://surge.cheminfo.org', talks: [] },
    ],
  },
};
