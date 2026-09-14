import { expect, test } from 'vitest';

import { frameTitle, isFamilyFrameSource } from '../familyFrame.ts';

test('a page of a family site may be framed, with or without www', () => {
  expect(
    isFamilyFrameSource('https://www.chemcalc.org/?embed=1&mf=C6H12O6'),
  ).toBe(true);
  expect(isFamilyFrameSource('https://chemcalc.org/')).toBe(true);
  expect(isFamilyFrameSource('https://www.nmrium.org/')).toBe(true);
});

test('any https host under cheminfo.org may be framed', () => {
  expect(isFamilyFrameSource('https://aga2s.cheminfo.org/?embed')).toBe(true);
  expect(isFamilyFrameSource('https://cheminfo.org/')).toBe(true);
});

test('a path of the site playing the deck may be framed', () => {
  expect(isFamilyFrameSource('/mf-finder?embed=1')).toBe(true);
});

test('a host that only looks like ours is refused', () => {
  expect(isFamilyFrameSource('https://cheminfo.org.example.com/')).toBe(false);
  expect(isFamilyFrameSource('https://evilcheminfo.org/')).toBe(false);
  expect(isFamilyFrameSource('https://www.chemcalc.org@example.com/')).toBe(
    false,
  );
  expect(isFamilyFrameSource('https://example.com/')).toBe(false);
});

test('protocol-relative, plain http and data addresses are refused', () => {
  expect(isFamilyFrameSource('//example.com/')).toBe(false);
  expect(isFamilyFrameSource(String.raw`/\example.com/`)).toBe(false);
  expect(isFamilyFrameSource('HTTP://smiles.cheminfo.org/')).toBe(false);
  expect(isFamilyFrameSource('data:text/html,<script>alert(1)</script>')).toBe(
    false,
  );
  expect(isFamilyFrameSource('not an address')).toBe(false);
});

test('a frame is named after the host it shows', () => {
  expect(frameTitle('https://smiles.cheminfo.org/?embed=1')).toBe(
    'smiles.cheminfo.org, embedded',
  );
  expect(frameTitle('/mf-finder?embed=1')).toBe('Embedded tool');
});
