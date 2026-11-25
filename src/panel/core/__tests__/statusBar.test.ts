import { expect, test } from 'vitest';

import { statusCutStyle, statusRoomLeftStyle } from '../../../core.ts';

test('an item of the status bar is cut with an ellipsis rather than pushed off', () => {
  expect(statusCutStyle).toStrictEqual({
    display: 'block',
    alignItems: 'center',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flexShrink: 1,
  });
});

test('a muted item takes only the room the bar has left, down to an ellipsis', () => {
  expect(statusRoomLeftStyle).toStrictEqual({
    display: 'block',
    alignItems: 'center',
    opacity: 0.6,
    minWidth: '1.2em',
    maxWidth: 'max-content',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  });
});
