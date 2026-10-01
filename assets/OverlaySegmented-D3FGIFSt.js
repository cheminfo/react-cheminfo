import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-Cy89bvdA.js";import{n as r,t as i}from"./HelpTooltip-DJBDr9Tg.js";import{i as a,n as o}from"./overlaySurface-Cb72-hcv.js";import{n as s,t as c}from"./listNavigation-DiDrqnQ0.js";function l(){return(0,u.useContext)(d)}var u,d;function f(){return(f=e((()=>{u=t(),d=(0,u.createContext)(void 0)})))()}function p(e){return{display:`inline-flex`,alignItems:`center`,gap:Math.max(4,e.gap-2),minHeight:e.controlHeight}}function m(e,t){return{display:`grid`,gridTemplateColumns:`${t}px minmax(0, 1fr)`,alignItems:`center`,columnGap:Math.max(10,e.gap+2),minHeight:e.controlHeight,width:`100%`}}function h(e){return e.labelSize*8+8}function g(e,t){let{help:n=!1,disabled:r=!1}=t;return{color:`var(--text-muted)`,fontSize:e.labelSize,fontWeight:500,whiteSpace:`nowrap`,userSelect:`none`,...n?y:void 0,...r?b:void 0}}function _(e){return{display:`inline-flex`,flexDirection:`column`,alignItems:`flex-start`,gap:2,minHeight:e.controlHeight}}var v,y,b;function x(){return(x=e((()=>{v={display:`flex`,alignItems:`center`,minWidth:0},y={textDecoration:`underline dotted var(--border-strong)`,textUnderlineOffset:3,cursor:`help`},b={opacity:.6}})))()}function S(e){let{children:t,label:n,help:r,hideLabel:o=!1,disabled:s=!1,testId:c,labelPlacement:u=`inline`}=e,{metrics:d}=a(),f=l(),y=e.layout??(f===void 0?`row`:`grid`),b=(0,C.useId)(),x=y===`grid`||!o,S=x?(0,w.jsx)(`span`,{id:y===`grid`?b:void 0,className:r===void 0?void 0:`help-name`,tabIndex:r===void 0?void 0:0,style:g(d,{help:r!==void 0,disabled:s}),children:n}):null,T=r===void 0?S:(0,w.jsx)(i,{content:r,children:S}),E=r===void 0||x?t:(0,w.jsx)(i,{content:r,children:t});if(y===`grid`){let e=f?.nameWidth??h(d);return(0,w.jsxs)(`div`,{role:`group`,"aria-labelledby":b,"data-testid":c,style:m(d,e),children:[T,(0,w.jsx)(`span`,{style:v,children:E})]})}return u===`above`?(0,w.jsxs)(`div`,{"data-testid":c,style:_(d),children:[T,E]}):(0,w.jsxs)(`div`,{"data-testid":c,style:p(d),children:[T,E]})}var C,w;function T(){return(T=e((()=>{C=t(),r(),f(),x(),o(),w=n(),S.__docgenInfo={description:`A name, its help, and the control they belong to.

Every control of this domain is one of these, which is the whole reason a
picker and a stepper standing side by side in a card line up on the same
baseline and answer to the same measurements. A caller writing a control
this package does not have reaches for it too, rather than approximating the
geometry and landing half a pixel out.

The help hangs off the name rather than off a question mark beside it. Five
controls each with a glyph put five question marks in a column down the left
edge of a panel, and the eye reads that column before it reads a single
word; a dotted underline says the same thing and costs nothing. The name is
reachable by tab for the same reason the glyph was, so the explanation is
not reserved to whoever is holding a pointer, and it carries the class
\`help-name\` — the counterpart of the glyph's \`help-icon\` — so that a style
or a test looking for either has something to find. In a panel the name
also names its row out loud, since a name a whole column away from its
control is not associated with it by proximity alone.
@param props - See {@link OverlayRowProps}.
@returns The row.`,methods:[],displayName:`OverlayRow`,props:{label:{required:!0,tsType:{name:`string`},description:`The words in front of the control, phrased as the question the reader
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
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the control.\n@default undefined"},children:{required:!0,tsType:{name:`ReactNode`},description:`The control itself.`},labelPlacement:{required:!1,tsType:{name:`union`,raw:`'inline' | 'above'`,elements:[{name:`literal`,value:`'inline'`},{name:`literal`,value:`'above'`}]},description:`Whether the name sits in front of the control or above it. Above once the
names are long enough to push the card past a third of the figure. Only
consulted on a bar; a panel row is always two columns.
@default 'inline'`},layout:{required:!1,tsType:{name:`union`,raw:`'row' | 'grid'`,elements:[{name:`literal`,value:`'row'`},{name:`literal`,value:`'grid'`}]},description:"Whether the row is a line on a bar or a cell in a panel's grid.\n@default `'grid'` inside an {@link OverlayPanel}, `'row'` anywhere else"}}}})))()}function E(e,t){return O(e,t,{padding:`0 ${e.paddingX}px`,borderRadius:e.controlRadius+1,background:k(t)?`var(--surface-sunken)`:`transparent`})}function ee(e,t){return O(e,t,{padding:`0 ${e.paddingX+2}px`,borderRadius:e.controlHeight/2,background:`var(--surface-sunken)`,hairline:{boxShadow:k(t)?`inset 0 0 0 1px var(--border)`:void 0}})}function te(){return{color:`var(--text)`,fontWeight:600}}function ne(){return{color:`var(--text-muted)`,fontWeight:500}}function re(e){return{width:1,height:Math.max(10,e.controlHeight-14),background:`var(--border)`,margin:`0 ${A}px`}}function ie(){return{display:`inline-flex`,color:`var(--text-faint)`}}function D(e){return e?{outline:`2px solid var(--accent, var(--text))`,outlineOffset:1}:{}}function O(e,t,n){let{focused:r=!1,disabled:i=!1}=t;return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,gap:A,minWidth:e.buttonSize,height:e.controlHeight,padding:n.padding,border:`none`,borderRadius:n.borderRadius,background:n.background,color:`var(--text)`,...n.hairline,font:`inherit`,fontSize:e.fontSize,lineHeight:1,whiteSpace:`nowrap`,cursor:i?`default`:`pointer`,opacity:i?.6:1,...D(r&&!i)}}function k(e){let{hovered:t=!1,active:n=!1,disabled:r=!1}=e;return!r&&(t||n)}var A;function j(){return(j=e((()=>{A=4})))()}function M(){let[e,t]=(0,N.useState)(!1),[n,r]=(0,N.useState)(!1);return{hovered:e,focused:n,handlers:(0,N.useMemo)(()=>({onPointerEnter:()=>t(!0),onPointerLeave:()=>t(!1),onFocus:()=>r(!0),onBlur:()=>r(!1)}),[])}}var N;function P(){return(P=e((()=>{N=t()})))()}function F(e,t){c({key:I[e.key]??e.key,target:e.target,preventDefault:()=>e.preventDefault()},t)}var I;function L(){return(L=e((()=>{s(),I={ArrowLeft:`ArrowUp`,ArrowRight:`ArrowDown`}})))()}function R(e,t=`strip`){return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,gap:G,height:V(e,t),padding:W,borderRadius:H(e),background:`var(--surface-sunken)`}}function z(e,t){let{selected:n,disabled:r=!1,size:i=`strip`}=t;return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,gap:4,height:V(e,i)-W*2,padding:`0 ${U(e,i)}px`,border:`none`,borderRadius:H(e)-W,background:n?`var(--surface)`:`transparent`,color:n?`var(--text)`:`var(--text-muted)`,boxShadow:n?`var(--shadow-sm)`:void 0,font:`inherit`,fontSize:e.fontSize,fontWeight:n?600:500,lineHeight:1,whiteSpace:`nowrap`,cursor:r?`default`:`pointer`,opacity:r?.6:1}}function B(e,t){return{fontSize:Math.max(9,e.labelSize-1),fontVariantNumeric:`tabular-nums`,fontWeight:500,opacity:t?.85:.75}}function V(e,t){return t===`strip`?e.controlHeight:Math.max(20,e.controlHeight-4)}function H(e){return e.controlRadius+2}function U(e,t){return t===`strip`?e.paddingX+2:e.paddingX}var W,G;function K(){return(K=e((()=>{W=2,G=2})))()}function q(e){let{value:t,options:n,onChange:r,label:i,role:o=`tablist`}=e,{panelId:s,baseId:c,size:l=`strip`,disabled:u=!1,testId:d}=e,{metrics:f}=a(),p=(0,J.useId)(),m=(0,J.useRef)([]),h=o===`tablist`,g=c??p,_=-1;for(let e=0;e<n.length;e++)n[e]?.value===t&&(_=e);return(0,Y.jsx)(`div`,{role:o,"aria-label":i,"data-testid":d,style:R(f,l),onKeyDown:e=>{F(e,{length:n.length,selectedIndex:_,onSelect:e=>{let t=n[e];t!==void 0&&t.disabled!==!0&&(m.current[e]?.focus(),r(t.value))}})},children:n.map((e,n)=>{let i=e.value===t,a=u||e.disabled===!0;return(0,Y.jsxs)(`button`,{ref:e=>{m.current[n]=e},type:`button`,role:h?`tab`:`radio`,id:h?`${g}-${e.value}`:void 0,"aria-selected":h?i:void 0,"aria-checked":h?void 0:i,"aria-controls":h?s:void 0,title:e.title,disabled:a,tabIndex:n===Math.max(_,0)?0:-1,style:z(f,{selected:i,disabled:a,size:l}),onClick:()=>r(e.value),children:[e.label,e.count===void 0?null:(0,Y.jsx)(`span`,{style:B(f,i),children:e.count})]},e.value)})})}var J,Y;function X(){return(X=e((()=>{J=t(),L(),K(),o(),Y=n(),q.__docgenInfo={description:`A row of choices in a sunken track, the one in force lifted out of it.

It is the package's one segmented control, used both as a figure's tab strip
and as a setting inside a card, because a reader who has learned to press
one of them has learned to press the other. Only one segment is in the tab
order — the one in force — and the arrows move between them from there, so
a strip of six views costs a reader walking the page one stop rather than
six.
@param props - See {@link OverlayPillsProps}.
@returns The group.`,methods:[],displayName:`OverlayPills`,props:{value:{required:!0,tsType:{name:`TValue`},description:`The current choice.`},options:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`OverlayPillOption`,elements:[{name:`TValue`}],raw:`OverlayPillOption<TValue>`}],raw:`ReadonlyArray<OverlayPillOption<TValue>>`},description:`What may be chosen, in the order offered.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: TValue) => void`,signature:{arguments:[{type:{name:`TValue`},name:`value`}],return:{name:`void`}}},description:`Called with the new choice.`},label:{required:!0,tsType:{name:`string`},description:`What the group is called, for a reader arriving by keyboard.`},role:{required:!1,tsType:{name:`union`,raw:`'tablist' | 'radiogroup'`,elements:[{name:`literal`,value:`'tablist'`},{name:`literal`,value:`'radiogroup'`}]},description:`What the group is: a strip moving between the views of one figure, or a
set of choices for one setting. The look is the same either way — it is
the announcement and the shape of the keyboard that differ.
@default 'tablist'`},size:{required:!1,tsType:{name:`union`,raw:`'strip' | 'setting'`,elements:[{name:`literal`,value:`'strip'`},{name:`literal`,value:`'setting'`}]},description:`How big it is drawn: the figure's own tab bar, or one question inside a
card, which is a little smaller.
@default 'strip'`},panelId:{required:!1,tsType:{name:`string`},description:`The \`id\` of the panel a tab strip drives, so a screen reader can walk from
a tab to what it shows. One panel is normally shared, since only the tab
in force is ever rendered.
@default undefined`},baseId:{required:!1,tsType:{name:`string`},description:`Stem of the \`id\` every tab carries, for a panel that names the tab it
belongs to. Left out, one is generated.
@default undefined — a generated id`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether the whole group is greyed and unreachable.
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the group.\n@default undefined"}}}})))()}function Z(e){let{value:t,options:n,onChange:r,label:i,help:a,hideLabel:o=!1,disabled:s=!1,testId:c}=e;return(0,Q.jsx)(S,{label:i,help:a,hideLabel:o,disabled:s,children:(0,Q.jsx)(q,{role:`radiogroup`,size:`setting`,label:i,value:t,options:n,disabled:s,testId:c,onChange:r})})}var Q;function $(){return($=e((()=>{X(),T(),Q=n(),Z.__docgenInfo={description:`The row of segments a card uses while every choice still fits on one line.

Its choices are readable without being opened, which is worth the width up
to about four of them: a reader who can see that a second view exists asks
for it, and a reader looking at a closed picker does not.

It is the same sunken track a figure's tab strip is made of, one size down,
so a reader meets one device in a viewer rather than two that happen to both
be rows of choices. The segments carry the caption's own name, because a
bare row of buttons over a figure is announced as nothing at all to a reader
arriving by keyboard.
@param props - See {@link OverlaySegmentedProps}.
@returns The caption, its help, and the segments.`,methods:[],displayName:`OverlaySegmented`,props:{label:{required:!0,tsType:{name:`string`},description:`The words in front of the control, phrased as the question the reader
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
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the control.\n@default undefined"},value:{required:!0,tsType:{name:`TValue`},description:`The current choice.`},options:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`OverlayOption`,elements:[{name:`TValue`}],raw:`OverlayOption<TValue>`}],raw:`ReadonlyArray<OverlayOption<TValue>>`},description:`What may be chosen, in the order offered.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: TValue) => void`,signature:{arguments:[{type:{name:`TValue`},name:`value`}],return:{name:`void`}}},description:`Called with the new choice.`}}}})))()}export{l as C,f as S,y as _,P as a,_ as b,ie as c,D as d,E as f,T as g,S as h,X as i,re as l,te as m,$ as n,M as o,ne as p,q as r,j as s,Z as t,ee as u,x as v,d as x,h as y};