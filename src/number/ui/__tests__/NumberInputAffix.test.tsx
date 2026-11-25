// A box that draws a unit or an extension beside its value takes the shared
// affix rule (`.input-affix`, styles/chrome.css), so every unit box of the
// family sits on the field's line in the field's type.
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { MarkOpacityInput } from '../../../drawing/ui/MarkStyleInputs.tsx';
import { NumberInput } from '../NumberInput.tsx';

test('a box with a unit takes the affix rule, beside the class its caller gave it; a bare box takes none', () => {
  const groups = [
    <NumberInput
      key="unit"
      value={2}
      rightElement={<span>px</span>}
      onChange={noop}
    />,
    <NumberInput
      key="prefix"
      value={2}
      buttons={false}
      className="sweep"
      leftElement={<span>10⁻</span>}
      onChange={noop}
    />,
    <NumberInput key="bare" value={2} onChange={noop} />,
    <MarkOpacityInput
      key="opacity"
      value={0.25}
      size="small"
      onChange={noop}
    />,
  ].map((element) => {
    const markup = renderToStaticMarkup(element);
    return /<div class="(?<classes>bp6-input-group[^"]*)"/u.exec(markup)?.groups
      ?.classes;
  });

  expect(groups).toStrictEqual([
    'bp6-input-group input-affix',
    'bp6-input-group input-affix sweep',
    'bp6-input-group',
    'bp6-input-group bp6-small input-affix',
  ]);
});

function noop(): void {
  // The classes are all this test reads.
}
