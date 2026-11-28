import { expect, test } from 'vitest';

import { fitSize, isForeignSvg, svgAsImage } from '../foreignSvg.ts';

/** The root NMRium writes when it exports a spectrum. */
const NMRIUM =
  '<svg class="nmr-svg"  viewBox="0 0 800 400" width="800"  height="400"  version="1.1" xmlns="http://www.w3.org/2000/svg"><style></style><path d="M0 0L10 10"/></svg>';

/** A site's own SVG, told by the generator it names. */
const OURS =
  '<svg xmlns="http://www.w3.org/2000/svg" width="10pt" height="10pt"><metadata><generator>draw.cheminfo.org</generator></metadata></svg>';

function isOwn(svg: string): boolean {
  return svg.includes('<generator>draw.cheminfo.org</generator>');
}

test('an SVG another program wrote is told from one of ours and from a structure', () => {
  expect(isForeignSvg(NMRIUM, isOwn)).toBe(true);
  expect(
    isForeignSvg(
      '\uFEFF<?xml version="1.0"?>\n<!-- Plotly -->\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "https://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg width="10" height="10"></svg>\n',
      isOwn,
    ),
  ).toBe(true);
  expect(isForeignSvg(OURS, isOwn)).toBe(false);
  expect(isForeignSvg('c1ccccc1', isOwn)).toBe(false);
  expect(isForeignSvg('<p>A spectrum: <svg></svg></p>', isOwn)).toBe(false);
  expect(isForeignSvg('<svg><g>cut short', isOwn)).toBe(false);
});

test('the own-SVG test reads the text without its byte order mark', () => {
  const seen: string[] = [];
  isForeignSvg(`\uFEFF${NMRIUM}`, (svg) => {
    seen.push(svg);
    return false;
  });

  expect(seen).toStrictEqual([NMRIUM]);
});

test('an SVG is given the namespaces it needs to draw as an image', () => {
  expect(
    svgAsImage(' <svg width="4"><use xlink:href="#a"/>&nbsp;</svg>\n'),
  ).toBe(
    '<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" width="4"><use xlink:href="#a"/>&#160;</svg>',
  );
  expect(svgAsImage(NMRIUM)).toBe(NMRIUM);
});

test('a picture larger than a page is brought down to a page, its proportions kept', () => {
  expect(fitSize({ width: 960, height: 300 }, 480)).toStrictEqual({
    width: 480,
    height: 150,
  });
  expect(fitSize({ width: 60, height: 300 }, 480)).toStrictEqual({
    width: 60,
    height: 300,
  });
});
