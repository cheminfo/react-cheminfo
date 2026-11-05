import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

test('react-science still leaves its bar uncaptured, which captureBarPointer makes up for', () => {
  const hook = readFileSync(
    join(
      import.meta.dirname,
      '../../../../node_modules/react-science/lib/components/split_pane/use_split_pane_size.js',
    ),
    'utf8',
  );

  // Failing here means the installed react-science captures the pointer
  // itself: delete captureBarPointer.ts, this test and the `onPointerDown` of
  // splitPanes.tsx that calls it, and start the react-science peer range at
  // that release.
  expect(hook).not.toContain('setPointerCapture');
});
