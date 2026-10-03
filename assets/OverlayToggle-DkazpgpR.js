import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-DS2CryJ6.js";import{o as n,t as r}from"./components-BDQQoQtF.js";import{g as i,h as a,v as o,y as s}from"./OverlaySegmented-BkxALkd9.js";import{i as c,n as l}from"./overlaySurface-qyOApBt8.js";import{t as u}from"./clamp-M7_x50VL.js";import{a as d,t as f}from"./numbers-BxzU8aH2.js";import{n as p,t as m}from"./roundTo-BbWJSCmm.js";import{r as h,s as g}from"./OverlayIconButton-BQEJkSnh.js";function _(e){return{display:`inline-flex`,alignItems:`center`,gap:0,height:e.controlHeight,padding:2,borderRadius:e.controlRadius,background:`var(--surface-sunken)`}}function v(e,t){let n=e.controlHeight-4;return{display:`inline-flex`,alignItems:`center`,justifyContent:`center`,width:n,height:n,padding:0,border:`none`,borderRadius:Math.max(3,e.controlRadius-2),background:`transparent`,color:t?`var(--text-faint)`:`var(--text-muted)`,font:`inherit`,fontSize:e.fontSize+1,lineHeight:1,cursor:t?`default`:`pointer`,opacity:t?.45:1}}function y(e,t){return{minWidth:Math.max(e.fontSize,Math.ceil(t*e.fontSize*b)),padding:`0 3px`,color:`var(--text)`,fontSize:e.fontSize,fontVariantNumeric:`tabular-nums`,textAlign:`center`,userSelect:`none`}}var b;function x(){return(x=e((()=>{b=.6})))()}function S(e){let{value:t,min:n,max:r,onChange:i,label:o,help:s,hideLabel:l=!1,disabled:u=!1,testId:d,step:p=1,digits:m=0,unit:h=``}=e,{metrics:g}=c();function b(e){let a=w(t+e*p,n,r);a!==t&&i(a)}function x(e){let t=D.get(e.key);t===void 0||u||(e.preventDefault(),b(t))}return(0,T.jsx)(a,{label:o,help:s,hideLabel:l,disabled:u,children:(0,T.jsxs)(`span`,{style:_(g),"data-testid":d,children:[(0,T.jsx)(`button`,{type:`button`,style:v(g,u||t<=n),disabled:u||t<=n,"aria-label":`Decrease ${o}`,onClick:()=>b(-1),onKeyDown:x,children:`−`}),(0,T.jsx)(`span`,{style:y(g,C(e)),"aria-live":`polite`,children:`${f(t,m)}${h}`}),(0,T.jsx)(`button`,{type:`button`,style:v(g,u||t>=r),disabled:u||t>=r,"aria-label":`Increase ${o}`,onClick:()=>b(1),onKeyDown:x,children:`+`})]})})}function C(e){let{min:t,max:n,digits:r=0,unit:i=``}=e;return Math.max(f(t,r).length,f(n,r).length)+i.length}function w(e,t,n){return u(p(e,E),t,n)}var T,E,D;function O(){return(O=e((()=>{d(),m(),i(),x(),l(),T=t(),E=10,D=new Map([[`ArrowUp`,1],[`ArrowRight`,1],[`ArrowDown`,-1],[`ArrowLeft`,-1]]),S.__docgenInfo={description:`A value the reader nudges up and down.

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
@default 0`},unit:{required:!1,tsType:{name:`string`},description:"Written after the value, e.g. `px`.\n@default '' — no unit is written"}}}})))()}function k(e){let t=Math.round(e.controlHeight*.75/2)*2,n=Math.round(t*5/3),r=t-4;return{width:n,height:t,knob:r,inset:2,travel:n-r-4}}function A(e,t,n){return{display:`inline-flex`,alignItems:`center`,minWidth:t.width,height:e.controlHeight,padding:0,border:`none`,background:`transparent`,cursor:n?`default`:`pointer`,opacity:n?.6:1}}function j(e,t){return{position:`relative`,display:`inline-block`,width:e.width,height:e.height,borderRadius:999,background:t?`var(--accent)`:`var(--border-strong)`,transition:`background ${N}ms ease`}}function M(e,t){return{position:`absolute`,top:e.inset,left:t?e.inset+e.travel:e.inset,width:e.knob,height:e.knob,borderRadius:`50%`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,transition:`left ${N}ms ease`}}var N;function P(){return(P=e((()=>{N=150})))()}function F(e){let{checked:t,onChange:r,label:i,help:o,hideLabel:l=!1,disabled:u=!1,testId:d,swatch:f,icon:p}=e,{metrics:m}=c(),h=s();if((e.appearance??(h===void 0?`button`:`switch`))===`switch`){let e=k(m);return(0,I.jsx)(a,{label:i,help:o,hideLabel:l,disabled:u,children:(0,I.jsx)(`button`,{type:`button`,"aria-pressed":t,"aria-label":i,disabled:u,"data-testid":d,style:A(m,e,u),onClick:()=>r(!t),children:(0,I.jsx)(`span`,{style:j(e,t),children:(0,I.jsx)(`span`,{style:M(e,t)})})})})}return(0,I.jsx)(a,{label:i,help:o,hideLabel:!0,disabled:u,children:(0,I.jsx)(n,{variant:`minimal`,size:m.blueprintSize,active:t,disabled:u,"aria-pressed":t,"aria-label":i,title:l?i:void 0,icon:f===void 0?p:(0,I.jsx)(`span`,{style:g(f)}),text:l?void 0:i,"data-testid":d,onClick:()=>r(!t)})})}var I;function L(){return(L=e((()=>{r(),i(),h(),o(),l(),P(),I=t(),F.__docgenInfo={description:`One thing on the figure turned on and off.

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
@default undefined`}}}})))()}export{O as i,L as n,S as r,F as t};