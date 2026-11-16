import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';

import type { EmptyGuideProps } from '../src/guide/ui/EmptyGuide.tsx';
import { EmptyGuide, EmptyGuideSection } from '../src/guide/ui/EmptyGuide.tsx';
import { ShortcutList } from '../src/guide/ui/ShortcutList.tsx';

import mirrorUrl from './guideFigures/concave-mirror.svg?url';
import focusUrl from './guideFigures/focus.svg?url';
import imageUrl from './guideFigures/real-image.svg?url';

/** What the box around the guide measures, in CSS pixels. */
interface BoxSize {
  width: number;
  height: number;
}

/**
 * A guide as a tool lays it over its empty view: in a box of a fixed size, so
 * the layout at each size can be looked at — a whole bench, half an editor, a
 * short window, a phone.
 * @param props - The box's size, and the guide.
 * @param props.width - The box's width.
 * @param props.height - The box's height.
 * @param props.guide - What the guide shows.
 * @returns The box and the guide in it.
 */
function GuideInBox(props: BoxSize & { guide: EmptyGuideProps }): ReactElement {
  const style: CSSProperties = {
    ...BOX_STYLE,
    width: props.width,
    height: props.height,
  };
  return (
    <div style={style} data-testid="guide-box">
      <EmptyGuide {...props.guide} />
    </div>
  );
}

const BOX_STYLE: CSSProperties = {
  position: 'relative',
  boxSizing: 'border-box',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
};

/** The guide of an optics bench: real help, two ways in, three examples. */
const BENCH_GUIDE: EmptyGuideProps = {
  actions: [
    { label: 'Start building', icon: 'build', onSelect: () => undefined },
    { label: 'Open a file', icon: 'folder-open', onSelect: () => undefined },
  ],
  figuresTitle: 'or click an example to open it',
  help: (
    <>
      <EmptyGuideSection title="Build a bench">
        <p>
          Drag a source, a lens or a mirror from the palette onto the bench.
        </p>
        <p>The rays are traced again at every move.</p>
      </EmptyGuideSection>
      <EmptyGuideSection title="Move what is on it">
        <ShortcutList
          rows={[
            { keys: ['Drag'], label: 'Move a piece' },
            { keys: ['R'], label: 'Turn it by 15°' },
            { keys: ['Del'], label: 'Take it away' },
            { keys: ['Ctrl', 'Z'], label: 'Undo' },
          ]}
        />
      </EmptyGuideSection>
      <EmptyGuideSection title="Read the image">
        <p>Point at a ray to see where it comes from.</p>
        <p>The focal points are marked on the axis.</p>
      </EmptyGuideSection>
    </>
  ),
  linksTitle: 'Learn',
  links: [
    { label: 'Lenses in ten minutes', href: '#talk' },
    { label: 'Every key and tool', href: '#help' },
  ],
  hints: ['Hold Shift while dragging to keep a piece on the axis.'],
  figures: [
    {
      src: imageUrl,
      alt: 'A converging lens forming a real image',
      share: 2,
      title: 'Open this example',
      onSelect: () => undefined,
    },
    {
      stack: [
        {
          src: focusUrl,
          alt: 'Parallel rays brought to a focus',
          title: 'Open this example',
          onSelect: () => undefined,
        },
        {
          src: mirrorUrl,
          alt: 'A concave mirror',
          title: 'Open this example',
          onSelect: () => undefined,
        },
      ],
    },
  ],
};

const meta = {
  title: 'Guide/EmptyGuide sizes',
  component: GuideInBox,
  args: { width: 1000, height: 600, guide: BENCH_GUIDE },
  argTypes: {
    width: { control: { type: 'range', min: 280, max: 1400, step: 10 } },
    height: { control: { type: 'range', min: 240, max: 900, step: 10 } },
    guide: { control: false },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One guide in boxes of the sizes tools give it. A large box shows the whole help over the figures; a small one keeps the figures and says only the first line of each section; a phone-sized one keeps the words and the buttons.',
      },
    },
  },
} satisfies Meta<typeof GuideInBox>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A whole bench, as draw, optics and cell open on. */
export const Large: Story = {};

/** Half an editor, as a structure editor beside its results leaves. */
export const HalfEditor: Story = { args: { width: 590, height: 370 } };

/** The smallest box that still shows the figures. */
export const Small: Story = { args: { width: 480, height: 320 } };

/** A phone held upright: the words and the buttons alone. */
export const Phone: Story = { args: { width: 360, height: 640 } };
