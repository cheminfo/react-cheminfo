import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-BDQJEmVY.js";import{n,t as r}from"./MenuButton-KNSrNNky.js";import{n as i,t as a}from"./CitationMenu-FOUpkg0h.js";function o(e){let{reference:t,label:n=`Cite`,...i}=e;return(0,s.jsx)(r,{...i,className:`citation-button`,icon:`citation`,label:n,menu:(0,s.jsx)(a,{reference:t})})}var s;function c(){return(c=e((()=>{n(),i(),s=t(),o.__docgenInfo={description:`The Cite entry of a site header: one button opening the article at its DOI,
the reference in the style a journal asks for, and the files a reference
manager imports.
@param props - The work being cited, and how the menu opens.
@returns The button and its menu.`,methods:[],displayName:`CiteButton`,props:{compact:{required:!1,tsType:{name:`boolean`},description:`Whether the button is reduced to its icon — no text, no caret — for a
header that has run out of room. The icon still opens the same menu.
@default false`},placement:{required:!1,tsType:{name:`PopoverNextProps['placement']`,raw:`PopoverNextProps['placement']`},description:`Side the menu opens on.
@default 'bottom-end'`},reference:{required:!0,tsType:{name:`Reference`},description:`The work the site asks to be cited.`},label:{required:!1,tsType:{name:`string`},description:`Text of the button. In a compact bar it is not written, but it stays what
the pointer and a screen reader are told.
@default 'Cite'`}}}})))()}export{c as n,o as t};