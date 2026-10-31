import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, expect, test } from 'vitest';

import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import { SiteLanguage } from '../../../language/ui/SiteLanguage.tsx';
import { SidePanelStack } from '../SidePanelStack.tsx';

const panels = [
  { id: 'spectra', title: 'Spectra', icon: 'chart' },
  { id: 'peaks', title: 'Peaks', icon: 'th' },
] as const;

beforeAll(async () => {
  await Promise.all([CHROME_CATALOG.load('fr'), CHROME_CATALOG.load('de')]);
});

function noop(): void {
  // The stack is rendered, never driven, in these tests.
}

function render(language: string): string {
  return renderToStaticMarkup(
    <SiteLanguage value={language}>
      <SidePanelStack
        panels={panels}
        openPanelIds={['spectra', 'peaks']}
        onClose={noop}
      >
        {(panel) => <p>{panel.id}</p>}
      </SidePanelStack>
    </SiteLanguage>,
  );
}

test('the header gestures are the chrome, so a French page reads them in French', () => {
  const html = render('fr');

  expect(html).toContain('aria-label="Fermer le panneau peaks"');
  expect(html).toContain('aria-label="Replier le panneau spectra"');
  expect(html).toContain('aria-label="Se concentrer sur le panneau peaks"');
});

test('a German header keeps the capital every noun carries', () => {
  const html = render('de');

  expect(html).toContain('aria-label="Panel „Peaks“ schließen"');
  expect(html).toContain('aria-label="Panel „Spectra“ einklappen"');
});
