import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';

import { SiteMark } from '../../../ecosystem/ui/marks.tsx';
import { faviconMarkup } from '../faviconMarkup.ts';
import { writeOgCard } from '../writeOgCard.ts';

const shots = vi.hoisted(() => [] as Array<{ html: string; width: number }>);

vi.mock('@playwright/test', () => ({
  chromium: {
    launch: async () => ({
      newPage: async (options: { viewport: { width: number } }) => {
        let html = '';
        return {
          setContent: async (content: string) => {
            html = content;
          },
          screenshot: async () => {
            shots.push({ html, width: options.viewport.width });
            return Buffer.from('png');
          },
        };
      },
      close: async () => undefined,
    }),
  },
}));

test('the favicon is the site mark in literal colours, standalone', async () => {
  const mark = renderToStaticMarkup(
    <SiteMark siteId="atoms" size={32} colors="literal" />,
  );

  await expect(faviconMarkup('atoms')).resolves.toBe(
    `${mark.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')}\n`,
  );
});

test('the card is drawn at the card’s size and written where asked', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'og-'));
  const target = await writeOgCard({
    site: 'atoms',
    description: 'Count the atoms.',
    out: join(folder, 'deep/og.png'),
  });

  expect(target).toBe(join(folder, 'deep/og.png'));
  expect(readFileSync(target, 'utf8')).toBe('png');
  expect(shots).toHaveLength(1);
  expect(shots[0]?.width).toBe(1200);
  expect(shots[0]?.html).toContain('Count the atoms.');
});
