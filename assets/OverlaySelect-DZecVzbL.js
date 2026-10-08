import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-Bx_6GVVU.js";import{c as r,t as i}from"./components-CcetMVIl.js";import{n as a,t as o}from"./htmlSelect-CoXpB2Ea.js";import{i as s,n as c,r as l,t as u}from"./menuItem-IdPhLJhb.js";import{i as d,r as f}from"./popoverNextMigrationUtils-C8I8fZoZ.js";import{n as p,t as m}from"./menuDivider-BAdYuJk0.js";import{a as h,c as g,l as _,o as v}from"./OverlaySegmented--LrOqgGZ.js";import{i as y,n as b}from"./overlaySurface-Dif2B1Pc.js";import{n as x,t as S}from"./OverlayValueButton-DBi22Nap.js";function C(e){let{text:t,onClick:n,icon:i,intent:a=`none`,help:o,disabled:s=!1,testId:c}=e,{metrics:l}=y();return(0,w.jsx)(h,{label:t,help:o,hideLabel:!0,disabled:s,children:(0,w.jsx)(r,{variant:`minimal`,size:l.blueprintSize,intent:a,icon:i,text:t,disabled:s,"data-testid":c,onClick:n})})}var w;function T(){return(T=e((()=>{i(),v(),b(),w=n(),C.__docgenInfo={description:`The one control here that does something rather than changing something.

It carries no caption of its own because its words already are one — a verb
and its object — and a caption in front of a button that reads \`Zoom to
selection\` says the same thing twice in a card that has room for neither.
@param props - See {@link OverlayActionProps}.
@returns The button, with its help.`,methods:[],displayName:`OverlayAction`,props:{text:{required:!0,tsType:{name:`string`},description:"What the button reads: a verb and its object, `Zoom to selection`."},onClick:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when it is pressed.`},icon:{required:!1,tsType:{name:`IconName`},description:`A glyph before the text. Never instead of it: an icon-only control in a
floating card is a control nobody presses.
@default undefined`},intent:{required:!1,tsType:{name:`Intent`},description:`What the button means, which is not whether it is pressed.
@default 'none'`}},composes:[`Omit`]}})))()}function E(e){let{label:t,value:n,options:r,onChange:i,keyWord:a,showKey:o}=e,{swatches:s,disabled:c=!1,disabledReason:d}=e,{placement:p=`bottom-end`,testId:h}=e,{metrics:g}=y(),_=(0,D.useId)(),[v,b]=(0,D.useState)(!1),x=n;for(let e of r)e.value===n&&(x=e.label);return(0,O.jsx)(f,{isOpen:v,disabled:c,placement:p,onInteraction:e=>b(e),content:(0,O.jsxs)(l,{role:`listbox`,"aria-labelledby":_,size:g.blueprintSize,style:k,children:[(0,O.jsx)(m,{title:t,titleId:_}),r.map(e=>(0,O.jsx)(u,{roleStructure:`listoption`,selected:e.value===n,text:e.label,htmlTitle:e.title,disabled:e.disabled,shouldDismissPopover:!1,onClick:()=>{i(e.value),b(!1)}},e.value))]}),children:(0,O.jsx)(S,{label:t,value:x,keyWord:a,showKey:o,swatches:s,active:v,disabled:c,disabledReason:d,testId:h,opensMenu:!0})})}var D,O,k;function A(){return(A=e((()=>{s(),p(),c(),d(),D=t(),x(),b(),O=n(),k={minWidth:168},E.__docgenInfo={description:`A setting written as its value, whose choices are a menu behind it.

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
@default 'bottom-end'`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the button.\n@default undefined"}}}})))()}function j(e){let{value:t,options:n,onChange:r,label:i,help:a,hideLabel:s=!1,disabled:c=!1,testId:l}=e,{metrics:u}=y(),d=_(),{appearance:f=d===void 0?`field`:`quiet`}=e;return f===`quiet`?(0,M.jsx)(h,{label:i,help:a,hideLabel:s,disabled:c,children:(0,M.jsx)(E,{label:i,value:t,options:n,onChange:r,showKey:!1,disabled:c,testId:l})}):(0,M.jsx)(h,{label:i,help:a,hideLabel:s,disabled:c,children:(0,M.jsx)(o,{value:t,disabled:c,large:u.blueprintSize===`large`,"aria-label":i,"data-testid":l,onChange:e=>r(e.currentTarget.value),children:n.map(e=>(0,M.jsx)(`option`,{value:e.value,title:e.title,disabled:e.disabled,children:e.label},e.value))})})}var M;function N(){return(N=e((()=>{a(),v(),A(),g(),b(),M=n(),j.__docgenInfo={description:`The picker a card reaches for once the choices stop fitting side by side.

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
@default 'quiet' inside an OverlayPanel, 'field' anywhere else`}}}})))()}export{C as a,A as i,N as n,T as o,E as r,j as t};