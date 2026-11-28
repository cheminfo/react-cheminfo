import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { parseTalk } from '../src/slides/core/talk.ts';
import { MoleculesSlide } from '../src/slides/molecules/MoleculesSlide.tsx';
import type { SlideshowProps } from '../src/slides/ui/Slideshow.tsx';
import { Slideshow } from '../src/slides/ui/Slideshow.tsx';
import { sectionWithGlyph } from '../src/slides/ui/sectionWithGlyph.tsx';

import '../styles/chrome.css';
import '../styles/slides.css';

// The layouts a site registers from the library rather than writing them: a
// section with a cartoon, structures over their names, and the closing slide
// the player draws itself.
const SOURCE = `---
title: Two stimulants
event: Pharmacology, week 5
---

# Two stimulants

---

<!-- layout: section -->

<!-- glyph: ring -->

# 1 · The ring they share

---

<!-- layout: molecules -->

## Two stimulants

- one blocks a transporter
- one blocks a receptor

<!-- molecules:
Cocaine CN1[C@H]2CC[C@@H]1[C@H]([C@H](C2)OC(=O)c1ccccc1)C(=O)OC
Caffeine Cn1cnc2c1c(=O)n(C)c(=O)n2C
-->

---

<!-- layout: end -->

# What you can do now

- Draw both structures
- Find the ring they share
- Name the target of each

<!-- sites: draw, nmr -->
`;

const TALK = parseTalk(SOURCE);

function Ring(): ReactElement {
  return (
    <circle
      cx={310}
      cy={120}
      r={96}
      fill="none"
      stroke="var(--accent)"
      strokeWidth={8}
    />
  );
}

const LAYOUTS = {
  section: sectionWithGlyph({ ring: Ring }),
  molecules: MoleculesSlide,
};

function Player(props: SlideshowProps): ReactElement {
  const [index, setIndex] = useState(props.index);

  return (
    <div style={{ height: '100vh' }}>
      <Slideshow {...props} index={index} onIndex={setIndex} />
    </div>
  );
}

const meta = {
  title: 'Slides/Layouts',
  component: Slideshow,
  args: {
    talk: TALK,
    index: 1,
    onIndex: () => undefined,
    talkId: 'week-5',
    layouts: LAYOUTS,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The layouts a site takes from the library: a section divider with the cartoon its marker names, structures over their names, and the closing slide naming the sites the talk showed.',
      },
    },
  },
  render: (args) => <Player {...args} />,
} satisfies Meta<typeof Slideshow>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A section divider with the cartoon `<!-- glyph: ring -->` names. */
export const SectionWithACartoon: Story = {};

/** Up to six structures, each over its name, beside the slide's text. */
export const Molecules: Story = { args: { index: 2 } };

/** What the talk covered, beside every site it showed. */
export const ClosingSlide: Story = { args: { index: 3 } };
