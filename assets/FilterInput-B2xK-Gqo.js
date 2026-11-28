import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-aRVavQD_.js";import{n,t as r}from"./useT-BORbKjvp.js";import{n as i,r as a}from"./buttons-DaxO8CbN.js";import{n as o,t as s}from"./inputGroup-CXMDz_Mw.js";function c(e){let{label:t,onClick:n}=e;return(0,l.jsx)(i,{className:`no-print`,variant:`minimal`,icon:`cross`,"aria-label":t,title:t,onClick:n})}var l;function u(){return(u=e((()=>{a(),l=t(),c.__docgenInfo={description:`The cross that empties a box, worn inside it as Blueprint's \`rightElement\`.

Blueprint has no clearable input of its own; what it has is the slot, and a
minimal cross button in it is the shape its own examples use. Which is why
this carries no \`size\`: the input group sizes whatever is put in the slot
from its own size class — 20 square inside a small box, 24 inside a medium
one — so a button that stated a size of its own would only be able to
disagree with the box it is in.

One component rather than eight lines repeated at each box, because the
cross has to be the same size, the same colour and in the same place
everywhere or it reads as a different control each time.
@param props - What clearing achieves, and what to do about it.
@returns The button, for an \`InputGroup\`'s \`rightElement\`.`,methods:[],displayName:`ClearButton`,props:{label:{required:!0,tsType:{name:`string`},description:'What emptying the box does, said as the thing it achieves rather than as\n"clear" — a screen reader and a hovering pointer both get this one line,\nand `Leave green out` says what `Clear` does not.'},onClick:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when it is clicked, with the box left for the caller to empty.`}}}})))()}function d(e){let{value:t,onValueChange:r,placeholder:i,autoFocus:a=!1}=e,{ariaLabel:o,onEnter:l}=e,u=n();return(0,f.jsx)(s,{autoFocus:a,leftIcon:`search`,size:`small`,value:t,placeholder:i,"aria-label":o,spellCheck:!1,autoCapitalize:`off`,autoCorrect:`off`,autoComplete:`off`,rightElement:t.length>0?(0,f.jsx)(c,{label:u(`panel.clearFilter`),onClick:()=>r(``)}):void 0,onValueChange:r,onKeyDown:l===void 0?void 0:e=>{e.key!==`Enter`||e.nativeEvent.isComposing||(e.preventDefault(),l())}})}var f;function p(){return(p=e((()=>{o(),r(),u(),f=t(),d.__docgenInfo={description:`The box a list is filtered through, with a cross to empty it again.

A filter left behind hides entries that are still there, and a peak table is
exactly where that goes unnoticed — a spectrum with three peaks in it looks
like a spectrum with three peaks in it. So every list that offers a filter
also offers one click back to the whole of it rather than a held backspace.

Every correction the browser offers is turned off: a formula, an m/z and a
residue name are neither words nor sentences, and a mobile keyboard
capitalising \`mNa+\` or autocorrecting \`Hex\` is how a query stops matching
anything.
@param props - Component props.
@returns The box.`,methods:[],displayName:`FilterInput`,props:{value:{required:!0,tsType:{name:`string`},description:`What the user typed.`},onValueChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: string) => void`,signature:{arguments:[{type:{name:`string`},name:`value`}],return:{name:`void`}}},description:"Called with what the user typed, and with `''` when the cross is clicked."},placeholder:{required:!0,tsType:{name:`string`},description:`What the box says while it is empty.`},autoFocus:{required:!1,tsType:{name:`boolean`},description:`Whether the box takes the caret as it appears, for the times it is revealed
by a click on a toolbar item somewhere else.
@default false`},ariaLabel:{required:!1,tsType:{name:`string`},description:`What a screen reader calls the box.
@default undefined — the placeholder names it`},onEnter:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when Enter is pressed in the box, to open the entry the filter
leads to.
@default undefined — Enter does nothing`}}}})))()}export{p as n,d as t};