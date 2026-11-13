import { expect, test } from 'vitest';

import { listFiles, listFolders, searchFiles } from '../folderListing.ts';

interface Tree {
  [name: string]: number | Tree;
}

// A folder of this computer: a number is a file changed at that time.
function directoryOf(name: string, tree: Tree): FileSystemDirectoryHandle {
  return {
    kind: 'directory',
    name,
    values: async function* values() {
      for (const [child, content] of Object.entries(tree)) {
        yield typeof content === 'number'
          ? {
              kind: 'file',
              name: child,
              getFile: () => Promise.resolve({ lastModified: content }),
            }
          : directoryOf(child, content);
      }
    },
  } as unknown as FileSystemDirectoryHandle;
}

const COURSE = directoryOf('Course', {
  'Nernst.tex.svg': 3,
  'notes.txt': 9,
  '.git': { 'Hidden.tex.svg': 9 },
  'Week 10': { 'Gibbs.tex.svg': 5 },
  'Week 2': { 'Raoult.tex.svg': 1, Lab: { 'Arrhenius.tex.svg': 7 } },
});

test('a folder lists the site’s files, the latest first, and its folders by name', async () => {
  const files = await listFiles(COURSE, ['.tex.svg']);

  expect(files.map((file) => file.name)).toStrictEqual(['Nernst.tex.svg']);
  await expect(listFolders(COURSE)).resolves.toStrictEqual([
    'Week 2',
    'Week 10',
  ]);
});

test('a search reads every folder below, saying where each file is', async () => {
  const found = await searchFiles(COURSE, ['.tex.svg']);

  expect(found.map((file) => [file.name, file.path])).toStrictEqual([
    ['Arrhenius.tex.svg', ['Week 2', 'Lab']],
    ['Gibbs.tex.svg', ['Week 10']],
    ['Nernst.tex.svg', []],
    ['Raoult.tex.svg', ['Week 2']],
  ]);
});
