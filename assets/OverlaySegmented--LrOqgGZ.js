import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-Bx_6GVVU.js";import{n as r,t as i}from"./HelpTooltip-BWtj71Fc.js";import{a,c as o,i as s,o as c,r as l,s as u,t as d}from"./overlayRowStyles-ZmfttMho.js";import{i as f,n as p}from"./overlaySurface-Dif2B1Pc.js";import{n as m,t as h}from"./listNavigation-DiDrqnQ0.js";function g(){return(0,_.useContext)(v)}var _,v;function y(){return(y=e((()=>{_=t(),v=(0,_.createContext)(void 0)})))()}function b(e){let{children:t,label:n,help:r,hideLabel:l=!1,disabled:p=!1,testId:m,labelPlacement:h=`inline`}=e,{metrics:_}=f(),v=g(),y=e.layout??(v===void 0?`row`:`grid`),b=(0,x.useId)(),C=y===`grid`||!l,w=C?(0,S.jsx)(`span`,{id:y===`grid`?b:void 0,className:r===void 0?void 0:`help-name`,tabIndex:r===void 0?void 0:0,style:c(_,{help:r!==void 0,disabled:p}),children:n}):null,T=r===void 0?w:(0,S.jsx)(i,{content:r,children:w}),E=r===void 0||C?t:(0,S.jsx)(i,{content:r,children:t});if(y===`grid`){let e=v?.nameWidth??a(_);return(0,S.jsxs)(`div`,{role:`group`,"aria-labelledby":b,"data-testid":m,style:s(_,e),children:[T,(0,S.jsx)(`span`,{style:d,children:E})]})}return h===`above`?(0,S.jsxs)(`div`,{"data-testid":m,style:o(_),children:[T,E]}):(0,S.jsxs)(`div`,{"data-testid":m,style:u(_),children:[T,E]})}var x,S;function C(){return(C=e((()=>{x=t(),r(),y(),l(),p(),S=n(),b.__docgenInfo={description:`A name, its help, and the control they belong to.

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
@default 'inline'`},layout:{required:!1,tsType:{name:`union`,raw:`'row' | 'grid'`,elements:[{name:`literal`,value:`'row'`},{name:`literal`,value:`'grid'`}]},description:"Whether the row is a line on a bar or a cell in a panel's grid.\n@default `'grid'` inside an {@link OverlayPanel}, `'row'` anywhere else"}}}})))()}function w(e,t){h({key:T[e.key]??e.key,target:e.target,preventDefault:()=>e.preventDefault()},t)}var T;function E(){return(E=e((()=>{m(),T={ArrowLeft:`ArrowUp`,ArrowRight:`ArrowDown`}})))()}function D(e,t=`strip`){return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,gap:P,height:A(e,t),padding:N,borderRadius:j(e),background:`var(--surface-sunken)`}}function O(e,t){let{selected:n,disabled:r=!1,size:i=`strip`}=t;return{boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,gap:4,height:A(e,i)-N*2,padding:`0 ${M(e,i)}px`,border:`none`,borderRadius:j(e)-N,background:n?`var(--surface)`:`transparent`,color:n?`var(--text)`:`var(--text-muted)`,boxShadow:n?`var(--shadow-sm)`:void 0,font:`inherit`,fontSize:e.fontSize,fontWeight:n?600:500,lineHeight:1,whiteSpace:`nowrap`,cursor:r?`default`:`pointer`,opacity:r?.6:1}}function k(e,t){return{fontSize:Math.max(9,e.labelSize-1),fontVariantNumeric:`tabular-nums`,fontWeight:500,opacity:t?.85:.75}}function A(e,t){return t===`strip`?e.controlHeight:Math.max(20,e.controlHeight-4)}function j(e){return e.controlRadius+2}function M(e,t){return t===`strip`?e.paddingX+2:e.paddingX}var N,P;function F(){return(F=e((()=>{N=2,P=2})))()}function I(e){let{value:t,options:n,onChange:r,label:i,role:a=`tablist`}=e,{panelId:o,baseId:s,size:c=`strip`,disabled:l=!1,testId:u}=e,{metrics:d}=f(),p=(0,L.useId)(),m=(0,L.useRef)([]),h=a===`tablist`,g=s??p,_=-1;for(let e=0;e<n.length;e++)n[e]?.value===t&&(_=e);return(0,R.jsx)(`div`,{role:a,"aria-label":i,"data-testid":u,style:D(d,c),onKeyDown:e=>{w(e,{length:n.length,selectedIndex:_,onSelect:e=>{let t=n[e];t!==void 0&&t.disabled!==!0&&(m.current[e]?.focus(),r(t.value))}})},children:n.map((e,n)=>{let i=e.value===t,a=l||e.disabled===!0;return(0,R.jsxs)(`button`,{ref:e=>{m.current[n]=e},type:`button`,role:h?`tab`:`radio`,id:h?`${g}-${e.value}`:void 0,"aria-selected":h?i:void 0,"aria-checked":h?void 0:i,"aria-controls":h?o:void 0,title:e.title,disabled:a,tabIndex:n===Math.max(_,0)?0:-1,style:O(d,{selected:i,disabled:a,size:c}),onClick:()=>r(e.value),children:[e.label,e.count===void 0?null:(0,R.jsx)(`span`,{style:k(d,i),children:e.count})]},e.value)})})}var L,R;function z(){return(z=e((()=>{L=t(),E(),F(),p(),R=n(),I.__docgenInfo={description:`A row of choices in a sunken track, the one in force lifted out of it.

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
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the group.\n@default undefined"}}}})))()}function B(e){let{value:t,options:n,onChange:r,label:i,help:a,hideLabel:o=!1,disabled:s=!1,testId:c}=e;return(0,V.jsx)(b,{label:i,help:a,hideLabel:o,disabled:s,children:(0,V.jsx)(I,{role:`radiogroup`,size:`setting`,label:i,value:t,options:n,disabled:s,testId:c,onChange:r})})}var V;function H(){return(H=e((()=>{z(),C(),V=n(),B.__docgenInfo={description:`The row of segments a card uses while every choice still fits on one line.

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
@default false`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the control.\n@default undefined"},value:{required:!0,tsType:{name:`TValue`},description:`The current choice.`},options:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`OverlayOption`,elements:[{name:`TValue`}],raw:`OverlayOption<TValue>`}],raw:`ReadonlyArray<OverlayOption<TValue>>`},description:`What may be chosen, in the order offered.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: TValue) => void`,signature:{arguments:[{type:{name:`TValue`},name:`value`}],return:{name:`void`}}},description:`Called with the new choice.`}}}})))()}export{b as a,y as c,z as i,g as l,H as n,C as o,I as r,v as s,B as t};