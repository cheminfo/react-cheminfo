import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-t3BKuE7o.js";import{n}from"./joinClassNames-BbK_6p9Z.js";import{n as r,t as i}from"./MenuButton-Bgvxa1_N.js";import{n as a,t as o}from"./EcosystemMenu-CoBq_W1v.js";function s(e){let{currentSiteId:t,label:r=`Tools`,className:a,...s}=e;return(0,c.jsx)(i,{...s,className:n(`ecosystem-button`,a),icon:`grid-view`,label:r,menu:(0,c.jsx)(o,{currentSiteId:t})})}var c;function l(){return(l=e((()=>{r(),a(),c=t(),s.__docgenInfo={description:`The Tools entry of a site header: one button opening every other site of the
family, each behind its own little logo.
@param props - The site it sits on, and how the menu opens.
@returns The button and its menu.`,methods:[],displayName:`EcosystemButton`,props:{compact:{required:!1,tsType:{name:`boolean`},description:`Whether the button is reduced to its icon — no text, no caret — for a
header that has run out of room. The icon still opens the same menu.
@default false`},placement:{required:!1,tsType:{name:`PopoverNextProps['placement']`,raw:`PopoverNextProps['placement']`},description:`Side the menu opens on.
@default 'bottom-end'`},currentSiteId:{required:!1,tsType:{name:`union`,raw:`| 'learn'
| 'inchi'
| 'vcl'
| 'smiles'
| 'openbabel'
| 'chemcalc'
| 'dbe'
| 'nmrium'
| 'metabo'
| 'derepflow'
| 'surge'
| 'tex'
| 'lcao'
| 'regexp'
| 'pdb'
| 'elucidation'
| 'equilibrium'
| 'polycarp'
| '3d'
| 'periodic-table'
| 'database'
| 'symmetry'
| 'osiris'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`}]},description:`The site this button sits on, which is shown but never linked.
@default undefined`},label:{required:!1,tsType:{name:`string`},description:`Text of the button. In a compact bar it is not written, but it stays what
the pointer and a screen reader are told.
@default 'Tools'`},className:{required:!1,tsType:{name:`string`},description:`Class names added to the root element, after the component's own.
@default undefined`}}}})))()}export{l as n,s as t};