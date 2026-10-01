import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-D6L6Qsmh.js";import{n as r,t as i}from"./icon-CgdK5acB.js";import{o as a,t as o}from"./components-DOSsfD-t.js";import{n as s,t as c}from"./htmlSelect-HRMYwaPK.js";import{i as l,n as u,r as d,t as f}from"./menuItem-BPTcfMIS.js";import{i as p,r as m}from"./popoverNextMigrationUtils-CMCmJ3Wq.js";import{n as h,t as g}from"./menuDivider-4R7rkSlP.js";import{n as _,t as v}from"./HelpTooltip-BiBWx74g.js";import{i as y,n as b}from"./overlaySurface-_xoMwQnT.js";import{n as x,t as ee}from"./listNavigation-DiDrqnQ0.js";function S(){return(0,C.useContext)(w)}var C,w;function T(){return(T=e((()=>{C=t(),w=(0,C.createContext)(void 0)})))()}function te(e){return{display:`inline-flex`,alignItems:`center`,gap:Math.max(4,e.gap-2),minHeight:e.controlHeight}}function ne(e,t){return{display:`grid`,gridTemplateColumns:`${t}px minmax(0, 1fr)`,alignItems:`center`,columnGap:Math.max(10,e.gap+2),minHeight:e.controlHeight,width:`100%`}}function re(e){return e.labelSize*8+8}function ie(e,t){let{help:n=!1,disabled:r=!1}=t;return{color:`var(--text-muted)`,fontSize:e.labelSize,fontWeight:500,whiteSpace:`nowrap`,userSelect:`none`,...n?E:void 0,...r?se:void 0}}function ae(e){return{display:`inline-flex`,flexDirection:`column`,alignItems:`flex-start`,gap:2,minHeight:e.controlHeight}}var oe,E,se;function D(){return(D=e((()=>{oe={display:`flex`,alignItems:`center`,minWidth:0},E={textDecoration:`underline dotted var(--border-strong)`,textUnderlineOffset:3,cursor:`help`},se={opacity:.6}})))()}function O(e){let{children:t,label:n,help:r,hideLabel:i=!1,disabled:a=!1,testId:o,labelPlacement:s=`inline`}=e,{metrics:c}=y(),l=S(),u=e.layout??(l===void 0?`row`:`grid`),d=(0,ce.useId)(),f=u===`grid`||!i,p=f?(0,k.jsx)(`span`,{id:u===`grid`?d:void 0,className:r===void 0?void 0:`help-name`,tabIndex:r===void 0?void 0:0,style:ie(c,{help:r!==void 0,disabled:a}),children:n}):null,m=r===void 0?p:(0,k.jsx)(v,{content:r,children:p}),h=r===void 0||f?t:(0,k.jsx)(v,{content:r,children:t});if(u===`grid`){let e=l?.nameWidth??re(c);return(0,k.jsxs)(`div`,{role:`group`,"aria-labelledby":d,"data-testid":o,style:ne(c,e),children:[m,(0,k.jsx)(`span`,{style:oe,children:h})]})}return s===`above`?(0,k.jsxs)(`div`,{"data-testid":o,style:ae(c),children:[m,h]}):(0,k.jsxs)(`div`,{"data-testid":o,style:te(c),children:[m,h]})}var ce,k;function A(){return(A=e((()=>{ce=t(),_(),T(),D(),b(),k=n(),O.__docgenInfo={description:`A name, its help, and the control they belong to.

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
@default 'inline'`},layout:{required:!1,tsType:{name:`union`,raw:`'row' | 'grid'`,elements:[{name:`literal`,value:`'row'`},{name:`literal`,value:`'grid'`}]},description:"Whether the row is a line on a bar or a cell in a panel's grid.\n@default `'grid'` inside an {@link OverlayPanel}, `'row'` anywhere else"}}}})))()}function le(e){let{text:t,onClick:n,icon:r,intent:i=`none`,help:o,disabled:s=!1,testId:c}=e,{metrics:l}=y();return(0,j.jsx)(O,{label:t,help:o,hideLabel:!0,disabled:s,children:(0,j.jsx)(a,{variant:`minimal`,size:l.blueprintSize,intent:i,icon:r,text:t,disabled:s,"data-testid":c,onClick:n})})}var j;function ue(){return(ue=e((()=>{o(),A(),b(),j=n(),le.__docgenInfo={description:`The one control here that does something rather than changing something.

It carries no caption of its own because its words already are one — a verb
and its object — and a caption in front of a button that reads \`Zoom to
selection\` says the same thing twice in a card that has room for neither.
@param props - See {@link OverlayActionProps}.
@returns The button, with its help.`,methods:[],displayName:`OverlayAction`,props:{text:{required:!0,tsType:{name:`string`},description:"What the button reads: a verb and its object, `Zoom to selection`."},onClick:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when it is pressed.`},icon:{required:!1,tsType:{name:`IconName`},description:`A glyph before the text. Never instead of it: an icon-only control in a
floating card is a control nobody presses.
@default undefined`},intent:{required:!1,tsType:{name:`Intent`},description:`What the button means, which is not whether it is pressed.
@default 'none'`}},composes:[`Omit`]}})))()}function de(e,t){return ve(e,t,{padding:`0 ${e.paddingX}px`,borderRadius:e.controlRadius+1,background:ye(t)?`var(--surface-sunken)`:`transparent`})}function fe(e,t){return ve(e,t,{padding:`0 ${e.paddingX+2}px`,borderRadius:e.controlHeight/2,background:`var(--surface-sunken)`,hairline:{boxShadow:ye(t)?`inset 0 0 0 1px var(--border)`:void 0}})}function pe(){return{color:`var(--text)`,fontWeight:600}}function me(){return{color:`var(--text-muted)`,fontWeight:500}}function he(e){return{width:1,height:Math.max(10,e.controlHeight-14),background:`var(--border)`,margin:`0 ${M}px`}}function ge(){return{display:`inline-flex`,color:`var(--text-faint)`}}function _e(e){return e?{outline:`2px solid var(--accent, var(--text))`,outlineOffset:1}:{}}function ve(e,t,n){let{focused:r=!1,disabled:i=!1}=t;return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,gap:M,minWidth:e.buttonSize,height:e.controlHeight,padding:n.padding,border:`none`,borderRadius:n.borderRadius,background:n.background,color:`var(--text)`,...n.hairline,font:`inherit`,fontSize:e.fontSize,lineHeight:1,whiteSpace:`nowrap`,cursor:i?`default`:`pointer`,opacity:i?.6:1,..._e(r&&!i)}}function ye(e){let{hovered:t=!1,active:n=!1,disabled:r=!1}=e;return!r&&(t||n)}var M;function N(){return(N=e((()=>{M=4})))()}function P(){let[e,t]=(0,F.useState)(!1),[n,r]=(0,F.useState)(!1);return{hovered:e,focused:n,handlers:(0,F.useMemo)(()=>({onPointerEnter:()=>t(!0),onPointerLeave:()=>t(!1),onFocus:()=>r(!0),onBlur:()=>r(!1)}),[])}}var F;function I(){return(I=e((()=>{F=t()})))()}function be(e,t){ee({key:xe[e.key]??e.key,target:e.target,preventDefault:()=>e.preventDefault()},t)}var xe;function Se(){return(Se=e((()=>{x(),xe={ArrowLeft:`ArrowUp`,ArrowRight:`ArrowDown`}})))()}function Ce(e,t=`strip`){return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,gap:ke,height:Ee(e,t),padding:L,borderRadius:De(e),background:`var(--surface-sunken)`}}function we(e,t){let{selected:n,disabled:r=!1,size:i=`strip`}=t;return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,gap:4,height:Ee(e,i)-L*2,padding:`0 ${Oe(e,i)}px`,border:`none`,borderRadius:De(e)-L,background:n?`var(--surface)`:`transparent`,color:n?`var(--text)`:`var(--text-muted)`,boxShadow:n?`var(--shadow-sm)`:void 0,font:`inherit`,fontSize:e.fontSize,fontWeight:n?600:500,lineHeight:1,whiteSpace:`nowrap`,cursor:r?`default`:`pointer`,opacity:r?.6:1}}function Te(e,t){return{fontSize:Math.max(9,e.labelSize-1),fontVariantNumeric:`tabular-nums`,fontWeight:500,opacity:t?.85:.75}}function Ee(e,t){return t===`strip`?e.controlHeight:Math.max(20,e.controlHeight-4)}function De(e){return e.controlRadius+2}function Oe(e,t){return t===`strip`?e.paddingX+2:e.paddingX}var L,ke;function Ae(){return(Ae=e((()=>{L=2,ke=2})))()}function R(e){let{value:t,options:n,onChange:r,label:i,role:a=`tablist`}=e,{panelId:o,baseId:s,size:c=`strip`,disabled:l=!1,testId:u}=e,{metrics:d}=y(),f=(0,z.useId)(),p=(0,z.useRef)([]),m=a===`tablist`,h=s??f,g=-1;for(let e=0;e<n.length;e++)n[e]?.value===t&&(g=e);return(0,B.jsx)(`div`,{role:a,"aria-label":i,"data-testid":u,style:Ce(d,c),onKeyDown:e=>{be(e,{length:n.length,selectedIndex:g,onSelect:e=>{let t=n[e];t!==void 0&&t.disabled!==!0&&(p.current[e]?.focus(),r(t.value))}})},children:n.map((e,n)=>{let i=e.value===t,a=l||e.disabled===!0;return(0,B.jsxs)(`button`,{ref:e=>{p.current[n]=e},type:`button`,role:m?`tab`:`radio`,id:m?`${h}-${e.value}`:void 0,"aria-selected":m?i:void 0,"aria-checked":m?void 0:i,"aria-controls":m?o:void 0,title:e.title,disabled:a,tabIndex:n===Math.max(g,0)?0:-1,style:we(d,{selected:i,disabled:a,size:c}),onClick:()=>r(e.value),children:[e.label,e.count===void 0?null:(0,B.jsx)(`span`,{style:Te(d,i),children:e.count})]},e.value)})})}var z,B;function V(){return(V=e((()=>{z=t(),Se(),Ae(),b(),B=n(),R.__docgenInfo={description:`A row of choices in a sunken track, the one in force lifted out of it.

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
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the group.\n@default undefined"}}}})))()}function je(e){let{value:t,options:n,onChange:r,label:i,help:a,hideLabel:o=!1,disabled:s=!1,testId:c}=e;return(0,H.jsx)(O,{label:i,help:a,hideLabel:o,disabled:s,children:(0,H.jsx)(R,{role:`radiogroup`,size:`setting`,label:i,value:t,options:n,disabled:s,testId:c,onChange:r})})}var H;function Me(){return(Me=e((()=>{V(),A(),H=n(),je.__docgenInfo={description:`The row of segments a card uses while every choice still fits on one line.

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
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the control.\n@default undefined"},value:{required:!0,tsType:{name:`TValue`},description:`The current choice.`},options:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`OverlayOption`,elements:[{name:`TValue`}],raw:`OverlayOption<TValue>`}],raw:`ReadonlyArray<OverlayOption<TValue>>`},description:`What may be chosen, in the order offered.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: TValue) => void`,signature:{arguments:[{type:{name:`TValue`},name:`value`}],return:{name:`void`}}},description:`Called with the new choice.`}}}})))()}function U(e){let{colors:t}=e,{metrics:n}=y(),r=t.length>G?G-1:t.length,i=t.length-r,a=Fe(n),o=[];for(let e=0;e<r;e++){let n=t[e];n!==void 0&&o.push((0,W.jsx)(`span`,{style:Ne(n,a)},`${e}:${n}`))}return(0,W.jsxs)(`span`,{"aria-hidden":`true`,style:K,children:[o,i>0?(0,W.jsx)(`span`,{style:Pe(n),children:`+${i}`}):null]})}function Ne(e,t){return{display:`inline-block`,width:t,height:t,borderRadius:`50%`,background:e,boxShadow:t>=6?`inset 0 0 0 1px var(--border)`:void 0}}function Pe(e){return{fontSize:Math.max(9,e.labelSize-1),fontVariantNumeric:`tabular-nums`,fontWeight:600,lineHeight:1}}function Fe(e){return Math.max(4,Math.round(e.buttonSize/6))}var W,G,K;function q(){return(q=e((()=>{b(),W=n(),G=4,K={display:`inline-flex`,alignItems:`center`,gap:2},U.__docgenInfo={description:`The colours of a figure, as the glyph of the control that changes them.

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
reader recognises the plot in it without being taught anything.`}}}})))()}function Ie(e){let{label:t,value:n,keyWord:r=t,showKey:a=!0,swatches:o}=e,{active:s=!1,disabled:c=!1,disabledReason:l}=e,{opensMenu:u=!1,onClick:d,testId:f}=e,{metrics:p}=y(),{hovered:m,focused:h,handlers:g}=P(),_=`${t} — ${n}`;return(0,J.jsxs)(`button`,{type:`button`,title:c&&l!==void 0?l:_,"aria-label":_,"aria-haspopup":u?`menu`:void 0,"aria-expanded":u?s:void 0,disabled:c,"data-testid":f,style:de(p,{hovered:m,focused:h,active:s,disabled:c}),onClick:d,...g,children:[o===void 0||o.length===0?null:(0,J.jsx)(U,{colors:o}),a?(0,J.jsx)(`span`,{style:me(),children:r}):null,(0,J.jsx)(`span`,{style:pe(),children:n}),(0,J.jsx)(`span`,{"aria-hidden":`true`,style:ge(),children:(0,J.jsx)(i,{icon:`caret-down`,size:Le(p.fontSize)})})]})}function Le(e){return e+2}var J;function Re(){return(Re=e((()=>{r(),q(),b(),N(),I(),J=n(),Ie.__docgenInfo={description:`A setting written as its own value, with a caret saying it can be changed.

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
@default undefined — nothing of its own happens`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute.\n@default undefined"}}}})))()}function Y(e){let{label:t,value:n,options:r,onChange:i,keyWord:a,showKey:o}=e,{swatches:s,disabled:c=!1,disabledReason:l}=e,{placement:u=`bottom-end`,testId:p}=e,{metrics:h}=y(),_=(0,X.useId)(),[v,b]=(0,X.useState)(!1),x=n;for(let e of r)e.value===n&&(x=e.label);return(0,Z.jsx)(m,{isOpen:v,disabled:c,placement:u,onInteraction:e=>b(e),content:(0,Z.jsxs)(d,{role:`listbox`,"aria-labelledby":_,size:h.blueprintSize,style:ze,children:[(0,Z.jsx)(g,{title:t,titleId:_}),r.map(e=>(0,Z.jsx)(f,{roleStructure:`listoption`,selected:e.value===n,text:e.label,htmlTitle:e.title,disabled:e.disabled,shouldDismissPopover:!1,onClick:()=>{i(e.value),b(!1)}},e.value))]}),children:(0,Z.jsx)(Ie,{label:t,value:x,keyWord:a,showKey:o,swatches:s,active:v,disabled:c,disabledReason:l,testId:p,opensMenu:!0})})}var X,Z,ze;function Q(){return(Q=e((()=>{l(),h(),u(),p(),X=t(),Re(),b(),Z=n(),ze={minWidth:168},Y.__docgenInfo={description:`A setting written as its value, whose choices are a menu behind it.

It is what a picker becomes on a bar with no room for captions: the same
choices, in the same order, with the one in force ticked. It takes the very
options the picker takes, so a bar swaps one for the other without reshaping
anything it holds — and unlike the picker it answers the reader's question
before it is opened, because the answer is what is written on it.
@param props - See {@link OverlayValueMenuProps}.
@returns The button and its menu.`,methods:[],displayName:`OverlayValueMenu`,props:{label:{required:!0,tsType:{name:`string`},description:"What the setting is called, in full: `Colour by`, `Group outlines`. It\nnames the button for the pointer and the screen reader, and it is written\nover the menu as its heading — so a reader who opened it on a guess is\ntold what they have opened before they choose."},value:{required:!0,tsType:{name:`TValue`},description:`The current choice, whose own label is what the button writes.`},options:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`OverlayOption`,elements:[{name:`TValue`}],raw:`OverlayOption<TValue>`}],raw:`ReadonlyArray<OverlayOption<TValue>>`},description:`What may be chosen, in the order offered.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: TValue) => void`,signature:{arguments:[{type:{name:`TValue`},name:`value`}],return:{name:`void`}}},description:`Called with the new choice.`},keyWord:{required:!1,tsType:{name:`string`},description:`The one word written in front of the value on a roomy bar.
@default the label`},showKey:{required:!1,tsType:{name:`boolean`},description:`Whether that key word is written.
@default true`},swatches:{required:!1,tsType:{name:`unknown`},description:`The figure's own colours, drawn as a row of dots in front of the words.
@default undefined — no dots are drawn`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether the setting cannot be reached at all.
@default false`},disabledReason:{required:!1,tsType:{name:`string`},description:`Why it cannot be reached, which the pointer is told in place of the name.
@default undefined — the pointer is still told the name and the value`},placement:{required:!1,tsType:{name:`PopoverNextPlacement`},description:`Which way the menu opens. Away from the nearest edge of the figure, so the
choices are not the thing that pushes the reader off the picture.
@default 'bottom-end'`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the button.\n@default undefined"}}}})))()}function Be(e){let{value:t,options:n,onChange:r,label:i,help:a,hideLabel:o=!1,disabled:s=!1,testId:l}=e,{metrics:u}=y(),d=S(),{appearance:f=d===void 0?`field`:`quiet`}=e;return f===`quiet`?(0,$.jsx)(O,{label:i,help:a,hideLabel:o,disabled:s,children:(0,$.jsx)(Y,{label:i,value:t,options:n,onChange:r,showKey:!1,disabled:s,testId:l})}):(0,$.jsx)(O,{label:i,help:a,hideLabel:o,disabled:s,children:(0,$.jsx)(c,{value:t,disabled:s,large:u.blueprintSize===`large`,"aria-label":i,"data-testid":l,onChange:e=>r(e.currentTarget.value),children:n.map(e=>(0,$.jsx)(`option`,{value:e.value,title:e.title,disabled:e.disabled,children:e.label},e.value))})})}var $;function Ve(){return(Ve=e((()=>{s(),A(),Q(),T(),b(),$=n(),Be.__docgenInfo={description:`The picker a card reaches for once the choices stop fitting side by side.

The options are written out rather than handed to Blueprint's shorthand,
because a choice that does not apply has to keep its place in the list and
say why the pointer cannot take it — and the shorthand has nowhere to put
that sentence.
@param props - See {@link OverlaySelectProps}.
@returns The caption, its help, and the picker.`,methods:[],displayName:`OverlaySelect`,props:{label:{required:!0,tsType:{name:`string`},description:`The words in front of the control, phrased as the question the reader
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
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the control.\n@default undefined"},value:{required:!0,tsType:{name:`TValue`},description:`The current choice.`},options:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`OverlayOption`,elements:[{name:`TValue`}],raw:`OverlayOption<TValue>`}],raw:`ReadonlyArray<OverlayOption<TValue>>`},description:`What may be chosen, in the order offered.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: TValue) => void`,signature:{arguments:[{type:{name:`TValue`},name:`value`}],return:{name:`void`}}},description:`Called with the new choice.`},appearance:{required:!1,tsType:{name:`union`,raw:`'field' | 'quiet'`,elements:[{name:`literal`,value:`'field'`},{name:`literal`,value:`'quiet'`}]},description:`Whether the picker is drawn as a form field or as a quiet button showing
only its value.

A settings panel gets \`quiet\` on its own, because a bordered field beside
borderless switches and steppers is the one shape in the panel that draws
the eye, and it draws it to whichever setting happens to be a list.
@default 'quiet' inside an OverlayPanel, 'field' anywhere else`}}}})))()}export{E as C,w as D,ae as E,T as O,A as S,re as T,_e as _,U as a,ue as b,Me as c,I as d,P as f,fe as g,he as h,Q as i,S as k,R as l,ge as m,Ve as n,q as o,N as p,Y as r,je as s,Be as t,V as u,pe as v,D as w,O as x,le as y};