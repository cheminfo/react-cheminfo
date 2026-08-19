import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { SiteTheme } from '../src/ecosystem/ui/SiteTheme.tsx';
import { parseTalk } from '../src/slides/core/talk.ts';
import type { SlideshowProps } from '../src/slides/ui/Slideshow.tsx';
import { Slideshow } from '../src/slides/ui/Slideshow.tsx';

import '../styles/chrome.css';
import '../styles/slides.css';

// A deck as a teacher writes it: front matter, slides separated by a rule, a
// layout marker where the default is not what is wanted, and a live tool.
const SOURCE = `---
title: Reading a mass spectrum
event: Analytical chemistry, week 3
date: 2026-09-15
author: Luc Patiny
---

# Reading a mass spectrum
## What the peaks are, and what they are not

---

<!-- layout: section -->

# 1 · The peak is not the molecule

---

A peak is a mass-to-charge ratio.

- the charge is a choice the source made
- the mass is the isotopes, not the average
- one molecule gives a pattern, not a line

<!-- notes: ask who has already fought with a sodium adduct -->

---

<!-- layout: embed -->

# Try it while I talk

https://www.chemcalc.org/?mf=C6H12O6&embed=1

---

<!-- layout: quote -->

> Every peak you cannot explain is a question, not a mistake.

---

<!-- layout: thanks -->

# Questions?

luc.patiny@epfl.ch
`;

const TALK = parseTalk(SOURCE);

function Player(props: SlideshowProps): ReactElement {
  const [index, setIndex] = useState(props.index);

  return (
    <div style={{ height: '100vh' }}>
      <Slideshow {...props} index={index} onIndex={setIndex} />
    </div>
  );
}

const meta = {
  title: 'Slides/Slideshow',
  component: Slideshow,
  args: { talk: TALK, index: 0, onIndex: () => undefined, talkId: 'week-3' },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The player every site of the family uses: one Markdown deck, a canvas authored at 1920×1080 and scaled to the screen, and the projector keys — arrows, space, f, b, w, n.',
      },
    },
  },
  render: (args) => <Player {...args} />,
} satisfies Meta<typeof Slideshow>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The title slide, which is where a talk opens. */
export const Default: Story = {};

/** A section divider: the number is the landmark, the title is the promise. */
export const SectionDivider: Story = { args: { index: 1 } };

/** The slide that carries the argument, with its speaker notes one key away. */
export const Content: Story = { args: { index: 2 } };

/** The tool itself, running on the slide — never a screenshot of it. */
export const LiveTool: Story = { args: { index: 3 } };

/** The same deck played on another site takes that site's two colours. */
export const OnAnotherSite: Story = {
  args: { index: 1 },
  render: (args) => (
    <div style={{ height: '100vh' }}>
      <SiteTheme siteId="lcao" />
      <Player {...args} />
    </div>
  ),
};
