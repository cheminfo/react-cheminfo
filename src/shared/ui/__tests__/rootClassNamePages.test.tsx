import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { DelimitedTextPanel } from '../../../delimited/ui/DelimitedTextPanel.tsx';
import { siteById } from '../../../ecosystem/core/lookup.ts';
import { EcosystemButton } from '../../../ecosystem/ui/EcosystemButton.tsx';
import { EcosystemLinks } from '../../../ecosystem/ui/EcosystemLinks.tsx';
import { EcosystemMenu } from '../../../ecosystem/ui/EcosystemMenu.tsx';
import { SiteTile } from '../../../ecosystem/ui/SiteTile.tsx';
import { SiteMark } from '../../../ecosystem/ui/marks.tsx';
import { HelpBody } from '../../../help/ui/HelpBody.tsx';
import { HelpTooltip } from '../../../help/ui/HelpTooltip.tsx';
import {
  ExerciseLevelTag,
  ExerciseStatusIcon,
} from '../../../pedagogy/ui/ExerciseTags.tsx';
import { GlossaryDefinition } from '../../../pedagogy/ui/GlossaryDefinition.tsx';
import { HintLadder } from '../../../pedagogy/ui/HintLadder.tsx';
import { SyntaxTooltip } from '../../../pedagogy/ui/SyntaxTooltip.tsx';
import type { TalkManifest } from '../../../slides/core/index.ts';
import { BackToSlides } from '../../../slides/ui/BackToSlides.tsx';
import { TalkList } from '../../../slides/ui/TalkList.tsx';

import { PROBE, noop, rootClasses } from './rootClasses.ts';

const HELP = {
  title: 'Word boundary',
  body: 'Matches between a word character and a non-word one.',
};

const SYNTAX = {
  syntax: String.raw`\b`,
  name: 'Word boundary',
  tag: 'RegExp',
  summary: 'Matches between a word character and a non-word one.',
  detail: 'It consumes nothing, so it can sit at either end of a pattern.',
  example: {
    code: String.raw`\bcat\b`,
    input: 'a cat in a category',
    note: 'matches the animal, not the word category',
  },
};

const TALKS: TalkManifest[] = [
  {
    site: 'surge',
    origin: 'https://surge.cheminfo.org',
    talks: [
      {
        id: 'enumeration',
        title: 'Structure enumeration',
        event: 'ICCS',
        date: '2026-03-08',
        slideCount: 12,
      },
    ],
  },
];

/**
 * The page parts, and the names their root element must end with: the
 * component's own first, then the caller's, except on a Blueprint popover
 * target, which writes the caller's first.
 */
const CASES: Array<[string, ReactElement, string[]]> = [
  [
    'DelimitedTextPanel',
    <DelimitedTextPanel
      key="delimited"
      rows={[['H2O', '18.015']]}
      header={['name', 'mass']}
      className={PROBE}
    />,
    ['delimited-text', PROBE],
  ],
  [
    'EcosystemButton',
    <EcosystemButton key="tools" className={PROBE} />,
    ['ecosystem-button', PROBE],
  ],
  [
    'EcosystemLinks',
    <EcosystemLinks key="links" className={PROBE} />,
    ['ecosystem-links', PROBE],
  ],
  [
    'EcosystemMenu',
    <EcosystemMenu key="menu" className={PROBE} />,
    ['ecosystem-menu', PROBE],
  ],
  [
    'SiteTile',
    <SiteTile
      key="tile"
      site={siteById('tex')}
      isCurrent={false}
      className={PROBE}
    />,
    [PROBE],
  ],
  ['SiteMark', <SiteMark key="mark" siteId="pdb" className={PROBE} />, [PROBE]],
  [
    'HelpBody',
    <HelpBody key="help" content={HELP} className={PROBE} />,
    ['help-body', PROBE],
  ],
  [
    'HelpTooltip',
    <HelpTooltip key="tooltip" content={HELP} className={PROBE}>
      <button type="button">Flags</button>
    </HelpTooltip>,
    [PROBE, 'bp6-popover-target'],
  ],
  [
    'ExerciseLevelTag',
    <ExerciseLevelTag key="level" level="advanced" className={PROBE} />,
    [PROBE],
  ],
  [
    'ExerciseStatusIcon',
    <ExerciseStatusIcon key="status" status="solved" className={PROBE} />,
    [PROBE],
  ],
  [
    'GlossaryDefinition',
    <GlossaryDefinition
      key="definition"
      entry={{ title: 'Anchor', summary: 'A position.', examples: [] }}
      className={PROBE}
    />,
    [PROBE],
  ],
  [
    'HintLadder',
    <HintLadder
      key="hints"
      hints={['Look for the boundary.']}
      revealed={1}
      className={PROBE}
    />,
    [PROBE],
  ],
  [
    'SyntaxTooltip',
    <SyntaxTooltip key="syntax" content={SYNTAX} className={PROBE}>
      <span>row</span>
    </SyntaxTooltip>,
    [PROBE, 'bp6-popover-target'],
  ],
  [
    'BackToSlides',
    <BackToSlides
      key="back"
      origin={{ talkId: 'asms-2026', slide: 4 }}
      href="/talk/asms-2026?slide=4"
      className={PROBE}
    />,
    ['back-to-slides', 'no-print', PROBE],
  ],
  [
    'TalkList',
    <TalkList key="talks" manifests={TALKS} onOpen={noop} className={PROBE} />,
    ['talk-list', PROBE],
  ],
];

test.each(CASES)(
  "%s adds a caller's class to its root element",
  (_name, element, expected) => {
    const classes = rootClasses(renderToStaticMarkup(element));

    expect(classes.slice(-expected.length)).toStrictEqual(expected);
  },
);
