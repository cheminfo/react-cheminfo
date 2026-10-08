import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-Bx_6GVVU.js";import{n,t as r}from"./icon-DV9ONlji.js";import{i,n as a}from"./overlaySurface-Dif2B1Pc.js";import{c as o,i as s,l as c,n as l,r as u,t as d,u as f}from"./useOverlayInteraction-CiAFMVmu.js";function p(e){let{colors:t}=e,{metrics:n}=i(),r=t.length>v?v-1:t.length,a=t.length-r,o=g(n),s=[];for(let e=0;e<r;e++){let n=t[e];n!==void 0&&s.push((0,_.jsx)(`span`,{style:m(n,o)},`${e}:${n}`))}return(0,_.jsxs)(`span`,{"aria-hidden":`true`,style:y,children:[s,a>0?(0,_.jsx)(`span`,{style:h(n),children:`+${a}`}):null]})}function m(e,t){return{display:`inline-block`,width:t,height:t,borderRadius:`50%`,background:e,boxShadow:t>=6?`inset 0 0 0 1px var(--border)`:void 0}}function h(e){return{fontSize:Math.max(9,e.labelSize-1),fontVariantNumeric:`tabular-nums`,fontWeight:600,lineHeight:1}}function g(e){return Math.max(4,Math.round(e.buttonSize/6))}var _,v,y;function b(){return(b=e((()=>{a(),_=t(),v=4,y={display:`inline-flex`,alignItems:`center`,gap:2},p.__docgenInfo={description:`The colours of a figure, as the glyph of the control that changes them.

Every other icon on a bar has to be learned before it means anything. This
one does not: a reader who has just looked at four groups of dots knows what
a row of those four colours opens, which is why the control that picks what
the figure is coloured by wears its palette rather than a paint-pot.

Past four colours it becomes three and a count. Eight dots inside a
twenty-four pixel button is a smear, and a smear says less about the figure
than three honest colours and the news that there are more.
@param props - See {@link OverlaySwatchIconProps}.
@returns The row of dots.`,methods:[],displayName:`OverlaySwatchIcon`,props:{colors:{required:!0,tsType:{name:`unknown`},description:`The colours the figure is drawn in, in the order it draws them. Hand it
the very colours on the chart: the whole point of this glyph is that a
reader recognises the plot in it without being taught anything.`}}}})))()}function x(e){let{label:t,value:n,keyWord:a=t,showKey:u=!0,swatches:d}=e,{active:m=!1,disabled:h=!1,disabledReason:g}=e,{opensMenu:_=!1,onClick:v,testId:y}=e,{metrics:b}=i(),{hovered:x,focused:w,handlers:T}=l(),E=`${t} — ${n}`;return(0,C.jsxs)(`button`,{type:`button`,title:h&&g!==void 0?g:E,"aria-label":E,"aria-haspopup":_?`menu`:void 0,"aria-expanded":_?m:void 0,disabled:h,"data-testid":y,style:o(b,{hovered:x,focused:w,active:m,disabled:h}),onClick:v,...T,children:[d===void 0||d.length===0?null:(0,C.jsx)(p,{colors:d}),u?(0,C.jsx)(`span`,{style:c(),children:a}):null,(0,C.jsx)(`span`,{style:f(),children:n}),(0,C.jsx)(`span`,{"aria-hidden":`true`,style:s(),children:(0,C.jsx)(r,{icon:`caret-down`,size:S(b.fontSize)})})]})}function S(e){return e+2}var C;function w(){return(w=e((()=>{n(),b(),a(),u(),d(),C=t(),x.__docgenInfo={description:`A setting written as its own value, with a caret saying it can be changed.

It does the job of a caption beside a segmented control or a native select
at the cost of no box at all. The reader scans the bar and reads
\`Species\` and \`95%\`, which is how the figure is drawn; the names of the two
settings are one press away and in every announcement.
@param props - See {@link OverlayValueButtonProps}.
@returns The button.`,methods:[],displayName:`OverlayValueButton`,props:{label:{required:!0,tsType:{name:`string`},description:"What the setting is called, in full and phrased as the question the reader\nalready has: `Colour by`, `Group outlines`. It is never the thing written\non the bar — it goes into `title` and `aria-label` with the value after\nit, so a button showing `Species` still announces `Colour by — Species`."},value:{required:!0,tsType:{name:`string`},description:"What the setting is currently on, which is the thing actually written:\n`Species`, `95%`. Write the answer rather than the jargon."},keyWord:{required:!1,tsType:{name:`string`},description:`The one word written in front of the value on a roomy bar.
@default the label, which is right wherever the name is already one word`},showKey:{required:!1,tsType:{name:`boolean`},description:`Whether that key word is written. This is the first thing a narrowing bar
turns off: the name of a setting is read once and its value every time.
@default true`},swatches:{required:!1,tsType:{name:`unknown`},description:`The figure's own colours, drawn as a row of dots in front of the words. A
reader who has just looked at four groups of dots recognises them without
being taught anything, which is worth more than any paint-pot glyph.
@default undefined — no dots are drawn`},active:{required:!1,tsType:{name:`boolean`},description:`Whether the choices behind it are showing.
@default false`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether it cannot be pressed.
@default false`},disabledReason:{required:!1,tsType:{name:`string`},description:`Why it cannot be pressed, which the pointer is told in place of the name.
A greyed control that does not say why is worse than one that is missing.
@default undefined — the pointer is still told the name and the value`},opensMenu:{required:!1,tsType:{name:`boolean`},description:`Whether pressing it opens a menu, which is what tells a screen reader
there is more behind the words than a press.
@default false`},onClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when it is pressed. Leave it out inside a popover, which listens on
the wrapper it puts around the button and would otherwise be told twice.
@default undefined — nothing of its own happens`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute.\n@default undefined"}}}})))()}export{b as i,w as n,p as r,x as t};