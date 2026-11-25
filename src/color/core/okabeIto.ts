/**
 * The eight colours of Okabe and Ito (2008), which stay apart for every
 * common colour vision and in a greyscale print: the family's categorical
 * palette — a drawing's inks, a site's categories, a mask over an image.
 * Black first, the ink of every structure; written `#rrggbb`.
 */
export const OKABE_ITO = [
  // tokens-ok: the colours of a figure, not of the site.
  { name: 'Black', value: '#000000' },
  { name: 'Orange', value: '#e69f00' },
  { name: 'Sky blue', value: '#56b4e9' },
  { name: 'Bluish green', value: '#009e73' },
  { name: 'Yellow', value: '#f0e442' },
  { name: 'Blue', value: '#0072b2' },
  { name: 'Vermilion', value: '#d55e00' },
  { name: 'Reddish purple', value: '#cc79a7' },
] as const;
