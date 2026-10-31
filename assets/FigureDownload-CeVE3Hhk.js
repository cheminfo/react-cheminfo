import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-CYX11tGR.js";import{n,t as r}from"./useT-nRaa1d-E.js";import{i,r as a}from"./popoverNextMigrationUtils-Cid-ghM1.js";import{n as o,t as s}from"./OverlayIconButton-RKbPvt34.js";import{n as c,t as l}from"./useFigureDownload-CoPY8hF8.js";function u(e){let{label:t,icon:r=`download`,testId:i,...o}=e,l=n(),{isOpen:u,setOpen:f,panel:p,format:m,portal:h}=c(o);return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(a,{isOpen:u,placement:`bottom-end`,onInteraction:f,content:p,children:(0,d.jsx)(s,{icon:r,label:t??l(`download.saveThisFigure`),value:m.toUpperCase(),active:u,testId:i,opensMenu:!0})}),h]})}var d;function f(){return(f=e((()=>{i(),r(),o(),l(),d=t(),u.__docgenInfo={description:`The glyph that takes the figure off the page, as a file or onto the
clipboard.

It works from the \`id\` of the box the figure is mounted in rather than from
the figure itself, so the control is free to sit in the bar above the
picture — or anywhere else on the page — without the component that drew the
figure having to hand anything over. That is also what lets one control save
a view that is really several charts: whatever is inside the box is what is
saved.

Both formats are offered because they answer different questions. An SVG is
the figure itself, sharp at any size and still editable, which is what a
paper wants; a PNG is a picture of it, which is what every chat window and
slide deck accepts. The resolution paints a PNG with more pixels and makes
an SVG open larger, and the panel writes out the size it is about to
produce so nobody has to guess what \`3×\` means for the figure in front of
them.
@param props - See {@link FigureDownloadProps}.
@returns The glyph and its panel.`,methods:[],displayName:`FigureDownload`,props:{targetId:{required:!1,tsType:{name:`string`},description:`The \`id\` of the box the figure is mounted in. Everything drawn inside it
is saved — sixteen charts of a pair grid as readily as one scatter plot —
and the controls floating over it are left behind. Give this or
\`writeFigure\`.
@default undefined`},writeFigure:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => Promise<FigureSvg>`,signature:{arguments:[],return:{name:`Promise`,elements:[{name:`FigureSvg`}],raw:`Promise<FigureSvg>`}}},description:`Writes the figure as an SVG document, in place of reading it off the
page: for a drawing whose file carries more than its picture, such as the
chemistry behind a structure. It is called when the panel opens, to
measure the figure, and again for every save and copy. The SVG is saved as
written, at the size it states; the resolution paints the PNG alone.
@default undefined`},fileName:{required:!1,tsType:{name:`string`},description:`What the saved file is called, without its extension. Name it after the
data rather than after the tool: a reader with four of these in a
downloads folder cannot tell four \`figure.png\` apart.
@default 'figure'`},defaultFormat:{required:!1,tsType:{name:`union`,raw:`'svg' | 'png'`,elements:[{name:`literal`,value:`'svg'`},{name:`literal`,value:`'png'`}]},description:`The format it opens on.
@default 'png'`},unit:{required:!1,tsType:{name:`union`,raw:`'multiple' | 'dpi'`,elements:[{name:`literal`,value:`'multiple'`},{name:`literal`,value:`'dpi'`}]},description:`How the resolution is offered: as multiples of the figure on screen, or —
for a figure drawn to the size it prints at — in dots per inch. In dots
per inch an SVG keeps the size it states, and 1× is 96 dpi.
@default 'multiple'`},defaultScale:{required:!1,tsType:{name:`number`},description:`The resolution a PNG opens on, as a multiple of the figure on screen:
\`dpiScale(600)\` opens on 600 dpi. An SVG opens at 1×, the size it has on
screen, and each format keeps the multiple the reader last picked for it.
@default 2, or 300 dpi`},scales:{required:!1,tsType:{name:`unknown`},description:`The resolutions offered, as multiples of the figure on screen.
@default [1, 2, 3, 4], or 150, 300, 600 and 1200 dpi`},onScaleChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(scale: number) => void`,signature:{arguments:[{type:{name:`number`},name:`scale`}],return:{name:`void`}}},description:`Called with the multiple a PNG is set to, for a page that keeps the
reader's choice — to paint its own PNGs at it, or to open on it next time.
@default undefined`},background:{required:!1,tsType:{name:`string`},description:`What is painted under the figure. \`transparent\` leaves it unpainted, for a
figure going onto a coloured slide. A written figure paints its own.
@default the surface the figure is drawn on`},title:{required:!1,tsType:{name:`string`},description:`What the panel is called.
@default the chrome's own line, in the language of the page`},renderFigure:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(size: FigurePixels) => ReactNode`,signature:{arguments:[{type:{name:`FigurePixels`},name:`size`}],return:{name:`ReactNode`}}},description:`Draws the figure at a size, for a file. When it is given the panel offers
a size — as shown, 4:3, 16:9, a journal column, or typed — and a figure
saved at a size other than its own is drawn again at that size, off the
page, so its axes and labels are laid out for the new shape rather than
stretched into it. Draw exactly what is on screen, with the same data,
zoom and colours; only the box changes. A written figure has the size it
states, and is offered none.
@default undefined — the figure is saved at the size it has on screen`},label:{required:!1,tsType:{name:`string`},description:`What the glyph is called, for the pointer and for a screen reader.
@default the chrome's own line, in the language of the page`},icon:{required:!1,tsType:{name:`IconName`},description:`Its glyph.
@default 'download'`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the glyph.\n@default undefined"}}}})))()}export{f as n,u as t};