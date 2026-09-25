import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-BFq2-A0J.js";import{a as r,c as i,h as a,i as o,l as s,n as c,o as l,p as u,r as d,s as f,u as p}from"./figurePng-CfydJ6-n.js";import{i as m,r as h}from"./popoverNextMigrationUtils-DQD_iqZ8.js";import{t as g}from"./downloadBlob-BXFxYCsP.js";import{n as _,t as v}from"./sanitizeFileName-DTX4aT6A.js";import{n as y,t as b}from"./OverlayIconButton-BzWAeDkQ.js";async function x(e,t={}){let{format:n=`png`,scale:i=2}=t,{fileName:a=S,background:s}=t,l=r(e,{background:s}),u=_(a,S);if(n===`svg`){let e=new Blob([l.markup],{type:o});g(e,`${u}.svg`);return}g(await c(l,i),`${u}.png`)}var S;function C(){return(C=e((()=>{d(),a(),l(),v(),S=`figure`})))()}function w(e){let{targetId:t,fileName:n,background:r,scales:i=u}=e,{defaultFormat:a=`png`,defaultScale:o=2}=e,{label:c=`Save this figure`,title:l=`Save figure`}=e,{icon:d=`download`,testId:p}=e,[m,g]=(0,T.useState)(!1),[_,v]=(0,T.useState)(a),[y,S]=(0,T.useState)(o),[C,w]=(0,T.useState)(null),[D,O]=(0,T.useState)(null),[k,A]=(0,T.useState)(!1);function j(e){g(e),e&&(w(f(t)),O(null))}async function M(){A(!0);try{await x(t,{format:_,scale:y,fileName:n,background:r}),O(null)}catch(e){O(e instanceof Error?e.message:String(e))}finally{A(!1)}}return(0,E.jsx)(h,{isOpen:m,placement:`bottom-end`,onInteraction:j,content:(0,E.jsx)(s,{title:l,format:_,scale:y,scales:i,size:C,failure:D,saving:k,onFormatChange:v,onScaleChange:S,onSave:()=>void M()}),children:(0,E.jsx)(b,{icon:d,label:c,value:_.toUpperCase(),active:m,testId:p,opensMenu:!0})})}var T,E;function D(){return(D=e((()=>{m(),T=t(),y(),C(),a(),i(),p(),E=n(),w.__docgenInfo={description:`The glyph that takes the figure off the page as a file.

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
@default 'Save this figure'`},title:{required:!1,tsType:{name:`string`},description:`What the panel behind it is called.
@default 'Save figure'`},icon:{required:!1,tsType:{name:`IconName`},description:`Its glyph.
@default 'download'`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the glyph.\n@default undefined"}}}})))()}export{D as n,w as t};