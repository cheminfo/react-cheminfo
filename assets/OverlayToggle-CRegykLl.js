import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-Ds1Hj5zQ.js";import{t as n}from"./clamp-M7_x50VL.js";import{a as r,t as i}from"./numbers-DVZ0hjea.js";import{n as a,t as o}from"./roundTo-BbWJSCmm.js";import{n as s,t as c}from"./useT-C0futuDT.js";import{t as l,w as u}from"./components-CEyUWsEs.js";import{a as d,c as f,l as p,o as m}from"./OverlaySegmented-BL3-qCHi.js";import{i as h,n as g}from"./overlaySurface-C4bzX0GG.js";import{o as _,t as v}from"./overlayControlStyles-B03R06xm.js";function y(e){return{display:`inline-flex`,alignItems:`center`,gap:0,height:e.controlHeight,padding:2,borderRadius:e.controlRadius,background:`var(--surface-sunken)`}}function b(e,t){let n=e.controlHeight-4;return{display:`inline-flex`,alignItems:`center`,justifyContent:`center`,width:n,height:n,padding:0,border:`none`,borderRadius:Math.max(3,e.controlRadius-2),background:`transparent`,color:t?`var(--text-faint)`:`var(--text-muted)`,font:`inherit`,fontSize:e.fontSize+1,lineHeight:1,cursor:t?`default`:`pointer`,opacity:t?.45:1}}function x(e,t){return{minWidth:Math.max(e.fontSize,Math.ceil(t*e.fontSize*S)),padding:`0 3px`,color:`var(--text)`,fontSize:e.fontSize,fontVariantNumeric:`tabular-nums`,textAlign:`center`,userSelect:`none`}}var S;function C(){return(C=e((()=>{S=.6})))()}function w(e){let{value:t,min:n,max:r,onChange:a,label:o,help:c,hideLabel:l=!1,disabled:u=!1,testId:f,step:p=1,digits:m=0,unit:g=``}=e,_=s(),{metrics:v}=h();function S(e){let i=E(t+e*p,n,r);i!==t&&a(i)}function C(e){let t=k.get(e.key);t===void 0||u||(e.preventDefault(),S(t))}return(0,D.jsx)(d,{label:o,help:c,hideLabel:l,disabled:u,children:(0,D.jsxs)(`span`,{style:y(v),"data-testid":f,children:[(0,D.jsx)(`button`,{type:`button`,style:b(v,u||t<=n),disabled:u||t<=n,"aria-label":_(`overlay.decrease`,{label:o}),onClick:()=>S(-1),onKeyDown:C,children:`−`}),(0,D.jsx)(`span`,{style:x(v,T(e)),"aria-live":`polite`,children:`${i(t,m)}${g}`}),(0,D.jsx)(`button`,{type:`button`,style:b(v,u||t>=r),disabled:u||t>=r,"aria-label":_(`overlay.increase`,{label:o}),onClick:()=>S(1),onKeyDown:C,children:`+`})]})})}function T(e){let{min:t,max:n,digits:r=0,unit:a=``}=e;return Math.max(i(t,r).length,i(n,r).length)+a.length}function E(e,t,r){return n(a(e,O),t,r)}var D,O,k;function A(){return(A=e((()=>{r(),o(),c(),m(),C(),g(),D=t(),O=10,k=new Map([[`ArrowUp`,1],[`ArrowRight`,1],[`ArrowDown`,-1],[`ArrowLeft`,-1]]),w.__docgenInfo={description:`A value the reader nudges up and down.

It is two buttons around a number rather than a field, because over a figure
the reader is not typing a value, they are hunting for the one that makes
the picture read — and on a phone a text field raises a keyboard that covers
the very picture the value is being chosen against. The end of the range is
shown by the button going dead rather than by a value that refuses to move,
so the reader can see where the limit is before pressing into it.
@param props - See {@link OverlayNumberProps}.
@returns The stepper.`,methods:[],displayName:`OverlayNumber`,props:{label:{required:!0,tsType:{name:`string`},description:`The words in front of the control, phrased as the question the reader
already has: \`Colour by\`, \`Group outlines\`, \`Dot size\`.

Required, and deliberately so. A row with no name is a row whose only
identification is the help glyph beside it, which is how a panel ends up
with a column of question marks standing in for its words — and it is the
name that a screen reader is given, that the help hangs off, and that
fills the panel's left column.`},help:{required:!1,tsType:{name:`HelpContent`},description:`What the control does, in a sentence. It hangs off the name, which is
underlined with dots to say so — never off a glyph of its own. A control
floating over a figure has no room to explain itself, and a reader who has
to guess what it does picks nothing at all, so every control should carry
one.
@default undefined — the name is written plainly`},hideLabel:{required:!1,tsType:{name:`boolean`},description:`Whether the name is written or only announced. Hide it for a control whose
own words already say what it is — a button that reads \`Zoom to selection\`
— and never for one whose choices are bare numbers. It is honoured on a
bar alone: in a panel the name is the left column, and an empty cell there
is the ragged panel the grid exists to prevent.
@default false`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether the control is greyed and unreachable.
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the control.\n@default undefined"},value:{required:!0,tsType:{name:`number`},description:`The current value.`},min:{required:!0,tsType:{name:`number`},description:`The smallest it may be.`},max:{required:!0,tsType:{name:`number`},description:`The largest it may be.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: number) => void`,signature:{arguments:[{type:{name:`number`},name:`value`}],return:{name:`void`}}},description:`Called with the new value, already held inside the range.`},step:{required:!1,tsType:{name:`number`},description:`How much one press, or one arrow key, moves it.
@default 1`},digits:{required:!1,tsType:{name:`number`},description:`Decimals the value is written with, so the control does not resize as the
reader steps through it.
@default 0`},unit:{required:!1,tsType:{name:`string`},description:"Written after the value, e.g. `px`.\n@default '' — no unit is written"}}}})))()}function j(e){let t=Math.round(e.controlHeight*.75/2)*2,n=Math.round(t*5/3),r=t-4;return{width:n,height:t,knob:r,inset:2,travel:n-r-4}}function M(e,t,n){return{display:`inline-flex`,alignItems:`center`,minWidth:t.width,height:e.controlHeight,padding:0,border:`none`,background:`transparent`,cursor:n?`default`:`pointer`,opacity:n?.6:1}}function N(e,t){return{position:`relative`,display:`inline-block`,width:e.width,height:e.height,borderRadius:999,background:t?`var(--accent)`:`var(--border-strong)`,transition:`background ${F}ms ease`}}function P(e,t){return{position:`absolute`,top:e.inset,left:t?e.inset+e.travel:e.inset,width:e.knob,height:e.knob,borderRadius:`50%`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,transition:`left ${F}ms ease`}}var F;function I(){return(I=e((()=>{F=150})))()}function L(e){let{checked:t,onChange:n,label:r,help:i,hideLabel:a=!1,disabled:o=!1,testId:s,swatch:c,icon:l}=e,{metrics:f}=h(),m=p();if((e.appearance??(m===void 0?`button`:`switch`))===`switch`){let e=j(f);return(0,R.jsx)(d,{label:r,help:i,hideLabel:a,disabled:o,children:(0,R.jsx)(`button`,{type:`button`,"aria-pressed":t,"aria-label":r,disabled:o,"data-testid":s,style:M(f,e,o),onClick:()=>n(!t),children:(0,R.jsx)(`span`,{style:N(e,t),children:(0,R.jsx)(`span`,{style:P(e,t)})})})})}return(0,R.jsx)(d,{label:r,help:i,hideLabel:!0,disabled:o,children:(0,R.jsx)(u,{variant:`minimal`,size:f.blueprintSize,active:t,disabled:o,"aria-pressed":t,"aria-label":r,title:a?r:void 0,icon:c===void 0?l:(0,R.jsx)(`span`,{style:_(c)}),text:a?void 0:r,"data-testid":s,onClick:()=>n(!t)})})}var R;function z(){return(z=e((()=>{l(),m(),v(),f(),g(),I(),R=t(),L.__docgenInfo={description:`One thing on the figure turned on and off.

On a bar it is a pressed button, because the same control has to work as a
legend entry — a swatch and a series name that dim when the series is hidden
— and a checkbox beside a colour square reads as two separate claims about
one series. In a panel it is a switch, because a row of grey chips is a row
whose state cannot be read: \`One scale for all\` drawn as a chip answers the
reader's only question about it — is it on? — with nothing at all, and the
reader has to click it to find out.

It stays a real \`button\` reporting \`aria-pressed\` in both appearances rather
than becoming a checkbox in one of them, since a control that reports its
state one way on a bar and another in a panel is a control a reader who
cannot see it has to learn twice. A native button is also operated by Space
and by Enter for nothing, where a checkbox built out of a \`div\` has to
reimplement both and usually gets one of them subtly wrong.

A swatch takes the glyph's place when both are given, since the colour is
what ties the entry to a mark on the chart.
@param props - See {@link OverlayToggleProps}.
@returns The toggle.`,methods:[],displayName:`OverlayToggle`,props:{label:{required:!0,tsType:{name:`string`},description:`The words in front of the control, phrased as the question the reader
already has: \`Colour by\`, \`Group outlines\`, \`Dot size\`.

Required, and deliberately so. A row with no name is a row whose only
identification is the help glyph beside it, which is how a panel ends up
with a column of question marks standing in for its words — and it is the
name that a screen reader is given, that the help hangs off, and that
fills the panel's left column.`},help:{required:!1,tsType:{name:`HelpContent`},description:`What the control does, in a sentence. It hangs off the name, which is
underlined with dots to say so — never off a glyph of its own. A control
floating over a figure has no room to explain itself, and a reader who has
to guess what it does picks nothing at all, so every control should carry
one.
@default undefined — the name is written plainly`},hideLabel:{required:!1,tsType:{name:`boolean`},description:`Whether the name is written or only announced. Hide it for a control whose
own words already say what it is — a button that reads \`Zoom to selection\`
— and never for one whose choices are bare numbers. It is honoured on a
bar alone: in a panel the name is the left column, and an empty cell there
is the ragged panel the grid exists to prevent.
@default false`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether the control is greyed and unreachable.
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the control.\n@default undefined"},checked:{required:!0,tsType:{name:`boolean`},description:`Whether it is on.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(checked: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`checked`}],return:{name:`void`}}},description:`Called with the new state.`},appearance:{required:!1,tsType:{name:`union`,raw:`'button' | 'switch'`,elements:[{name:`literal`,value:`'button'`},{name:`literal`,value:`'switch'`}]},description:"How it is drawn: a pressed button carrying its own words, or a switch\nbeside a name in a panel's control column.\n@default `'switch'` inside an {@link OverlayPanel}, `'button'` anywhere else"},swatch:{required:!1,tsType:{name:`string`},description:`Colour of the square in front of the caption. Give it the series' own
colour and a row of toggles becomes the figure's legend, each entry
showing and hiding what it names. Drawn by the button appearance alone.
@default undefined — no square is drawn`},icon:{required:!1,tsType:{name:`IconName`},description:`Blueprint glyph in front of the caption, for a toggle short of room. Drawn
by the button appearance alone.
@default undefined`}}}})))()}export{A as i,z as n,w as r,L as t};