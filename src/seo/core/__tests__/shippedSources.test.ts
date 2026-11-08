import { expect, test } from 'vitest';

import { shippedSourceProblem } from '../shippedSources.ts';

const BUNDLE = 'const e=1;export{e as a};\n';

/** The first bytes of a transport stream's first packet, as UTF-8 decodes them. */
const STREAM = 'G@\u0000\u0010\u0000\u0000\uFFFD\r\u0000\u0001\uFFFD';

function unread(): string {
  throw new Error('read a file its name had already decided');
}

test('a source map beside a bundle is reported without being read', () => {
  expect(shippedSourceProblem('assets/index-B2kd9xQ1.js.map', unread)).toBe(
    'assets/index-B2kd9xQ1.js.map: a source map — it hands every reader the code the site was built from.',
  );
});

test('a minified bundle carrying no map is not reported', () => {
  expect(
    shippedSourceProblem('assets/index-B2kd9xQ1.js', () => BUNDLE),
  ).toBeUndefined();
});

test('a bundle carrying its map inline is reported', () => {
  const inline = `${BUNDLE}//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozfQ==\n`;

  expect(shippedSourceProblem('assets/index-B2kd9xQ1.js', () => inline)).toBe(
    'assets/index-B2kd9xQ1.js: an inline source map — it hands every reader the code the site was built from.',
  );
});

test('a stylesheet carrying its map inline is reported', () => {
  const inline =
    '.a{color:red}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozfQ== */\n';

  expect(shippedSourceProblem('assets/index-Cx81.css', () => inline)).toBe(
    'assets/index-Cx81.css: an inline source map — it hands every reader the code the site was built from.',
  );
});

test('a comment naming a map the build does not carry ships nothing', () => {
  const dangling = `${BUNDLE}//# sourceMappingURL=inchi-js.js.map\n`;

  expect(
    shippedSourceProblem('lib/inchi-js.js', () => dangling),
  ).toBeUndefined();
});

test('the words of an inline map inside code are not a map', () => {
  const code =
    'const t=e=>e+"\\n//# sourceMappingURL=data:application/json;base64,"+btoa(e);\n';

  expect(
    shippedSourceProblem('assets/compiler.js', () => code),
  ).toBeUndefined();
});

test('a TypeScript or JSX source is reported by its name alone', () => {
  expect([
    shippedSourceProblem('src/main.tsx', unread),
    shippedSourceProblem('src/App.jsx', unread),
    shippedSourceProblem('config/build.cts', unread),
  ]).toStrictEqual([
    'src/main.tsx: a source file — it hands every reader the code the site was built from.',
    'src/App.jsx: a source file — it hands every reader the code the site was built from.',
    'config/build.cts: a source file — it hands every reader the code the site was built from.',
  ]);
});

test('a TypeScript file or declaration that reads as code is reported', () => {
  const declaration =
    'export declare function inchiFromMolfile(molfile: string): string;\n';

  expect([
    shippedSourceProblem('lib/inchi-js.d.ts', () => declaration),
    shippedSourceProblem('src/worker.mts', () => 'export const a = 1;\n'),
  ]).toStrictEqual([
    'lib/inchi-js.d.ts: a source file — it hands every reader the code the site was built from.',
    'src/worker.mts: a source file — it hands every reader the code the site was built from.',
  ]);
});

test('a video stream sharing the extension of a source is not one', () => {
  expect([
    shippedSourceProblem('videos/segment-001.ts', () => STREAM),
    shippedSourceProblem('videos/00012.MTS', () => STREAM),
  ]).toStrictEqual([undefined, undefined]);
});

test('a file its name says nothing about is not read', () => {
  expect([
    shippedSourceProblem('index.html', unread),
    shippedSourceProblem('assets/xtb.wasm', unread),
    shippedSourceProblem('og.png', unread),
  ]).toStrictEqual([undefined, undefined, undefined]);
});
