import { expect, test } from 'vitest';

import {
  nextPosition,
  previousPosition,
  slideStepCount,
  splitSteps,
  talkStepCounts,
} from '../slideSteps.ts';
import { parseTalk } from '../talk.ts';

const BODY = `## A reflux in one minute

1. Double-click the **round-bottom flask**
2. Click the Allihn condenser,
   then just above the neck
3. Click the heating mantle, then under the flask

Then switch it on.

https://glassware.cheminfo.org/?embed=1&demo=reflux`;

test('a steps slide is its prose, its list, and the tool it frames', () => {
  expect(splitSteps(BODY)).toStrictEqual({
    intro: '## A reflux in one minute',
    steps: [
      'Double-click the **round-bottom flask**',
      'Click the Allihn condenser, then just above the neck',
      'Click the heating mantle, then under the flask',
    ],
    outro: 'Then switch it on.',
    src: 'https://glassware.cheminfo.org/?embed=1&demo=reflux',
  });
});

test('a bulleted list with blank lines between its items is one list', () => {
  const { steps, outro } = splitSteps('# Title\n\n- one\n\n- two\n\n* three');

  expect(steps).toStrictEqual(['one', 'two', 'three']);
  expect(outro).toBe('');
});

test('a body with no list has no steps, and keeps its prose', () => {
  expect(splitSteps('# Only a title')).toStrictEqual({
    intro: '# Only a title',
    steps: [],
    outro: '',
    src: null,
  });
});

test('only a steps slide is walked through', () => {
  expect(slideStepCount({ layout: 'steps', body: BODY })).toBe(3);
  expect(slideStepCount({ layout: 'content', body: BODY })).toBe(0);
});

const TALK = parseTalk(`# Title

---

<!-- layout: steps -->

- a
- b
- c

---

Plain slide

---

<!-- layout: steps -->

- d
- e`);

test('a talk counts the steps of each slide', () => {
  expect(talkStepCounts(TALK)).toStrictEqual([0, 3, 0, 2]);
});

test('forward walks the steps of a slide before leaving it', () => {
  const counts = talkStepCounts(TALK);

  expect(nextPosition({ slide: 0, step: 0 }, counts)).toStrictEqual({
    slide: 1,
    step: 0,
  });
  expect(nextPosition({ slide: 1, step: 0 }, counts)).toStrictEqual({
    slide: 1,
    step: 1,
  });
  expect(nextPosition({ slide: 1, step: 2 }, counts)).toStrictEqual({
    slide: 2,
    step: 0,
  });
});

test('forward at the last step of the talk stays there', () => {
  const counts = talkStepCounts(TALK);

  expect(nextPosition({ slide: 3, step: 1 }, counts)).toStrictEqual({
    slide: 3,
    step: 1,
  });
});

test('back walks the steps back, then lands on the last step before', () => {
  const counts = talkStepCounts(TALK);

  expect(previousPosition({ slide: 1, step: 2 }, counts)).toStrictEqual({
    slide: 1,
    step: 1,
  });
  expect(previousPosition({ slide: 2, step: 0 }, counts)).toStrictEqual({
    slide: 1,
    step: 2,
  });
  expect(previousPosition({ slide: 1, step: 0 }, counts)).toStrictEqual({
    slide: 0,
    step: 0,
  });
  expect(previousPosition({ slide: 0, step: 0 }, counts)).toStrictEqual({
    slide: 0,
    step: 0,
  });
});
