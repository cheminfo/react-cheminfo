/**
 * A figure written as a PDF that opens again where it was made, and read back.
 *
 * An entry point of its own, and not part of `react-cheminfo/drawing`, because
 * jsPDF, svg2pdf.js and pdf-lib are optional peers a site installs only when
 * it writes PDFs, and the Arimo faces the PDF is set in weigh 1.9 MB: an editor
 * that saves no PDF must never be made to carry them.
 */

export * from './pdf/core/index.ts';
