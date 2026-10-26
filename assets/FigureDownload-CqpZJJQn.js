import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-HpGsPPW3.js";import{n,t as r}from"./useT-Dsi2PTha.js";import{i,r as a}from"./popoverNextMigrationUtils-DDeV0meY.js";import{n as o,t as s}from"./OverlayIconButton-B4qg2gm_.js";import{n as c,t as l}from"./useFigureDownload-CZuYAtY_.js";function u(e){let{label:t,icon:r=`download`,testId:i,...o}=e,l=n(),{isOpen:u,setOpen:f,panel:p,format:m,portal:h}=c(o);return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(a,{isOpen:u,placement:`bottom-end`,onInteraction:f,content:p,children:(0,d.jsx)(s,{icon:r,label:t??l(`download.saveThisFigure`),value:m.toUpperCase(),active:u,testId:i,opensMenu:!0})}),h]})}var d;function f(){return(f=e((()=>{i(),r(),o(),l(),d=t(),u.__docgenInfo={description:`The glyph that takes the figure off the page, as a file or onto the
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
@returns The glyph and its panel.`,methods:[],displayName:`FigureDownload`,props:{targetId:{required:!0,tsType:{name:`string`},description:`The \`id\` of the box the figure is mounted in. Everything drawn inside it
is saved — sixteen charts of a pair grid as readily as one scatter plot —
and the controls floating over it are left behind.`},fileName:{required:!1,tsType:{name:`string`},description:`What the saved file is called, without its extension. Name it after the
data rather than after the tool: a reader with four of these in a
downloads folder cannot tell four \`figure.png\` apart.
@default 'figure'`},defaultFormat:{required:!1,tsType:{name:`union`,raw:`'svg' | 'png'`,elements:[{name:`literal`,value:`'svg'`},{name:`literal`,value:`'png'`}]},description:`The format it opens on.
@default 'png'`},defaultScale:{required:!1,tsType:{name:`number`},description:`The resolution a PNG opens on, as a multiple of the figure on screen. An
SVG opens at 1×, the size it has on screen, and each format keeps the
multiple the reader last picked for it.
@default 2`},scales:{required:!1,tsType:{name:`unknown`},description:`The resolutions offered.
@default [1, 2, 3, 4]`},background:{required:!1,tsType:{name:`string`},description:`What is painted under the figure. \`transparent\` leaves it unpainted, for a
figure going onto a coloured slide.
@default the surface the figure is drawn on`},title:{required:!1,tsType:{name:`string`},description:`What the panel is called.
@default the chrome's own line, in the language of the page`},renderFigure:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(size: FigurePixels) => ReactNode`,signature:{arguments:[{type:{name:`FigurePixels`},name:`size`}],return:{name:`ReactNode`}}},description:`Draws the figure at a size, for a file. When it is given the panel offers
a size — as shown, 4:3, 16:9, a journal column, or typed — and a figure
saved at a size other than its own is drawn again at that size, off the
page, so its axes and labels are laid out for the new shape rather than
stretched into it. Draw exactly what is on screen, with the same data,
zoom and colours; only the box changes.
@default undefined — the figure is saved at the size it has on screen`},label:{required:!1,tsType:{name:`string`},description:`What the glyph is called, for the pointer and for a screen reader.
@default the chrome's own line, in the language of the page`},icon:{required:!1,tsType:{name:`IconName`},description:`Its glyph.
@default 'download'`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the glyph.\n@default undefined"}}}})))()}export{f as n,u as t};