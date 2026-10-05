import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-BIexh6Pt.js";import{n as r,t as i}from"./icon-DxNHu1KY.js";import{o as a,t as o}from"./components-NAA62qhj.js";import{n as s,t as c}from"./htmlSelect-D441UHkC.js";import{i as l,n as u,r as d,t as f}from"./menuItem-D0HFvLwf.js";import{i as p,r as m}from"./popoverNextMigrationUtils-CjG54Ras.js";import{n as h,t as g}from"./menuDivider-C82f7K3K.js";import{a as _,c as v,f as y,g as b,h as x,m as S,o as C,p as w,s as T,v as E,y as D}from"./OverlaySegmented-COuAgW48.js";import{i as O,n as k}from"./overlaySurface-D3jmJSyt.js";function A(e){let{text:t,onClick:n,icon:r,intent:i=`none`,help:o,disabled:s=!1,testId:c}=e,{metrics:l}=O();return(0,j.jsx)(x,{label:t,help:o,hideLabel:!0,disabled:s,children:(0,j.jsx)(a,{variant:`minimal`,size:l.blueprintSize,intent:i,icon:r,text:t,disabled:s,"data-testid":c,onClick:n})})}var j;function M(){return(M=e((()=>{o(),b(),k(),j=n(),A.__docgenInfo={description:`The one control here that does something rather than changing something.

It carries no caption of its own because its words already are one — a verb
and its object — and a caption in front of a button that reads \`Zoom to
selection\` says the same thing twice in a card that has room for neither.
@param props - See {@link OverlayActionProps}.
@returns The button, with its help.`,methods:[],displayName:`OverlayAction`,props:{text:{required:!0,tsType:{name:`string`},description:"What the button reads: a verb and its object, `Zoom to selection`."},onClick:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when it is pressed.`},icon:{required:!1,tsType:{name:`IconName`},description:`A glyph before the text. Never instead of it: an icon-only control in a
floating card is a control nobody presses.
@default undefined`},intent:{required:!1,tsType:{name:`Intent`},description:`What the button means, which is not whether it is pressed.
@default 'none'`}},composes:[`Omit`]}})))()}function N(e){let{colors:t}=e,{metrics:n}=O(),r=t.length>R?R-1:t.length,i=t.length-r,a=I(n),o=[];for(let e=0;e<r;e++){let n=t[e];n!==void 0&&o.push((0,L.jsx)(`span`,{style:P(n,a)},`${e}:${n}`))}return(0,L.jsxs)(`span`,{"aria-hidden":`true`,style:z,children:[o,i>0?(0,L.jsx)(`span`,{style:F(n),children:`+${i}`}):null]})}function P(e,t){return{display:`inline-block`,width:t,height:t,borderRadius:`50%`,background:e,boxShadow:t>=6?`inset 0 0 0 1px var(--border)`:void 0}}function F(e){return{fontSize:Math.max(9,e.labelSize-1),fontVariantNumeric:`tabular-nums`,fontWeight:600,lineHeight:1}}function I(e){return Math.max(4,Math.round(e.buttonSize/6))}var L,R,z;function B(){return(B=e((()=>{k(),L=n(),R=4,z={display:`inline-flex`,alignItems:`center`,gap:2},N.__docgenInfo={description:`The colours of a figure, as the glyph of the control that changes them.

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
reader recognises the plot in it without being taught anything.`}}}})))()}function V(e){let{label:t,value:n,keyWord:r=t,showKey:a=!0,swatches:o}=e,{active:s=!1,disabled:c=!1,disabledReason:l}=e,{opensMenu:u=!1,onClick:d,testId:f}=e,{metrics:p}=O(),{hovered:m,focused:h,handlers:g}=C(),_=`${t} — ${n}`;return(0,U.jsxs)(`button`,{type:`button`,title:c&&l!==void 0?l:_,"aria-label":_,"aria-haspopup":u?`menu`:void 0,"aria-expanded":u?s:void 0,disabled:c,"data-testid":f,style:y(p,{hovered:m,focused:h,active:s,disabled:c}),onClick:d,...g,children:[o===void 0||o.length===0?null:(0,U.jsx)(N,{colors:o}),a?(0,U.jsx)(`span`,{style:w(),children:r}):null,(0,U.jsx)(`span`,{style:S(),children:n}),(0,U.jsx)(`span`,{"aria-hidden":`true`,style:v(),children:(0,U.jsx)(i,{icon:`caret-down`,size:H(p.fontSize)})})]})}function H(e){return e+2}var U;function W(){return(W=e((()=>{r(),B(),k(),T(),_(),U=n(),V.__docgenInfo={description:`A setting written as its own value, with a caret saying it can be changed.

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
@default undefined — nothing of its own happens`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute.\n@default undefined"}}}})))()}function G(e){let{label:t,value:n,options:r,onChange:i,keyWord:a,showKey:o}=e,{swatches:s,disabled:c=!1,disabledReason:l}=e,{placement:u=`bottom-end`,testId:p}=e,{metrics:h}=O(),_=(0,K.useId)(),[v,y]=(0,K.useState)(!1),b=n;for(let e of r)e.value===n&&(b=e.label);return(0,q.jsx)(m,{isOpen:v,disabled:c,placement:u,onInteraction:e=>y(e),content:(0,q.jsxs)(d,{role:`listbox`,"aria-labelledby":_,size:h.blueprintSize,style:J,children:[(0,q.jsx)(g,{title:t,titleId:_}),r.map(e=>(0,q.jsx)(f,{roleStructure:`listoption`,selected:e.value===n,text:e.label,htmlTitle:e.title,disabled:e.disabled,shouldDismissPopover:!1,onClick:()=>{i(e.value),y(!1)}},e.value))]}),children:(0,q.jsx)(V,{label:t,value:b,keyWord:a,showKey:o,swatches:s,active:v,disabled:c,disabledReason:l,testId:p,opensMenu:!0})})}var K,q,J;function Y(){return(Y=e((()=>{l(),h(),u(),p(),K=t(),W(),k(),q=n(),J={minWidth:168},G.__docgenInfo={description:`A setting written as its value, whose choices are a menu behind it.

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
@default 'bottom-end'`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the button.\n@default undefined"}}}})))()}function X(e){let{value:t,options:n,onChange:r,label:i,help:a,hideLabel:o=!1,disabled:s=!1,testId:l}=e,{metrics:u}=O(),d=D(),{appearance:f=d===void 0?`field`:`quiet`}=e;return f===`quiet`?(0,Z.jsx)(x,{label:i,help:a,hideLabel:o,disabled:s,children:(0,Z.jsx)(G,{label:i,value:t,options:n,onChange:r,showKey:!1,disabled:s,testId:l})}):(0,Z.jsx)(x,{label:i,help:a,hideLabel:o,disabled:s,children:(0,Z.jsx)(c,{value:t,disabled:s,large:u.blueprintSize===`large`,"aria-label":i,"data-testid":l,onChange:e=>r(e.currentTarget.value),children:n.map(e=>(0,Z.jsx)(`option`,{value:e.value,title:e.title,disabled:e.disabled,children:e.label},e.value))})})}var Z;function Q(){return(Q=e((()=>{s(),b(),Y(),E(),k(),Z=n(),X.__docgenInfo={description:`The picker a card reaches for once the choices stop fitting side by side.

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
@default 'quiet' inside an OverlayPanel, 'field' anywhere else`}}}})))()}export{N as a,M as c,Y as i,Q as n,B as o,G as r,A as s,X as t};