/**
 * The box a drawing's caption is typed in: ProseMirror over the drawing's
 * rich text, with a toolbar for bold, italic, scripts, size, font, alignment
 * and the chemical rules.
 *
 * Its own door because ProseMirror is a sixth of what a drawing page would
 * otherwise start with, and most visits never type a caption: a site imports
 * it with `import()` once a caption may be typed. Its look is in
 * `react-cheminfo/styles/caption-editor.css`.
 */

export * from './drawing/captionEditor/index.ts';
