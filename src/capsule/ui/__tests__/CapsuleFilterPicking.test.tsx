import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CapsuleFilter } from '../CapsuleFilter.tsx';
import { capsuleFilterCapsules } from '../capsuleFilterCapsules.tsx';

import type { EquationType } from './capsuleOptions.ts';
import { OPTIONS, TYPES, pressedStates } from './capsuleOptions.ts';

// The capsules are a plain function of the row's props, so they can be read
// and clicked without mounting anything.
function capsulesOf<TValue extends string>(
  props: Parameters<typeof capsuleFilterCapsules<TValue>>[0],
): Array<ReactElement<ClickableProps>> {
  return capsuleFilterCapsules(props) as Array<ReactElement<ClickableProps>>;
}

interface ClickableProps {
  onClick: () => void;
}

test('picking a capsule of a single row reports its value', () => {
  const picked: string[] = [];
  const capsules = capsulesOf({
    options: OPTIONS,
    value: 'all',
    onChange: (value) => picked.push(value),
  });

  capsules[2]?.props.onClick();

  expect(picked).toStrictEqual(['failed']);
});

test('a multiple row fills every selected capsule, and the reset only when none is', () => {
  const some = renderToStaticMarkup(
    <CapsuleFilter
      multiple
      options={TYPES}
      values={['acidoBasic', 'precipitation']}
      allOption={{ label: 'all types', count: 431 }}
      onChange={() => null}
    />,
  );
  const none = renderToStaticMarkup(
    <CapsuleFilter
      multiple
      options={TYPES}
      values={[]}
      allOption={{ label: 'all types', count: 431 }}
      onChange={() => null}
    />,
  );

  expect(some).toContain('all types (431)');
  expect(pressedStates(some)).toStrictEqual(['false', 'true', 'false', 'true']);
  expect(pressedStates(none)).toStrictEqual([
    'true',
    'false',
    'false',
    'false',
  ]);
});

test('a reset capsule saying it is not selected stays empty on an empty row', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter
      multiple
      options={TYPES}
      values={[]}
      allOption={{ label: 'all types', count: 431, selected: false }}
      onChange={() => null}
    />,
  );

  expect(pressedStates(html)).toStrictEqual([
    'false',
    'false',
    'false',
    'false',
  ]);
});

test('a multiple row without a reset capsule draws only its options', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter
      multiple
      options={TYPES}
      values={['complexation']}
      onChange={() => null}
    />,
  );

  expect(pressedStates(html)).toStrictEqual(['false', 'true', 'false']);
  expect(html).not.toContain('all types');
});

test('a capsule toggles within the selection, kept in option order, and the reset clears it', () => {
  const picked: EquationType[][] = [];
  const capsules = capsulesOf<EquationType>({
    multiple: true,
    options: TYPES,
    values: ['precipitation'],
    allOption: { label: 'all types' },
    onChange: (values) => picked.push(values),
  });

  capsules[1]?.props.onClick();
  capsules[3]?.props.onClick();
  capsules[0]?.props.onClick();

  expect(picked).toStrictEqual([['acidoBasic', 'precipitation'], [], []]);
});
