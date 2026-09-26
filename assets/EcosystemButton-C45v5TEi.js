import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-C_0-xZ4H.js";import{n,t as r}from"./useT-DdDrCs00.js";import{n as i}from"./joinClassNames-BbK_6p9Z.js";import{n as a,t as o}from"./MenuButton-Bwr54ypu.js";import{n as s,t as c}from"./EcosystemMenu-bVPOY7Da.js";function l(e){let{currentSiteId:t,label:r,className:a,...s}=e,l=n();return(0,u.jsx)(o,{...s,className:i(`ecosystem-button`,a),icon:`grid-view`,label:r??l(`ecosystem.tools`),menu:(0,u.jsx)(c,{currentSiteId:t})})}var u;function d(){return(d=e((()=>{r(),a(),s(),u=t(),l.__docgenInfo={description:`The Tools entry of a site header: one button opening every other site of the
family, each behind its own little logo.
@param props - The site it sits on, and how the menu opens.
@returns The button and its menu.`,methods:[],displayName:`EcosystemButton`,props:{compact:{required:!1,tsType:{name:`boolean`},description:`Whether the text is left out of the button altogether, rather than only
hidden: a bar that has run out of room drops the caret with it. The glyph
names itself through its tooltip either way.
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
| 'osiris'
| 'atoms'
| 'moles'
| 'inorganic'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`},{name:`literal`,value:`'atoms'`},{name:`literal`,value:`'moles'`},{name:`literal`,value:`'inorganic'`}]},description:`The site this button sits on, which is shown but never linked.
@default undefined`},label:{required:!1,tsType:{name:`string`},description:`Text of the button. In a compact bar it is not written, but it stays what
the pointer and a screen reader are told.
@default the chrome's own word for it, in the language of the page`},className:{required:!1,tsType:{name:`string`},description:`Class names added to the root element, after the component's own.
@default undefined`}}}})))()}export{d as n,l as t};