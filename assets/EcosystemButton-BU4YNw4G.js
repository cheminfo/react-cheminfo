import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-BDQJEmVY.js";import{n,t as r}from"./MenuButton-KNSrNNky.js";import{n as i,t as a}from"./EcosystemMenu-DFWe5Qx3.js";function o(e){let{currentSiteId:t,label:n=`Tools`,...i}=e;return(0,s.jsx)(r,{...i,className:`ecosystem-button`,icon:`grid-view`,label:n,menu:(0,s.jsx)(a,{currentSiteId:t})})}var s;function c(){return(c=e((()=>{n(),i(),s=t(),o.__docgenInfo={description:`The Tools entry of a site header: one button opening every other site of the
family, each behind its own little logo.
@param props - The site it sits on, and how the menu opens.
@returns The button and its menu.`,methods:[],displayName:`EcosystemButton`,props:{compact:{required:!1,tsType:{name:`boolean`},description:`Whether the button is reduced to its icon — no text, no caret — for a
header that has run out of room. The icon still opens the same menu.
@default false`},placement:{required:!1,tsType:{name:`PopoverNextProps['placement']`,raw:`PopoverNextProps['placement']`},description:`Side the menu opens on.
@default 'bottom-end'`},currentSiteId:{required:!1,tsType:{name:`union`,raw:`| 'inchi'
| 'vcl'
| 'smiles'
| 'chemcalc'
| 'nmrium'
| 'surge'
| 'tex'
| 'lcao'
| 'regexp'
| 'pdb'
| 'elucidation'
| 'equilibrium'
| 'polycarp'
| '3d'
| 'pt'`,elements:[{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'pt'`}]},description:`The site this button sits on, which is shown but never linked.
@default undefined`},label:{required:!1,tsType:{name:`string`},description:`Text of the button. In a compact bar it is not written, but it stays what
the pointer and a screen reader are told.
@default 'Tools'`}}}})))()}export{c as n,o as t};