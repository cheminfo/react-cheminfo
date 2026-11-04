import { expect, test } from 'vitest';

import {
  readWorkspaceText,
  readWorkspaceValue,
  workspaceFileName,
  writeWorkspaceText,
} from '../workspaceFile.ts';

test('a workspace file says what it is, whose it is, and what it holds', () => {
  const text = writeWorkspaceText(
    { id: 'w1', name: 'Teaching', preferences: { panels: ['structure'] } },
    'draw',
  );

  expect(JSON.parse(text)).toStrictEqual({
    format: 'cheminfo-workspace',
    version: 1,
    site: 'draw',
    id: 'w1',
    name: 'Teaching',
    preferences: { panels: ['structure'] },
  });
  expect(readWorkspaceText(text, 'draw')).toStrictEqual({
    id: 'w1',
    name: 'Teaching',
    preferences: { panels: ['structure'] },
  });
});

test('a workspace with no name or no preferences reads with plain ones', () => {
  const record = readWorkspaceValue(
    { format: 'cheminfo-workspace', site: 'draw', id: 'w2', name: '  ' },
    'draw',
  );

  expect(record).toStrictEqual({
    id: 'w2',
    name: 'Workspace',
    preferences: {},
  });
});

test("JSON that is no workspace, and another site's workspace, are refused", () => {
  expect(() => readWorkspaceText('{oops', 'draw')).toThrow(
    'This file is not JSON, so no workspace was opened.',
  );
  expect(() => readWorkspaceText('{"panels":[]}', 'draw')).toThrow(
    'This file holds no workspace, so none was opened.',
  );
  expect(() =>
    readWorkspaceValue(
      { format: 'cheminfo-workspace', site: '3d', name: 'Spin' },
      'draw',
    ),
  ).toThrow('This workspace was made for 3d, so it was not opened here.');
});

test('a workspace file is named after the workspace and its site', () => {
  expect(workspaceFileName('Teaching', 'draw')).toBe(
    'Teaching.draw-workspace.json',
  );
  expect(workspaceFileName('', 'draw')).toBe('workspace.draw-workspace.json');
});
