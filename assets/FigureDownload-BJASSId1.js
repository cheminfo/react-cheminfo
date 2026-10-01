import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-Bz2znLZ-.js";import{t as r}from"./react-dom-C24rcgQI.js";import{_ as i,a,b as o,c as s,d as c,f as l,i as u,l as d,m as f,n as p,o as m,p as h,r as g,s as _,u as v,v as y}from"./figurePng-9-pK5cfO.js";import{n as b,t as x}from"./useT-BqlStPaM.js";import{i as S,r as C}from"./popoverNextMigrationUtils-wb09MT9X.js";import{t as w}from"./downloadBlob-BXFxYCsP.js";import{n as T,t as E}from"./sanitizeFileName-DTX4aT6A.js";import{n as D,t as O}from"./OverlayIconButton-C9P9GiCL.js";async function k(e,t={}){let{format:n=`png`,fileName:r=A,background:i}=t,o=t.scale??y(n),s=T(r,A);if(n===`svg`){let t=a(e,{background:i,scale:o}),n=new Blob([t.markup],{type:u});w(n,`${s}.svg`);return}let c=a(e,{background:i});w(await p(c,o),`${s}.png`)}var A;function j(){return(j=e((()=>{g(),o(),m(),E(),A=`figure`})))()}async function M(e,t={}){let n=0,r=new MutationObserver(()=>{n++});r.observe(e,{subtree:!0,childList:!0,attributes:!0,characterData:!0});try{await N(()=>{let t=s(e);return t===null?null:`${n}:${t.width}×${t.height}`},t)}finally{r.disconnect()}}async function N(e,t={}){let{signal:n,maxFrames:r=I}=t,{nextFrame:i=P}=t,a=null,o=0;for(let t=0;t<r;t++){if(await i(),n?.aborted)throw Error(`The figure was not saved.`);let t=e();if(o=t!==null&&t===a?o+1:0,o>=F)return;a=t}throw Error(`The figure did not finish drawing, so nothing was saved.`)}function P(){return new Promise(e=>{requestAnimationFrame(()=>e())})}var F,I;function L(){return(L=e((()=>{d(),F=2,I=600})))()}function R(e){let[t,n]=(0,B.useState)(null),r=(0,B.useRef)(null);(0,B.useEffect)(()=>()=>r.current?.abort(),[]);async function i(e,t,i){let a=z(_(e),t),o=new AbortController;r.current=o,n({box:a,size:t});try{await M(a,{signal:o.signal}),await i(a)}finally{r.current=null,n(null),a.remove()}}return{redraw:i,portal:t===null||e===void 0?null:(0,V.createPortal)(e(t.size),t.box)}}function z(e,t){let n=document.createElement(`div`);n.setAttribute(`aria-hidden`,`true`),n.inert=!0;let r=window.getComputedStyle(e);if(Object.assign(n.style,{position:`absolute`,top:`0`,left:`-100000px`,width:`${t.width}px`,height:`${t.height}px`,pointerEvents:`none`,fontFamily:r.fontFamily,fontSize:r.fontSize,lineHeight:r.lineHeight,color:r.color}),e instanceof HTMLElement)return e.after(n),n;let i=e;for(;i instanceof SVGElement;)i=i.parentElement;return(i??document.body).append(n),n}var B,V;function H(){return(H=e((()=>{B=t(),V=r(),L(),d()})))()}function U(e){let{targetId:t,fileName:n,background:r,scales:a=i}=e,{defaultFormat:o=`png`,defaultScale:c=2}=e,{label:u,title:d}=e,{icon:f=`download`,testId:p,renderFigure:m}=e,g=b(),[_,x]=(0,W.useState)(!1),[S,w]=(0,W.useState)(o),[T,E]=(0,W.useState)(()=>({png:c,svg:y(`svg`)})),D=T[S],[A,j]=(0,W.useState)(null),[M,N]=(0,W.useState)(null),[P,F]=(0,W.useState)(!1),[I,L]=(0,W.useState)(`screen`),[z,B]=(0,W.useState)(null),{redraw:V,portal:H}=R(m);function U(e){x(e),e&&(j(s(t)),N(null))}async function K(){F(!0);try{let e={format:S,scale:D,fileName:n,background:r};if(m!==void 0&&A!==null&&l(I,A,z??A)){let n=h(I,A,z??A);await V(t,n,t=>k(t,e))}else await k(t,e);N(null)}catch(e){N(e instanceof Error?e.message:String(e))}finally{F(!1)}}return(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(C,{isOpen:_,placement:`bottom-end`,onInteraction:U,content:(0,G.jsx)(v,{title:d??g(`download.saveFigure`),format:S,scale:D,scales:a,size:A,failure:M,saving:P,onFormatChange:w,onScaleChange:e=>E(t=>({...t,[S]:e})),onSave:()=>void K(),sizing:m===void 0?void 0:{layout:I,custom:z,onLayoutChange:L,onCustomChange:B}}),children:(0,G.jsx)(O,{icon:f,label:u??g(`download.saveThisFigure`),value:S.toUpperCase(),active:_,testId:p,opensMenu:!0})}),H]})}var W,G;function K(){return(K=e((()=>{S(),W=t(),x(),D(),j(),f(),o(),d(),c(),H(),G=n(),U.__docgenInfo={description:`The glyph that takes the figure off the page as a file.

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
@default the surface the figure is drawn on`},label:{required:!1,tsType:{name:`string`},description:`What the glyph is called, for the pointer and for a screen reader.
@default the chrome's own line, in the language of the page`},title:{required:!1,tsType:{name:`string`},description:`What the panel behind it is called.
@default the chrome's own line, in the language of the page`},icon:{required:!1,tsType:{name:`IconName`},description:`Its glyph.
@default 'download'`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the glyph.\n@default undefined"},renderFigure:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(size: FigurePixels) => ReactNode`,signature:{arguments:[{type:{name:`FigurePixels`},name:`size`}],return:{name:`ReactNode`}}},description:`Draws the figure at a size, for a file. When it is given the panel offers
a size — as shown, 4:3, 16:9, a journal column, or typed — and a figure
saved at a size other than its own is drawn again at that size, off the
page, so its axes and labels are laid out for the new shape rather than
stretched into it. Draw exactly what is on screen, with the same data,
zoom and colours; only the box changes.
@default undefined — the figure is saved at the size it has on screen`}}}})))()}export{K as n,U as t};