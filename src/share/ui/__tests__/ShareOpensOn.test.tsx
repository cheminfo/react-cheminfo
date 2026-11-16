import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { OpensOnLinks, ShareExample } from '../../core/index.ts';
import { ShareOpensOn } from '../ShareOpensOn.tsx';

const EXAMPLES: ShareExample[] = [
  { id: 'rc', name: 'Charging a capacitor' },
  { id: 'multivibrator', name: 'Multivibrator', description: 'Two LEDs.' },
];

const BLANK: OpensOnLinks = {
  search: '',
  example: null,
  changed: false,
  screen: undefined,
};

function render(links: OpensOnLinks, example = 'rc', screenLabel?: string) {
  return renderToStaticMarkup(
    <ShareOpensOn
      links={links}
      choice={{ opensOn: 'example', example }}
      onChange={() => undefined}
      examples={EXAMPLES}
      screenLabel={screenLabel}
    />,
  );
}

function inputs(html: string): string[] {
  return [...html.matchAll(/<input[^>]*>/g)].map((match) => match[0]);
}

function radios(html: string): string[] {
  const values: string[] = [];
  for (const input of inputs(html)) {
    if (!input.includes('type="radio"')) continue;
    values.push(/value="(?<value>\w+)"/.exec(input)?.groups?.value ?? '');
  }
  return values;
}

test('every example can be picked, whatever is on screen', () => {
  const html = render(BLANK, 'multivibrator');

  expect(radios(html)).toStrictEqual(['example', 'none']);
  expect(html).toContain('Opens on');
  expect(html).toContain('<option value="rc">Charging a capacitor</option>');
  expect(html).toContain(
    '<option value="multivibrator" selected="">Multivibrator</option>',
  );
  expect(html).toContain('Two LEDs.');
  expect(html).toContain('The page alone');
});

test('what is on screen is offered when a link can carry it', () => {
  const html = render(
    { ...BLANK, screen: { entries: [['bench', 'abc']] } },
    'rc',
    'This circuit',
  );

  expect(radios(html)).toStrictEqual(['screen', 'example', 'none']);
  expect(html).toContain('This circuit');
  expect(html).toContain('there is no file to send');
});

test('what is too large for a link is offered, but cannot be picked', () => {
  const html = render({ ...BLANK, screen: 'too-large' });

  const screen = inputs(html).find((input) => input.includes('"screen"'));

  expect(screen).toContain('disabled=""');
  expect(html).toContain('save it as a file and send the file');
});

test('a changed example says the changes stay behind', () => {
  const changed = { ...BLANK, example: 'multivibrator', changed: true };

  expect(render(changed, 'multivibrator')).toContain(
    'the changes made here stay behind',
  );
  expect(render(changed, 'rc')).not.toContain('stay behind');
});

test('examples with a group are listed under it', () => {
  const html = renderToStaticMarkup(
    <ShareOpensOn
      links={BLANK}
      choice={{ opensOn: 'example', example: 'nmr-1' }}
      onChange={() => undefined}
      examples={[
        { id: 'plain', name: 'Plain' },
        { id: 'nmr-1', name: 'Coupling', group: 'NMR' },
        { id: 'ms-1', name: 'Isotopes', group: 'MS' },
        { id: 'nmr-2', name: 'Shifts', group: 'NMR' },
      ]}
    />,
  );

  expect(html).toContain(
    '<option value="plain">Plain</option><optgroup label="NMR"><option value="nmr-1" selected="">Coupling</option><option value="nmr-2">Shifts</option></optgroup><optgroup label="MS"><option value="ms-1">Isotopes</option></optgroup>',
  );
});
