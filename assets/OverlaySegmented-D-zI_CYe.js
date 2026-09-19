import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-Gi02zF1q.js";import{o as r,t as i}from"./components-CgxeQAEZ.js";import{n as a,t as o}from"./HelpTooltip-CvTxanNq.js";import{i as s,n as c}from"./overlaySurface-Dg4ipkAG.js";import{n as l,t as u}from"./listNavigation-DiDrqnQ0.js";function d(){return(0,f.useContext)(p)}var f,p;function m(){return(m=e((()=>{f=t(),p=(0,f.createContext)(void 0)})))()}function h(e){return{display:`inline-flex`,alignItems:`center`,gap:Math.max(4,e.gap-2),minHeight:e.controlHeight}}function g(e,t){return{display:`grid`,gridTemplateColumns:`${t}px minmax(0, 1fr)`,alignItems:`center`,columnGap:Math.max(10,e.gap+2),minHeight:e.controlHeight,width:`100%`}}function _(e){return e.labelSize*8+8}function ee(e,t){let{help:n=!1,disabled:r=!1}=t;return{color:`var(--text-muted)`,fontSize:e.labelSize,fontWeight:500,whiteSpace:`nowrap`,userSelect:`none`,...n?b:void 0,...r?x:void 0}}function v(e){return{display:`inline-flex`,flexDirection:`column`,alignItems:`flex-start`,gap:2,minHeight:e.controlHeight}}var y,b,x;function S(){return(S=e((()=>{y={display:`flex`,alignItems:`center`,minWidth:0},b={textDecoration:`underline dotted var(--border-strong)`,textUnderlineOffset:3,cursor:`help`},x={opacity:.6}})))()}function C(e){let{children:t,label:n,help:r,hideLabel:i=!1,disabled:a=!1,testId:c,labelPlacement:l=`inline`}=e,{metrics:u}=s(),f=d(),p=e.layout??(f===void 0?`row`:`grid`),m=(0,w.useId)(),b=p===`grid`||!i,x=b?(0,T.jsx)(`span`,{id:p===`grid`?m:void 0,className:r===void 0?void 0:`help-name`,tabIndex:r===void 0?void 0:0,style:ee(u,{help:r!==void 0,disabled:a}),children:n}):null,S=r===void 0?x:(0,T.jsx)(o,{content:r,children:x}),C=r===void 0||b?t:(0,T.jsx)(o,{content:r,children:t});if(p===`grid`){let e=f?.nameWidth??_(u);return(0,T.jsxs)(`div`,{role:`group`,"aria-labelledby":m,"data-testid":c,style:g(u,e),children:[S,(0,T.jsx)(`span`,{style:y,children:C})]})}return l===`above`?(0,T.jsxs)(`div`,{"data-testid":c,style:v(u),children:[S,C]}):(0,T.jsxs)(`div`,{"data-testid":c,style:h(u),children:[S,C]})}var w,T;function E(){return(E=e((()=>{w=t(),a(),m(),S(),c(),T=n(),C.__docgenInfo={description:`A name, its help, and the control they belong to.

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
@default 'inline'`},layout:{required:!1,tsType:{name:`union`,raw:`'row' | 'grid'`,elements:[{name:`literal`,value:`'row'`},{name:`literal`,value:`'grid'`}]},description:"Whether the row is a line on a bar or a cell in a panel's grid.\n@default `'grid'` inside an {@link OverlayPanel}, `'row'` anywhere else"}}}})))()}function D(e){let{text:t,onClick:n,icon:i,intent:a=`none`,help:o,disabled:c=!1,testId:l}=e,{metrics:u}=s();return(0,O.jsx)(C,{label:t,help:o,hideLabel:!0,disabled:c,children:(0,O.jsx)(r,{variant:`minimal`,size:u.blueprintSize,intent:a,icon:i,text:t,disabled:c,"data-testid":l,onClick:n})})}var O;function k(){return(k=e((()=>{i(),E(),c(),O=n(),D.__docgenInfo={description:`The one control here that does something rather than changing something.

It carries no caption of its own because its words already are one — a verb
and its object — and a caption in front of a button that reads \`Zoom to
selection\` says the same thing twice in a card that has room for neither.
@param props - See {@link OverlayActionProps}.
@returns The button, with its help.`,methods:[],displayName:`OverlayAction`,props:{text:{required:!0,tsType:{name:`string`},description:"What the button reads: a verb and its object, `Zoom to selection`."},onClick:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when it is pressed.`},icon:{required:!1,tsType:{name:`IconName`},description:`A glyph before the text. Never instead of it: an icon-only control in a
floating card is a control nobody presses.
@default undefined`},intent:{required:!1,tsType:{name:`Intent`},description:`What the button means, which is not whether it is pressed.
@default 'none'`}},composes:[`Omit`]}})))()}function te(e,t){return P(e,t,{padding:`0 ${e.paddingX}px`,borderRadius:e.controlRadius+1,background:F(t)?`var(--surface-sunken)`:`transparent`})}function ne(e,t){return P(e,t,{padding:`0 ${e.paddingX+2}px`,borderRadius:e.controlHeight/2,background:`var(--surface-sunken)`,hairline:{boxShadow:F(t)?`inset 0 0 0 1px var(--border)`:void 0}})}function A(){return{color:`var(--text)`,fontWeight:600}}function j(){return{color:`var(--text-muted)`,fontWeight:500}}function M(e){return{width:1,height:Math.max(10,e.controlHeight-14),background:`var(--border)`,margin:`0 ${I}px`}}function re(){return{display:`inline-flex`,color:`var(--text-faint)`}}function N(e){return e?{outline:`2px solid var(--accent, var(--text))`,outlineOffset:1}:{}}function P(e,t,n){let{focused:r=!1,disabled:i=!1}=t;return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,gap:I,minWidth:e.buttonSize,height:e.controlHeight,padding:n.padding,border:`none`,borderRadius:n.borderRadius,background:n.background,color:`var(--text)`,...n.hairline,font:`inherit`,fontSize:e.fontSize,lineHeight:1,whiteSpace:`nowrap`,cursor:i?`default`:`pointer`,opacity:i?.6:1,...N(r&&!i)}}function F(e){let{hovered:t=!1,active:n=!1,disabled:r=!1}=e;return!r&&(t||n)}var I;function L(){return(L=e((()=>{I=4})))()}function ie(){let[e,t]=(0,R.useState)(!1),[n,r]=(0,R.useState)(!1);return{hovered:e,focused:n,handlers:(0,R.useMemo)(()=>({onPointerEnter:()=>t(!0),onPointerLeave:()=>t(!1),onFocus:()=>r(!0),onBlur:()=>r(!1)}),[])}}var R;function z(){return(z=e((()=>{R=t()})))()}function ae(e,t){u({key:B[e.key]??e.key,target:e.target,preventDefault:()=>e.preventDefault()},t)}var B;function V(){return(V=e((()=>{l(),B={ArrowLeft:`ArrowUp`,ArrowRight:`ArrowDown`}})))()}function oe(e,t=`strip`){return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,gap:G,height:H(e,t),padding:W,borderRadius:U(e),background:`var(--surface-sunken)`}}function se(e,t){let{selected:n,disabled:r=!1,size:i=`strip`}=t;return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,gap:4,height:H(e,i)-W*2,padding:`0 ${le(e,i)}px`,border:`none`,borderRadius:U(e)-W,background:n?`var(--surface)`:`transparent`,color:n?`var(--text)`:`var(--text-muted)`,boxShadow:n?`var(--shadow-sm)`:void 0,font:`inherit`,fontSize:e.fontSize,fontWeight:n?600:500,lineHeight:1,whiteSpace:`nowrap`,cursor:r?`default`:`pointer`,opacity:r?.6:1}}function ce(e,t){return{fontSize:Math.max(9,e.labelSize-1),fontVariantNumeric:`tabular-nums`,fontWeight:500,opacity:t?.85:.75}}function H(e,t){return t===`strip`?e.controlHeight:Math.max(20,e.controlHeight-4)}function U(e){return e.controlRadius+2}function le(e,t){return t===`strip`?e.paddingX+2:e.paddingX}var W,G;function K(){return(K=e((()=>{W=2,G=2})))()}function q(e){let{value:t,options:n,onChange:r,label:i,role:a=`tablist`}=e,{panelId:o,baseId:c,size:l=`strip`,disabled:u=!1,testId:d}=e,{metrics:f}=s(),p=(0,J.useId)(),m=(0,J.useRef)([]),h=a===`tablist`,g=c??p,_=-1;for(let e=0;e<n.length;e++)n[e]?.value===t&&(_=e);return(0,Y.jsx)(`div`,{role:a,"aria-label":i,"data-testid":d,style:oe(f,l),onKeyDown:e=>{ae(e,{length:n.length,selectedIndex:_,onSelect:e=>{let t=n[e];t!==void 0&&t.disabled!==!0&&(m.current[e]?.focus(),r(t.value))}})},children:n.map((e,n)=>{let i=e.value===t,a=u||e.disabled===!0;return(0,Y.jsxs)(`button`,{ref:e=>{m.current[n]=e},type:`button`,role:h?`tab`:`radio`,id:h?`${g}-${e.value}`:void 0,"aria-selected":h?i:void 0,"aria-checked":h?void 0:i,"aria-controls":h?o:void 0,title:e.title,disabled:a,tabIndex:n===Math.max(_,0)?0:-1,style:se(f,{selected:i,disabled:a,size:l}),onClick:()=>r(e.value),children:[e.label,e.count===void 0?null:(0,Y.jsx)(`span`,{style:ce(f,i),children:e.count})]},e.value)})})}var J,Y;function X(){return(X=e((()=>{J=t(),V(),K(),c(),Y=n(),q.__docgenInfo={description:`A row of choices in a sunken track, the one in force lifted out of it.

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
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the group.\n@default undefined"}}}})))()}function Z(e){let{value:t,options:n,onChange:r,label:i,help:a,hideLabel:o=!1,disabled:s=!1,testId:c}=e;return(0,Q.jsx)(C,{label:i,help:a,hideLabel:o,disabled:s,children:(0,Q.jsx)(q,{role:`radiogroup`,size:`setting`,label:i,value:t,options:n,disabled:s,testId:c,onChange:r})})}var Q;function $(){return($=e((()=>{X(),E(),Q=n(),Z.__docgenInfo={description:`The row of segments a card uses while every choice still fits on one line.

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
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the control.\n@default undefined"},value:{required:!0,tsType:{name:`TValue`},description:`The current choice.`},options:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`OverlayOption`,elements:[{name:`TValue`}],raw:`OverlayOption<TValue>`}],raw:`ReadonlyArray<OverlayOption<TValue>>`},description:`What may be chosen, in the order offered.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: TValue) => void`,signature:{arguments:[{type:{name:`TValue`},name:`value`}],return:{name:`void`}}},description:`Called with the new choice.`}}}})))()}export{p as C,v as S,d as T,C as _,z as a,S as b,re as c,N as d,te as f,k as g,D as h,X as i,M as l,A as m,$ as n,ie as o,j as p,q as r,L as s,Z as t,ne as u,E as v,m as w,_ as x,b as y};