import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, expect, test } from 'vitest';

import { ShortcutKeys } from '../../../guide/ui/ShortcutList.tsx';
import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import { SiteLanguage } from '../../../language/ui/SiteLanguage.tsx';
import { HelpBody } from '../HelpBody.tsx';
import { HELP_CARD_TOOLTIP_PROPS } from '../helpCardTooltipProps.ts';

beforeAll(async () => {
  await CHROME_CATALOG.load('fr');
});

test('the keys of a piece of help are drawn as the shortcut list draws them, beside its title', () => {
  const html = renderToStaticMarkup(
    <HelpBody content={{ title: 'Save', shortcuts: ['Ctrl', 'S'] }} />,
  );
  const keys = renderToStaticMarkup(<ShortcutKeys keys={['Ctrl', 'S']} />);

  expect(keys).toBe(
    '<span class="shortcut-keys"><kbd>Ctrl</kbd><kbd>S</kbd></span>',
  );
  expect(html).toBe(
    `<div class="help-body" style="display:flex;flex-direction:column;gap:6px;max-width:280px"><div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px"><div style="font-weight:600">Save</div>${keys}</div></div>`,
  );
});

test("a French page's help link reads the catalog's words", () => {
  const html = renderToStaticMarkup(
    <SiteLanguage value="fr">
      <HelpBody content={{ title: 'Zoom', link: 'https://example.org' }} />
    </SiteLanguage>,
  );

  expect(html).toContain('>En savoir plus</a>');
  expect(html).not.toContain('Learn more');
});

test("a toolbar item's tooltip opens as the help card, after the family's help delay, not compact, no intent", () => {
  expect(HELP_CARD_TOOLTIP_PROPS).toStrictEqual({
    popoverClassName: 'help-tooltip',
    hoverOpenDelay: 250,
    compact: false,
    intent: 'none',
  });
});
