import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { EmptyGuide, EmptyGuideSection } from '../src/guide/ui/EmptyGuide.tsx';
import { ShortcutList } from '../src/guide/ui/ShortcutList.tsx';
import { StructureEditor } from '../src/structure/ui/StructureEditor.tsx';

import mirrorUrl from './guideFigures/concave-mirror.svg?url';
import focusUrl from './guideFigures/focus.svg?url';
import imageUrl from './guideFigures/real-image.svg?url';

/**
 * An empty editor carrying a site's guide, at the size half a page gives it:
 * the guide sits beside the toolbar and under the corner buttons, a stroke
 * starts on its words, and Start drawing sends it away.
 * @param props - The editor's size.
 * @param props.width - Its width, in CSS pixels.
 * @param props.height - Its height, in CSS pixels.
 * @returns The editor and what it last reported.
 */
function GuidedEditor(props: { width: number; height: number }): ReactElement {
  const [started, setStarted] = useState(false);
  const [smiles, setSmiles] = useState('');
  const guide = started ? undefined : (
    <EmptyGuide
      actions={[
        {
          label: 'Start drawing',
          icon: 'draw',
          onSelect: () => setStarted(true),
        },
      ]}
      help={
        <>
          <EmptyGuideSection title="Draw">
            <ShortcutList
              rows={[
                { keys: ['Click'], label: 'Draw a bond' },
                { keys: ['Drag'], label: 'Aim it' },
              ]}
            />
          </EmptyGuideSection>
          <EmptyGuideSection title="Search">
            <p>Draw a fragment, and the molecules holding it are listed.</p>
          </EmptyGuideSection>
        </>
      }
      figuresTitle="or click an example to open it"
      figures={[
        { src: imageUrl, alt: 'An example', share: 2 },
        {
          stack: [
            { src: focusUrl, alt: 'A second example' },
            { src: mirrorUrl, alt: 'A third example' },
          ],
        },
      ]}
    />
  );
  return (
    <div style={{ width: props.width }}>
      <StructureEditor
        onChange={(change) => setSmiles(change.smiles)}
        guide={guide}
        splash={false}
        debounce={0}
        style={{ height: props.height }}
      />
      <p style={READOUT_STYLE} data-testid="guided-smiles">
        {smiles === '' ? '—' : smiles}
      </p>
    </div>
  );
}

const READOUT_STYLE: CSSProperties = {
  margin: '6px 0 0',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.75rem',
};

const meta = {
  title: 'Structure/StructureEditor guide',
  component: GuidedEditor,
  args: { width: 640, height: 400 },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "A structure editor given a site's `<EmptyGuide>`: while the canvas is empty the guide stands in for the splash, beside the toolbar and under the corner buttons. The pointer goes through it, so a stroke can start on its words; it goes at the press, and Start drawing sends it away.",
      },
    },
  },
} satisfies Meta<typeof GuidedEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The editor at the size half a page gives it. */
export const HalfPage: Story = {};
