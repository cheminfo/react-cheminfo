import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { FigureDownload } from '../src/download/ui/index.ts';

/**
 * A ring drawn to print 2 × 1 inches, as a drawing tool writes it: the size in
 * points, and the structure the picture shows carried in the file.
 */
const RING_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="144pt" height="72pt"',
  ' viewBox="0 0 144 72" data-smiles="c1ccccc1">',
  '<polygon points="52,36 62,18.7 82,18.7 92,36 82,53.3 62,53.3"',
  ' fill="none" stroke="black" stroke-width="1.5"/>',
  '<circle cx="72" cy="36" r="11" fill="none" stroke="black"',
  ' stroke-width="1.5"/></svg>',
].join('');

/** Its size on the page: 2 × 1 inches at 96 pixels to the inch. */
const RING_SIZE = { width: 192, height: 96 };

/**
 * The ring as the page writes it for a file.
 * @returns The document, and its size on the page.
 */
async function writeRing() {
  return { markup: RING_SVG, ...RING_SIZE };
}

const meta = {
  title: 'Download/Printed figure',
  component: FigureDownload,
  args: { unit: 'dpi', fileName: 'benzene' },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A figure drawn to the size it prints at — a structure at a ' +
          "journal's bond length — is offered its resolution in dots per " +
          'inch: 150 for a slide, 300 to 1200 for a journal. The PNG states ' +
          'it, so a document places it at its printed size, and the SVG ' +
          'keeps the size it states.',
      },
    },
  },
} satisfies Meta<typeof FigureDownload>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The page writes the file itself, so the SVG carries the structure behind
 * the picture: it is saved as written, and the PNG is painted from it.
 */
export const Written: Story = {
  args: { writeFigure: writeRing },
  render: (args) => (
    <Panel caption="Pick a resolution, then save: the SVG is saved as written.">
      <FigureDownload {...args} />
    </Panel>
  ),
};

/** A figure on the page whose size is its printed size, read off the page. */
export const OnThePage: Story = {
  args: { targetId: 'ring-figure' },
  render: (args) => (
    <Panel caption="The ring on the page, saved in dots per inch.">
      <FigureDownload {...args} />
    </Panel>
  ),
};

/**
 * The glyph above the ring, as a figure normally carries it.
 * @param props - What the story shows.
 * @param props.caption - What the story is showing.
 * @param props.children - The glyph.
 * @returns The panel.
 */
function Panel(props: { caption: string; children: ReactNode }): ReactElement {
  return (
    <div style={PANEL_STYLE}>
      <p style={CAPTION_STYLE}>{props.caption}</p>
      <div style={BAR_STYLE}>{props.children}</div>
      <div id="ring-figure" style={RING_STYLE}>
        <Ring />
      </div>
    </div>
  );
}

/**
 * The ring the page writes, drawn on the page.
 * @returns The drawing.
 */
function Ring(): ReactElement {
  return (
    <svg
      width={RING_SIZE.width}
      height={RING_SIZE.height}
      viewBox="0 0 144 72"
      role="img"
      aria-label="Benzene"
    >
      <polygon
        points="52,36 62,18.7 82,18.7 92,36 82,53.3 62,53.3"
        fill="none"
        stroke="black"
        strokeWidth={1.5}
      />
      <circle
        cx={72}
        cy={36}
        r={11}
        fill="none"
        stroke="black"
        strokeWidth={1.5}
      />
    </svg>
  );
}

const PANEL_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: 360,
} as const satisfies CSSProperties;

const CAPTION_STYLE = {
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 12,
} as const satisfies CSSProperties;

const BAR_STYLE = {
  display: 'flex',
  justifyContent: 'flex-end',
} as const satisfies CSSProperties;

const RING_STYLE = {
  width: RING_SIZE.width,
  height: RING_SIZE.height,
} as const satisfies CSSProperties;
