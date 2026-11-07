import { expect, test } from 'vitest';

import {
  readFigureInputs,
  readFigureSource,
} from '../../../download/core/figureSource.ts';
import { readFigureState } from '../../../download/core/figureState.ts';
import { answerGet } from '../answerGet.ts';
import type { HostOutputs } from '../hostOutputs.ts';
import type { HostItem, ResultMessage, ToolInterface } from '../protocol.ts';

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20"/></svg>';

const TOOL: ToolInterface = {
  name: '3d',
  inputs: [],
  outputs: [
    { key: 'conformer', kind: 'chem.molfile.3d' },
    { key: 'figure', kind: 'image.svg' },
  ],
};

const CONFORMER: HostItem = {
  key: 'conformer',
  kind: 'chem.molfile.3d',
  value: { molfile: 'M  END' },
};

function outputsDrawing(svg: string): HostOutputs {
  return {
    read: () => [CONFORMER],
    subscribe: () => stopListening,
    render: {
      figure: () =>
        Promise.resolve({ key: 'figure', kind: 'image.svg', value: { svg } }),
    },
  };
}

test('a picture handed back says which page drew it, framing left out', async () => {
  const result = await answerGet(
    { type: 'get', id: 'g1', keys: ['conformer', 'figure'] },
    TOOL,
    outputsDrawing(FIGURE),
    {
      address:
        'https://3d.cheminfo.org/?embed=1&hide=intro&smiles=CCO&view=1,2',
    },
  );

  const items = itemsOf(result);

  expect(items[0]).toStrictEqual(CONFORMER);
  expect(readFigureSource(svgOf(items[1]))).toStrictEqual({
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO&view=1,2',
  });
});

test('a picture that already names its source keeps it, and a page with no address writes none', async () => {
  const sourced = await answerGet(
    { type: 'get', id: 'g2', keys: ['figure'] },
    TOOL,
    outputsDrawing(
      FIGURE.replace(
        '<rect',
        '<metadata><x:source xmlns:x="https://www.cheminfo.org/ns/figure-source" site="lcao" href="https://lcao.cheminfo.org/"/></metadata><rect',
      ),
    ),
    { address: 'https://3d.cheminfo.org/?smiles=CCO' },
  );
  const bare = await answerGet(
    { type: 'get', id: 'g3', keys: ['figure'] },
    TOOL,
    outputsDrawing(FIGURE),
  );

  expect(readFigureSource(svgOf(itemsOf(sourced)[0]))).toStrictEqual({
    site: 'lcao',
    href: 'https://lcao.cheminfo.org/',
  });
  expect(svgOf(itemsOf(bare)[0])).toBe(FIGURE);
});

test('a picture handed back carries what the page was drawn from, read once, and only when a picture is asked for', async () => {
  const spectrum = {
    kind: 'spectra.ir.jdx',
    key: 'spectra',
    label: 'ethanol.jdx',
    value: { jdx: '##TITLE=ethanol\n##END=' },
  };
  let reads = 0;
  const inputs = () => {
    reads++;
    return [spectrum];
  };
  const page = { address: 'https://vibrations.cheminfo.org/ir', inputs };

  const conformer = await answerGet(
    { type: 'get', id: 'g4', keys: ['conformer'] },
    TOOL,
    outputsDrawing(FIGURE),
    page,
  );
  const figure = await answerGet(
    { type: 'get', id: 'g5', keys: ['figure'] },
    TOOL,
    outputsDrawing(FIGURE),
    page,
  );
  const svg = svgOf(itemsOf(figure)[0]);

  expect(itemsOf(conformer)).toStrictEqual([CONFORMER]);
  expect(reads).toBe(1);
  expect(readFigureSource(svg)).toStrictEqual({
    site: '3d',
    href: 'https://vibrations.cheminfo.org/ir',
  });
  await expect(readFigureInputs(svg)).resolves.toStrictEqual([spectrum]);
});

test('a page that cannot say what it was drawn from still hands its picture back', async () => {
  const result = await answerGet(
    { type: 'get', id: 'g6', keys: ['figure'] },
    TOOL,
    outputsDrawing(FIGURE),
    {
      address: 'https://3d.cheminfo.org/?smiles=CCO',
      inputs: () => {
        throw new Error('No spectrum to write.');
      },
    },
  );
  const svg = svgOf(itemsOf(result)[0]);

  expect(readFigureSource(svg)).toStrictEqual({
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO',
  });
  await expect(readFigureInputs(svg)).resolves.toStrictEqual([]);
});

test('a picture handed back carries what the page computed, and one that cannot say is still handed back', async () => {
  const state = { version: 1, value: { conformers: ['one', 'two'], shown: 0 } };
  const carried = await answerGet(
    { type: 'get', id: 'g7', keys: ['figure'] },
    TOOL,
    outputsDrawing(FIGURE),
    { address: 'https://3d.cheminfo.org/?smiles=CCO', state: () => state },
  );
  const failing = await answerGet(
    { type: 'get', id: 'g8', keys: ['figure'] },
    TOOL,
    outputsDrawing(FIGURE),
    {
      address: 'https://3d.cheminfo.org/?smiles=CCO',
      state: () => Promise.reject(new Error('Nothing computed yet.')),
    },
  );

  await expect(
    readFigureState(svgOf(itemsOf(carried)[0]), '3d'),
  ).resolves.toStrictEqual({
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO',
    ...state,
    edited: false,
  });

  const svg = svgOf(itemsOf(failing)[0]);

  expect(readFigureSource(svg)).toStrictEqual({
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO',
  });
  await expect(readFigureState(svg, '3d')).resolves.toBeUndefined();
});

function itemsOf(result: ResultMessage): HostItem[] {
  if (!result.ok || !('items' in result)) {
    throw new Error('The get was not answered with values.');
  }
  return result.items;
}

function stopListening(): void {
  // Nothing listens: the outputs never change.
}

function svgOf(item: HostItem | undefined): string {
  const value = item?.value as { svg?: unknown } | undefined;
  return String(value?.svg);
}
