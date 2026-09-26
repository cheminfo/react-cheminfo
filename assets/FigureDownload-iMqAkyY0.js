import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-DzkT2GF_.js";import{a as r,c as i,h as a,i as o,l as s,n as c,o as l,p as u,r as d,s as f,u as p}from"./figurePng-4Ou95Tfu.js";import{n as m,t as h}from"./useT-SaARZZCl.js";import{i as g,r as _}from"./popoverNextMigrationUtils-COPa16Fm.js";import{t as v}from"./downloadBlob-BXFxYCsP.js";import{n as y,t as b}from"./sanitizeFileName-DTX4aT6A.js";import{n as x,t as S}from"./OverlayIconButton-D3DTzGoi.js";async function C(e,t={}){let{format:n=`png`,scale:i=2}=t,{fileName:a=w,background:s}=t,l=r(e,{background:s}),u=y(a,w);if(n===`svg`){let e=new Blob([l.markup],{type:o});v(e,`${u}.svg`);return}v(await c(l,i),`${u}.png`)}var w;function T(){return(T=e((()=>{d(),a(),l(),b(),w=`figure`})))()}function E(e){let{targetId:t,fileName:n,background:r,scales:i=u}=e,{defaultFormat:a=`png`,defaultScale:o=2}=e,{label:c,title:l}=e,{icon:d=`download`,testId:p}=e,h=m(),[g,v]=(0,D.useState)(!1),[y,b]=(0,D.useState)(a),[x,w]=(0,D.useState)(o),[T,E]=(0,D.useState)(null),[k,A]=(0,D.useState)(null),[j,M]=(0,D.useState)(!1);function N(e){v(e),e&&(E(f(t)),A(null))}async function P(){M(!0);try{await C(t,{format:y,scale:x,fileName:n,background:r}),A(null)}catch(e){A(e instanceof Error?e.message:String(e))}finally{M(!1)}}return(0,O.jsx)(_,{isOpen:g,placement:`bottom-end`,onInteraction:N,content:(0,O.jsx)(s,{title:l??h(`download.saveFigure`),format:y,scale:x,scales:i,size:T,failure:k,saving:j,onFormatChange:b,onScaleChange:w,onSave:()=>void P()}),children:(0,O.jsx)(S,{icon:d,label:c??h(`download.saveThisFigure`),value:y.toUpperCase(),active:g,testId:p,opensMenu:!0})})}var D,O;function k(){return(k=e((()=>{g(),D=t(),h(),x(),T(),a(),i(),p(),O=n(),E.__docgenInfo={description:`The glyph that takes the figure off the page as a file.

It works from the \`id\` of the box the figure is mounted in rather than from
the figure itself, so the control is free to sit in the bar above the
picture — or anywhere else on the page — without the component that drew the
figure having to hand anything over. That is also what lets one control save
a view that is really several charts: whatever is inside the box is what is
saved.

Both formats are offered because they answer different questions. An SVG is
the figure itself, sharp at any size and still editable, which is what a
paper wants; a PNG is a picture of it, which is what every chat window and
slide deck accepts. The resolution belongs to the second alone, and the
panel writes out the pixels it is about to produce so nobody has to guess
what \`3×\` means for the figure in front of them.
@param props - See {@link FigureDownloadProps}.
@returns The glyph and its panel.`,methods:[],displayName:`FigureDownload`,props:{targetId:{required:!0,tsType:{name:`string`},description:`The \`id\` of the box the figure is mounted in. Everything drawn inside it
is saved — sixteen charts of a pair grid as readily as one scatter plot —
and the controls floating over it are left behind.`},fileName:{required:!1,tsType:{name:`string`},description:`What the saved file is called, without its extension. Name it after the
data rather than after the tool: a reader with four of these in a
downloads folder cannot tell four \`figure.png\` apart.
@default 'figure'`},defaultFormat:{required:!1,tsType:{name:`union`,raw:`'svg' | 'png'`,elements:[{name:`literal`,value:`'svg'`},{name:`literal`,value:`'png'`}]},description:`The format it opens on.
@default 'png'`},defaultScale:{required:!1,tsType:{name:`number`},description:`The resolution it opens on, as a multiple of the figure on screen.
@default 2`},scales:{required:!1,tsType:{name:`unknown`},description:`The resolutions offered.
@default [1, 2, 3, 4]`},background:{required:!1,tsType:{name:`string`},description:`What is painted under the figure. \`transparent\` leaves it unpainted, for a
figure going onto a coloured slide.
@default the surface the figure is drawn on`},label:{required:!1,tsType:{name:`string`},description:`What the glyph is called, for the pointer and for a screen reader.
@default the chrome's own line, in the language of the page`},title:{required:!1,tsType:{name:`string`},description:`What the panel behind it is called.
@default the chrome's own line, in the language of the page`},icon:{required:!1,tsType:{name:`IconName`},description:`Its glyph.
@default 'download'`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the glyph.\n@default undefined"}}}})))()}export{k as n,E as t};