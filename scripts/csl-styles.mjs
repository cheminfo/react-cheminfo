#!/usr/bin/env node
/*
 * Write the CSL styles the journals of the family format their references in,
 * and the English terms they use, as modules of src/csl/core/styles, from
 * checkouts of the Citation Style Language's styles and locales repositories.
 * A dependent style brings the style it depends on. Each module keeps the file
 * exactly as published, its authors and its licence included.
 *
 * Usage: node scripts/csl-styles.mjs <styles checkout> <locales checkout>
 */
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { argv, exit, stderr, stdout } from 'node:process';

/** The styles the journals of the family ask for, by their CSL id. */
const STYLE_IDS = [
  'american-chemical-society',
  'royal-society-of-chemistry',
  'nature',
  'synthesis',
  'beilstein-journal-of-organic-chemistry',
  'tetrahedron',
  'angewandte-chemie',
  'helvetica-chimica-acta',
  'american-physics-society',
  'american-institute-of-physics',
  'institute-of-physics-numeric',
  'ieee',
  'springer-physics-brackets',
  'elsevier-with-titles',
  'american-mathematical-society-numeric',
  'springer-mathphys-brackets',
];

const [stylesDirectory, localesDirectory] = argv.slice(2);
if (stylesDirectory === undefined || localesDirectory === undefined) {
  stderr.write(
    'Usage: node scripts/csl-styles.mjs <styles checkout> <locales checkout>\n',
  );
  exit(1);
}

const target = join(import.meta.dirname, '..', 'src', 'csl', 'core', 'styles');
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

const stylesCommit = commitOf(stylesDirectory);
const styles = new Map();
const queue = [...STYLE_IDS];
while (queue.length > 0) {
  const id = queue.shift();
  if (styles.has(id)) continue;
  const independent = join(stylesDirectory, `${id}.csl`);
  const path = existsSync(independent)
    ? independent
    : join(stylesDirectory, 'dependent', `${id}.csl`);
  const xml = readFileSync(path, 'utf8');
  const parent = parentOf(xml);
  if (parent !== undefined) queue.push(parent);
  styles.set(id, xml);
}

const loaders = [];
for (const [id, xml] of [...styles].toSorted(([a], [b]) =>
  a.localeCompare(b),
)) {
  const name = moduleName(id);
  writeModule(
    `${name}.ts`,
    `The CSL style \`${id}\`, as the Citation Style Language project publishes it\n * (styles repository, commit ${stylesCommit.slice(0, 12)}). Its \`<rights>\`\n * element states its licence.`,
    'STYLE',
    xml,
  );
  loaders.push(
    `  '${id}': () => import('./${name}.ts').then((module) => module.STYLE),`,
  );
}

const localesCommit = commitOf(localesDirectory);
writeModule(
  'localeEnUs.ts',
  `The English terms of the CSL styles, as the Citation Style Language project\n * publishes them (locales repository, commit ${localesCommit.slice(0, 12)}).\n * Its \`<rights>\` element states its licence.`,
  'LOCALE',
  readFileSync(join(localesDirectory, 'locales-en-US.xml'), 'utf8'),
);

writeFileSync(
  join(target, 'styleLoaders.ts'),
  `/**
 * Each style there is, loaded only when asked for.
 * Written by scripts/csl-styles.mjs: change the script, not this file.
 */
export const STYLE_LOADERS: Readonly<Record<string, () => Promise<string>>> = {
${loaders.join('\n')}
};
`,
);

// Set as the repository sets every file, so writing them again diffs only
// what the CSL project changed.
execFileSync('npx', ['prettier', '--write', target], { stdio: 'ignore' });
stdout.write(`${styles.size} styles and one locale written\n`);

function writeModule(file, about, name, xml) {
  if (xml.includes('`') || xml.includes('${')) {
    throw new Error(`${file}: the XML cannot be held in a template literal`);
  }
  writeFileSync(
    join(target, file),
    `/**
 * ${about}
 * Written by scripts/csl-styles.mjs: change the script, not this file.
 */
export const ${name} = String.raw\`${xml.trimEnd()}
\`;
`,
  );
}

function parentOf(xml) {
  const link = /<link\s[^>]*rel="independent-parent"[^>]*>/.exec(xml)?.[0];
  return link === undefined
    ? undefined
    : /\/styles\/(?<parent>[^"/]+)"/.exec(link)?.groups?.parent;
}

function moduleName(id) {
  return id.replaceAll(/-(?<letter>[a-z0-9])/g, (_match, letter) =>
    letter.toUpperCase(),
  );
}

function commitOf(directory) {
  return execFileSync('git', ['-C', directory, 'rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
}
